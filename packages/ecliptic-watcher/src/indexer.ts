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

import EclipticArtifacts from './artifacts/Ecliptic.json';
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

const KIND_ECLIPTIC = 'Ecliptic';

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

    const { abi: EclipticABI } = EclipticArtifacts;

    assert(EclipticABI);
    this._abiMap.set(KIND_ECLIPTIC, EclipticABI);

    const EclipticContractInterface = new ethers.utils.Interface(EclipticABI);
    this._contractMap.set(KIND_ECLIPTIC, EclipticContractInterface);

    const EclipticEventSignatures = Object.values(EclipticContractInterface.events).map(value => {
      return EclipticContractInterface.getEventTopic(value);
    });
    this.eventSignaturesMap.set(KIND_ECLIPTIC, EclipticEventSignatures);
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

  getResultEvent (event: Event): ResultEvent {
    return getResultEvent(event);
  }

  async supportsInterface (blockHash: string, contractAddress: string, _interfaceId: string): Promise<ValueResult> {
    const entity = await this._db.getSupportsInterface({ blockHash, contractAddress, _interfaceId });
    if (entity) {
      log('supportsInterface: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    log('supportsInterface: db miss, fetching from upstream server');

    const abi = this._abiMap.get(KIND_ECLIPTIC);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const contractResult = await contract.supportsInterface(_interfaceId, { blockTag: blockHash });

    const value = contractResult;
    const result: ValueResult = { value };

    await this._db.saveSupportsInterface({ blockHash, blockNumber, contractAddress, _interfaceId, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async name (blockHash: string, contractAddress: string): Promise<ValueResult> {
    const entity = await this._db.getName({ blockHash, contractAddress });
    if (entity) {
      log('name: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    log('name: db miss, fetching from upstream server');

    const abi = this._abiMap.get(KIND_ECLIPTIC);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const contractResult = await contract.name({ blockTag: blockHash });

    const value = contractResult;
    const result: ValueResult = { value };

    await this._db.saveName({ blockHash, blockNumber, contractAddress, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async symbol (blockHash: string, contractAddress: string): Promise<ValueResult> {
    const entity = await this._db.getSymbol({ blockHash, contractAddress });
    if (entity) {
      log('symbol: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    log('symbol: db miss, fetching from upstream server');

    const abi = this._abiMap.get(KIND_ECLIPTIC);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const contractResult = await contract.symbol({ blockTag: blockHash });

    const value = contractResult;
    const result: ValueResult = { value };

    await this._db.saveSymbol({ blockHash, blockNumber, contractAddress, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async tokenURI (blockHash: string, contractAddress: string, _tokenId: bigint): Promise<ValueResult> {
    const entity = await this._db.getTokenURI({ blockHash, contractAddress, _tokenId });
    if (entity) {
      log('tokenURI: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    log('tokenURI: db miss, fetching from upstream server');

    const abi = this._abiMap.get(KIND_ECLIPTIC);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const contractResult = await contract.tokenURI(_tokenId, { blockTag: blockHash });

    const value = contractResult;
    const result: ValueResult = { value };

    await this._db.saveTokenURI({ blockHash, blockNumber, contractAddress, _tokenId, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async balanceOf (blockHash: string, contractAddress: string, _owner: string): Promise<ValueResult> {
    const entity = await this._db.getBalanceOf({ blockHash, contractAddress, _owner });
    if (entity) {
      log('balanceOf: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    log('balanceOf: db miss, fetching from upstream server');

    const abi = this._abiMap.get(KIND_ECLIPTIC);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const contractResult = await contract.balanceOf(_owner, { blockTag: blockHash });

    const value = ethers.BigNumber.from(contractResult).toBigInt();

    const result: ValueResult = { value };

    await this._db.saveBalanceOf({ blockHash, blockNumber, contractAddress, _owner, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async ownerOf (blockHash: string, contractAddress: string, _tokenId: bigint): Promise<ValueResult> {
    const entity = await this._db.getOwnerOf({ blockHash, contractAddress, _tokenId });
    if (entity) {
      log('ownerOf: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    log('ownerOf: db miss, fetching from upstream server');

    const abi = this._abiMap.get(KIND_ECLIPTIC);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const contractResult = await contract.ownerOf(_tokenId, { blockTag: blockHash });

    const value = contractResult;
    const result: ValueResult = { value };

    await this._db.saveOwnerOf({ blockHash, blockNumber, contractAddress, _tokenId, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async exists (blockHash: string, contractAddress: string, _tokenId: bigint): Promise<ValueResult> {
    const entity = await this._db.getExists({ blockHash, contractAddress, _tokenId });
    if (entity) {
      log('exists: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    log('exists: db miss, fetching from upstream server');

    const abi = this._abiMap.get(KIND_ECLIPTIC);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const contractResult = await contract.exists(_tokenId, { blockTag: blockHash });

    const value = contractResult;
    const result: ValueResult = { value };

    await this._db.saveExists({ blockHash, blockNumber, contractAddress, _tokenId, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async getApproved (blockHash: string, contractAddress: string, _tokenId: bigint): Promise<ValueResult> {
    const entity = await this._db.getGetApproved({ blockHash, contractAddress, _tokenId });
    if (entity) {
      log('getApproved: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    log('getApproved: db miss, fetching from upstream server');

    const abi = this._abiMap.get(KIND_ECLIPTIC);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const contractResult = await contract.getApproved(_tokenId, { blockTag: blockHash });

    const value = contractResult;
    const result: ValueResult = { value };

    await this._db.saveGetApproved({ blockHash, blockNumber, contractAddress, _tokenId, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async isApprovedForAll (blockHash: string, contractAddress: string, _owner: string, _operator: string): Promise<ValueResult> {
    const entity = await this._db.getIsApprovedForAll({ blockHash, contractAddress, _owner, _operator });
    if (entity) {
      log('isApprovedForAll: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    log('isApprovedForAll: db miss, fetching from upstream server');

    const abi = this._abiMap.get(KIND_ECLIPTIC);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const contractResult = await contract.isApprovedForAll(_owner, _operator, { blockTag: blockHash });

    const value = contractResult;
    const result: ValueResult = { value };

    await this._db.saveIsApprovedForAll({ blockHash, blockNumber, contractAddress, _owner, _operator, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async getSpawnLimit (blockHash: string, contractAddress: string, _point: bigint, _time: bigint): Promise<ValueResult> {
    const entity = await this._db.getGetSpawnLimit({ blockHash, contractAddress, _point, _time });
    if (entity) {
      log('getSpawnLimit: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    log('getSpawnLimit: db miss, fetching from upstream server');

    const abi = this._abiMap.get(KIND_ECLIPTIC);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const contractResult = await contract.getSpawnLimit(_point, _time, { blockTag: blockHash });

    const value = ethers.BigNumber.from(contractResult).toBigInt();

    const result: ValueResult = { value };

    await this._db.saveGetSpawnLimit({ blockHash, blockNumber, contractAddress, _point, _time, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async canEscapeTo (blockHash: string, contractAddress: string, _point: bigint, _sponsor: bigint): Promise<ValueResult> {
    const entity = await this._db.getCanEscapeTo({ blockHash, contractAddress, _point, _sponsor });
    if (entity) {
      log('canEscapeTo: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    log('canEscapeTo: db miss, fetching from upstream server');

    const abi = this._abiMap.get(KIND_ECLIPTIC);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const contractResult = await contract.canEscapeTo(_point, _sponsor, { blockTag: blockHash });

    const value = contractResult;
    const result: ValueResult = { value };

    await this._db.saveCanEscapeTo({ blockHash, blockNumber, contractAddress, _point, _sponsor, value: result.value, proof: JSONbigNative.stringify(result.proof) });

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

  parseEventNameAndArgs (kind: string, logObj: any): any {
    const { topics, data } = logObj;

    const contract = this._contractMap.get(kind);
    assert(contract);

    const logDescription = contract.parseLog({ data, topics });

    const { eventName, eventInfo, eventSignature } = this._baseIndexer.parseEvent(logDescription);

    return {
      eventName,
      eventInfo,
      eventSignature
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
    return this._baseIndexer.getEventsInRange(fromBlockNumber, toBlockNumber, this._serverConfig.maxEventsBlockRange);
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

  async getAncestorAtDepth (blockHash: string, depth: number): Promise<string> {
    return this._baseIndexer.getAncestorAtDepth(blockHash, depth);
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
}
