//
// Copyright 2021 Vulcanize, Inc.
//

import assert from 'assert';
import { DeepPartial, FindConditions, FindManyOptions } from 'typeorm';
import debug from 'debug';
import JSONbig from 'json-bigint';
import { ethers, constants } from 'ethers';

import { JsonFragment } from '@ethersproject/abi';
import { BaseProvider } from '@ethersproject/providers';
import { MappingKey, StorageLayout } from '@cerc-io/solidity-mapper';
import {
  Indexer as BaseIndexer,
  IndexerInterface,
  ValueResult,
  ServerConfig,
  JobQueue,
  Where,
  QueryOptions,
  StateKind,
  StateStatus,
  ResultEvent,
  getResultEvent,
  DatabaseInterface,
  Clients,
  EthClient,
  UpstreamConfig,
  EthFullBlock,
  EthFullTransaction,
  ExtraEventData
} from '@cerc-io/util';

import DelegatedSendingArtifacts from './artifacts/DelegatedSending.json';
import { Database, ENTITIES } from './database';
import { createInitialState, handleEvent, createStateDiff, createStateCheckpoint } from './hooks';
import { Contract } from './entity/Contract';
import { Event } from './entity/Event';
import { SyncStatus } from './entity/SyncStatus';
import { StateSyncStatus } from './entity/StateSyncStatus';
import { BlockProgress } from './entity/BlockProgress';
import { State } from './entity/State';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const log = debug('vulcanize:indexer');
const JSONbigNative = JSONbig({ useNativeBigInt: true });

const KIND_DELEGATEDSENDING = 'DelegatedSending';

export class Indexer implements IndexerInterface {
  _db: Database;
  _ethClient: EthClient;
  _ethProvider: BaseProvider;
  _baseIndexer: BaseIndexer;
  _serverConfig: ServerConfig;
  _upstreamConfig: UpstreamConfig;

  _abiMap: Map<string, JsonFragment[]>;
  _storageLayoutMap: Map<string, StorageLayout>;
  _contractMap: Map<string, ethers.utils.Interface>;
  eventSignaturesMap: Map<string, string[]>;

  constructor (
    config: {
      server: ServerConfig;
      upstream: UpstreamConfig;
    },
    db: DatabaseInterface,
    clients: Clients,
    ethProvider: BaseProvider,
    jobQueue: JobQueue
  ) {
    assert(db);
    assert(clients.ethClient);

    this._db = db as Database;
    this._ethClient = clients.ethClient;
    this._ethProvider = ethProvider;
    this._serverConfig = config.server;
    this._upstreamConfig = config.upstream;
    this._baseIndexer = new BaseIndexer(config, this._db, this._ethClient, this._ethProvider, jobQueue);

    this._abiMap = new Map();
    this._storageLayoutMap = new Map();
    this._contractMap = new Map();
    this.eventSignaturesMap = new Map();

    const { abi: DelegatedSendingABI } = DelegatedSendingArtifacts;

    assert(DelegatedSendingABI);
    this._abiMap.set(KIND_DELEGATEDSENDING, DelegatedSendingABI);

    const DelegatedSendingContractInterface = new ethers.utils.Interface(DelegatedSendingABI);
    this._contractMap.set(KIND_DELEGATEDSENDING, DelegatedSendingContractInterface);

    const DelegatedSendingEventSignatures = Object.values(DelegatedSendingContractInterface.events).map(value => {
      return DelegatedSendingContractInterface.getEventTopic(value);
    });
    this.eventSignaturesMap.set(KIND_DELEGATEDSENDING, DelegatedSendingEventSignatures);
  }

  get serverConfig (): ServerConfig {
    return this._serverConfig;
  }

  get upstreamConfig (): UpstreamConfig {
    return this._upstreamConfig;
  }

  get storageLayoutMap (): Map<string, StorageLayout> {
    return this._storageLayoutMap;
  }

  async init (): Promise<void> {
    await this._baseIndexer.fetchContracts();
    await this._baseIndexer.fetchStateStatus();
  }

  switchClients ({ ethClient, ethProvider }: { ethClient: EthClient, ethProvider: BaseProvider }): void {
    this._ethClient = ethClient;
    this._ethProvider = ethProvider;
    this._baseIndexer.switchClients({ ethClient, ethProvider });
  }

  getResultEvent (event: Event): ResultEvent {
    return getResultEvent(event);
  }

  async canSend (blockHash: string, contractAddress: string, _as: bigint, _point: bigint): Promise<ValueResult> {
    const entity = await this._db.getCanSend({ blockHash, contractAddress, _as, _point });
    if (entity) {
      log('canSend: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    log('canSend: db miss, fetching from upstream server');

    const abi = this._abiMap.get(KIND_DELEGATEDSENDING);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const contractResult = await contract.canSend(_as, _point, { blockTag: blockHash });

    const value = contractResult;
    const result: ValueResult = { value };

    await this._db.saveCanSend({ blockHash, blockNumber, contractAddress, _as, _point, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async canReceive (blockHash: string, contractAddress: string, _recipient: string): Promise<ValueResult> {
    const entity = await this._db.getCanReceive({ blockHash, contractAddress, _recipient });
    if (entity) {
      log('canReceive: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    log('canReceive: db miss, fetching from upstream server');

    const abi = this._abiMap.get(KIND_DELEGATEDSENDING);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const contractResult = await contract.canReceive(_recipient, { blockTag: blockHash });

    const value = contractResult;
    const result: ValueResult = { value };

    await this._db.saveCanReceive({ blockHash, blockNumber, contractAddress, _recipient, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async getStorageValue (storageLayout: StorageLayout, blockHash: string, contractAddress: string, variable: string, ...mappingKeys: MappingKey[]): Promise<ValueResult> {
    return this._baseIndexer.getStorageValue(
      storageLayout,
      blockHash,
      contractAddress,
      variable,
      ...mappingKeys
    );
  }

  async getEntitiesForBlock (blockHash: string, tableName: string): Promise<any[]> {
    return this._db.getEntitiesForBlock(blockHash, tableName);
  }

  async processInitialState (contractAddress: string, blockHash: string): Promise<any> {
    // Call initial state hook.
    return createInitialState(this, contractAddress, blockHash);
  }

  async processStateCheckpoint (contractAddress: string, blockHash: string): Promise<boolean> {
    // Call checkpoint hook.
    return createStateCheckpoint(this, contractAddress, blockHash);
  }

  async processCanonicalBlock (blockHash: string): Promise<void> {
    console.time('time:indexer#processCanonicalBlock-finalize_auto_diffs');
    // Finalize staged diff blocks if any.
    await this._baseIndexer.finalizeDiffStaged(blockHash);
    console.timeEnd('time:indexer#processCanonicalBlock-finalize_auto_diffs');

    // Call custom stateDiff hook.
    await createStateDiff(this, blockHash);
  }

  async processCheckpoint (blockHash: string): Promise<void> {
    // Return if checkpointInterval is <= 0.
    const checkpointInterval = this._serverConfig.checkpointInterval;
    if (checkpointInterval <= 0) return;

    console.time('time:indexer#processCheckpoint-checkpoint');
    await this._baseIndexer.processCheckpoint(this, blockHash, checkpointInterval);
    console.timeEnd('time:indexer#processCheckpoint-checkpoint');
  }

  async processCLICheckpoint (contractAddress: string, blockHash?: string): Promise<string | undefined> {
    return this._baseIndexer.processCLICheckpoint(this, contractAddress, blockHash);
  }

  async getPrevState (blockHash: string, contractAddress: string, kind?: string): Promise<State | undefined> {
    return this._db.getPrevState(blockHash, contractAddress, kind);
  }

  async getLatestState (contractAddress: string, kind: StateKind | null, blockNumber?: number): Promise<State | undefined> {
    return this._db.getLatestState(contractAddress, kind, blockNumber);
  }

  async getStatesByHash (blockHash: string): Promise<State[]> {
    return this._baseIndexer.getStatesByHash(blockHash);
  }

  async getStateByCID (cid: string): Promise<State | undefined> {
    return this._baseIndexer.getStateByCID(cid);
  }

  async getStates (where: FindConditions<State>): Promise<State[]> {
    return this._db.getStates(where);
  }

  getStateData (state: State): any {
    return this._baseIndexer.getStateData(state);
  }

  // Method used to create auto diffs (diff_staged).
  async createDiffStaged (contractAddress: string, blockHash: string, data: any): Promise<void> {
    console.time('time:indexer#createDiffStaged-auto_diff');
    await this._baseIndexer.createDiffStaged(contractAddress, blockHash, data);
    console.timeEnd('time:indexer#createDiffStaged-auto_diff');
  }

  // Method to be used by createStateDiff hook.
  async createDiff (contractAddress: string, blockHash: string, data: any): Promise<void> {
    const block = await this.getBlockProgress(blockHash);
    assert(block);

    await this._baseIndexer.createDiff(contractAddress, block, data);
  }

  // Method to be used by createStateCheckpoint hook.
  async createStateCheckpoint (contractAddress: string, blockHash: string, data: any): Promise<void> {
    const block = await this.getBlockProgress(blockHash);
    assert(block);

    return this._baseIndexer.createStateCheckpoint(contractAddress, block, data);
  }

  // Method to be used by export-state CLI.
  async createCheckpoint (contractAddress: string, blockHash: string): Promise<string | undefined> {
    const block = await this.getBlockProgress(blockHash);
    assert(block);

    return this._baseIndexer.createCheckpoint(this, contractAddress, block);
  }

  async saveOrUpdateState (state: State): Promise<State> {
    return this._baseIndexer.saveOrUpdateState(state);
  }

  async removeStates (blockNumber: number, kind: StateKind): Promise<void> {
    await this._baseIndexer.removeStates(blockNumber, kind);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async triggerIndexingOnEvent (event: Event, extraData: ExtraEventData): Promise<void> {
    const resultEvent = this.getResultEvent(event);

    // Call custom hook function for indexing on event.
    await handleEvent(this, resultEvent);
  }

  async processEvent (event: Event, extraData: ExtraEventData): Promise<void> {
    // Trigger indexing of data based on the event.
    await this.triggerIndexingOnEvent(event, extraData);
  }

  async processBlock (blockProgress: BlockProgress): Promise<void> {
    console.time('time:indexer#processBlock-init_state');
    // Call a function to create initial state for contracts.
    await this._baseIndexer.createInit(this, blockProgress.blockHash, blockProgress.blockNumber);
    console.timeEnd('time:indexer#processBlock-init_state');
  }

  parseEventNameAndArgs (kind: string, logObj: any): { eventParsed: boolean, eventDetails: any } {
    const { topics, data } = logObj;

    const contract = this._contractMap.get(kind);
    assert(contract);

    let logDescription: ethers.utils.LogDescription;
    try {
      logDescription = contract.parseLog({ data, topics });
    } catch (err) {
      // Return if no matching event found
      if ((err as Error).message.includes('no matching event')) {
        log(`WARNING: Skipping event for contract ${kind} as no matching event found in the ABI`);
        return { eventParsed: false, eventDetails: {} };
      }

      throw err;
    }

    const { eventName, eventInfo, eventSignature } = this._baseIndexer.parseEvent(logDescription);

    return {
      eventParsed: true,
      eventDetails: {
        eventName,
        eventInfo,
        eventSignature
      }
    };
  }

  async getStateSyncStatus (): Promise<StateSyncStatus | undefined> {
    return this._db.getStateSyncStatus();
  }

  async updateStateSyncStatusIndexedBlock (blockNumber: number, force?: boolean): Promise<StateSyncStatus | undefined> {
    if (!this._serverConfig.enableState) {
      return;
    }

    const dbTx = await this._db.createTransactionRunner();
    let res;

    try {
      res = await this._db.updateStateSyncStatusIndexedBlock(dbTx, blockNumber, force);
      await dbTx.commitTransaction();
    } catch (error) {
      await dbTx.rollbackTransaction();
      throw error;
    } finally {
      await dbTx.release();
    }

    return res;
  }

  async updateStateSyncStatusCheckpointBlock (blockNumber: number, force?: boolean): Promise<StateSyncStatus> {
    const dbTx = await this._db.createTransactionRunner();
    let res;

    try {
      res = await this._db.updateStateSyncStatusCheckpointBlock(dbTx, blockNumber, force);
      await dbTx.commitTransaction();
    } catch (error) {
      await dbTx.rollbackTransaction();
      throw error;
    } finally {
      await dbTx.release();
    }

    return res;
  }

  async getLatestCanonicalBlock (): Promise<BlockProgress | undefined> {
    const syncStatus = await this.getSyncStatus();
    assert(syncStatus);

    if (syncStatus.latestCanonicalBlockHash === constants.HashZero) {
      return;
    }

    const latestCanonicalBlock = await this.getBlockProgress(syncStatus.latestCanonicalBlockHash);
    assert(latestCanonicalBlock);

    return latestCanonicalBlock;
  }

  async getLatestStateIndexedBlock (): Promise<BlockProgress> {
    return this._baseIndexer.getLatestStateIndexedBlock();
  }

  async watchContract (address: string, kind: string, checkpoint: boolean, startingBlock: number, context?: any): Promise<void> {
    return this._baseIndexer.watchContract(address, kind, checkpoint, startingBlock, context);
  }

  updateStateStatusMap (address: string, stateStatus: StateStatus): void {
    this._baseIndexer.updateStateStatusMap(address, stateStatus);
  }

  cacheContract (contract: Contract): void {
    return this._baseIndexer.cacheContract(contract);
  }

  async saveEventEntity (dbEvent: Event): Promise<Event> {
    return this._baseIndexer.saveEventEntity(dbEvent);
  }

  async saveEvents (dbEvents: Event[]): Promise<void> {
    return this._baseIndexer.saveEvents(dbEvents);
  }

  async getEventsByFilter (blockHash: string, contract?: string, name?: string): Promise<Array<Event>> {
    return this._baseIndexer.getEventsByFilter(blockHash, contract, name);
  }

  isWatchedContract (address : string): Contract | undefined {
    return this._baseIndexer.isWatchedContract(address);
  }

  getWatchedContracts (): Contract[] {
    return this._baseIndexer.getWatchedContracts();
  }

  getContractsByKind (kind: string): Contract[] {
    return this._baseIndexer.getContractsByKind(kind);
  }

  async getProcessedBlockCountForRange (fromBlockNumber: number, toBlockNumber: number): Promise<{ expected: number, actual: number }> {
    return this._baseIndexer.getProcessedBlockCountForRange(fromBlockNumber, toBlockNumber);
  }

  async getEventsInRange (fromBlockNumber: number, toBlockNumber: number): Promise<Array<Event>> {
    return this._baseIndexer.getEventsInRange(fromBlockNumber, toBlockNumber, this._serverConfig.gql.maxEventsBlockRange);
  }

  async getSyncStatus (): Promise<SyncStatus | undefined> {
    return this._baseIndexer.getSyncStatus();
  }

  async getBlocks (blockFilter: { blockHash?: string, blockNumber?: number }): Promise<any> {
    return this._baseIndexer.getBlocks(blockFilter);
  }

  async updateSyncStatusIndexedBlock (blockHash: string, blockNumber: number, force = false): Promise<SyncStatus> {
    return this._baseIndexer.updateSyncStatusIndexedBlock(blockHash, blockNumber, force);
  }

  async updateSyncStatusChainHead (blockHash: string, blockNumber: number, force = false): Promise<SyncStatus> {
    return this._baseIndexer.updateSyncStatusChainHead(blockHash, blockNumber, force);
  }

  async updateSyncStatusCanonicalBlock (blockHash: string, blockNumber: number, force = false): Promise<SyncStatus> {
    const syncStatus = this._baseIndexer.updateSyncStatusCanonicalBlock(blockHash, blockNumber, force);

    return syncStatus;
  }

  async updateSyncStatusProcessedBlock (blockHash: string, blockNumber: number, force = false): Promise<SyncStatus> {
    return this._baseIndexer.updateSyncStatusProcessedBlock(blockHash, blockNumber, force);
  }

  async updateSyncStatusIndexingError (hasIndexingError: boolean): Promise<SyncStatus | undefined> {
    return this._baseIndexer.updateSyncStatusIndexingError(hasIndexingError);
  }

  async updateSyncStatus (syncStatus: DeepPartial<SyncStatus>): Promise<SyncStatus> {
    return this._baseIndexer.updateSyncStatus(syncStatus);
  }

  async getEvent (id: string): Promise<Event | undefined> {
    return this._baseIndexer.getEvent(id);
  }

  async getBlockProgress (blockHash: string): Promise<BlockProgress | undefined> {
    return this._baseIndexer.getBlockProgress(blockHash);
  }

  async getBlockProgressEntities (where: FindConditions<BlockProgress>, options: FindManyOptions<BlockProgress>): Promise<BlockProgress[]> {
    return this._baseIndexer.getBlockProgressEntities(where, options);
  }

  async getBlocksAtHeight (height: number, isPruned: boolean): Promise<BlockProgress[]> {
    return this._baseIndexer.getBlocksAtHeight(height, isPruned);
  }

  async fetchAndSaveFilteredEventsAndBlocks (startBlock: number, endBlock: number): Promise<{
    blockProgress: BlockProgress,
    events: DeepPartial<Event>[],
    ethFullBlock: EthFullBlock;
    ethFullTransactions: EthFullTransaction[];
  }[]> {
    return this._baseIndexer.fetchAndSaveFilteredEventsAndBlocks(startBlock, endBlock, this.eventSignaturesMap, this.parseEventNameAndArgs.bind(this));
  }

  async fetchEventsForContracts (blockHash: string, blockNumber: number, addresses: string[]): Promise<DeepPartial<Event>[]> {
    return this._baseIndexer.fetchEventsForContracts(blockHash, blockNumber, addresses, this.eventSignaturesMap, this.parseEventNameAndArgs.bind(this));
  }

  async saveBlockAndFetchEvents (block: DeepPartial<BlockProgress>): Promise<[
    BlockProgress,
    DeepPartial<Event>[],
    EthFullTransaction[]
  ]> {
    return this._saveBlockAndFetchEvents(block);
  }

  async getBlockEvents (blockHash: string, where: Where, queryOptions: QueryOptions): Promise<Array<Event>> {
    return this._baseIndexer.getBlockEvents(blockHash, where, queryOptions);
  }

  async removeUnknownEvents (block: BlockProgress): Promise<void> {
    return this._baseIndexer.removeUnknownEvents(Event, block);
  }

  async markBlocksAsPruned (blocks: BlockProgress[]): Promise<void> {
    await this._baseIndexer.markBlocksAsPruned(blocks);
  }

  async updateBlockProgress (block: BlockProgress, lastProcessedEventIndex: number): Promise<BlockProgress> {
    return this._baseIndexer.updateBlockProgress(block, lastProcessedEventIndex);
  }

  async getAncestorAtHeight (blockHash: string, height: number): Promise<string> {
    return this._baseIndexer.getAncestorAtHeight(blockHash, height);
  }

  async resetWatcherToBlock (blockNumber: number): Promise<void> {
    const entities = [...ENTITIES];
    await this._baseIndexer.resetWatcherToBlock(blockNumber, entities);
  }

  async clearProcessedBlockData (block: BlockProgress): Promise<void> {
    const entities = [...ENTITIES];
    await this._baseIndexer.clearProcessedBlockData(block, entities);
  }

  async _saveBlockAndFetchEvents ({
    cid: blockCid,
    blockHash,
    blockNumber,
    blockTimestamp,
    parentHash
  }: DeepPartial<BlockProgress>): Promise<[
    BlockProgress,
    DeepPartial<Event>[],
    EthFullTransaction[]
  ]> {
    assert(blockHash);
    assert(blockNumber);

    const { events: dbEvents, transactions } = await this._baseIndexer.fetchEvents(blockHash, blockNumber, this.eventSignaturesMap, this.parseEventNameAndArgs.bind(this));

    const dbTx = await this._db.createTransactionRunner();
    try {
      const block = {
        cid: blockCid,
        blockHash,
        blockNumber,
        blockTimestamp,
        parentHash
      };

      console.time(`time:indexer#_saveBlockAndFetchEvents-db-save-${blockNumber}`);
      const blockProgress = await this._db.saveBlockWithEvents(dbTx, block, dbEvents);
      await dbTx.commitTransaction();
      console.timeEnd(`time:indexer#_saveBlockAndFetchEvents-db-save-${blockNumber}`);

      return [blockProgress, [], transactions];
    } catch (error) {
      await dbTx.rollbackTransaction();
      throw error;
    } finally {
      await dbTx.release();
    }
  }

  async getFullTransactions (txHashList: string[]): Promise<EthFullTransaction[]> {
    return this._baseIndexer.getFullTransactions(txHashList);
  }
}
