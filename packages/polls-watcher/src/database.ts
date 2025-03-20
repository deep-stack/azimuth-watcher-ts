//
// Copyright 2021 Vulcanize, Inc.
//

import assert from 'assert';
import { Connection, ConnectionOptions, DeepPartial, FindConditions, QueryRunner, FindManyOptions, EntityTarget } from 'typeorm';
import path from 'path';

import {
  Database as BaseDatabase,
  DatabaseInterface,
  QueryOptions,
  StateKind,
  Where
} from '@cerc-io/util';

import { Contract } from './entity/Contract';
import { Event } from './entity/Event';
import { SyncStatus } from './entity/SyncStatus';
import { StateSyncStatus } from './entity/StateSyncStatus';
import { BlockProgress } from './entity/BlockProgress';
import { State } from './entity/State';
import { GetUpgradeProposals } from './entity/GetUpgradeProposals';
import { GetUpgradeProposalCount } from './entity/GetUpgradeProposalCount';
import { GetDocumentProposals } from './entity/GetDocumentProposals';
import { GetDocumentProposalCount } from './entity/GetDocumentProposalCount';
import { GetDocumentMajorities } from './entity/GetDocumentMajorities';
import { HasVotedOnUpgradePoll } from './entity/HasVotedOnUpgradePoll';
import { HasVotedOnDocumentPoll } from './entity/HasVotedOnDocumentPoll';

export const ENTITIES = [GetUpgradeProposals, GetUpgradeProposalCount, GetDocumentProposals, GetDocumentProposalCount, GetDocumentMajorities, HasVotedOnUpgradePoll, HasVotedOnDocumentPoll];

export class Database implements DatabaseInterface {
  _config: ConnectionOptions;
  _conn!: Connection;
  _baseDatabase: BaseDatabase;
  _propColMaps: { [key: string]: Map<string, string>; };

  constructor (config: ConnectionOptions) {
    assert(config);

    this._config = {
      ...config,
      entities: [path.join(__dirname, 'entity/*')]
    };

    this._baseDatabase = new BaseDatabase(this._config);
    this._propColMaps = {};
  }

  get baseDatabase (): BaseDatabase {
    return this._baseDatabase;
  }

  async init (): Promise<void> {
    this._conn = await this._baseDatabase.init();
    this._setPropColMaps();
  }

  async close (): Promise<void> {
    return this._baseDatabase.close();
  }

  async getGetUpgradeProposals ({ blockHash, contractAddress }: { blockHash: string, contractAddress: string }): Promise<GetUpgradeProposals | undefined> {
    return this._conn.getRepository(GetUpgradeProposals)
      .findOne({
        blockHash,
        contractAddress
      });
  }

  async getGetUpgradeProposalCount ({ blockHash, contractAddress }: { blockHash: string, contractAddress: string }): Promise<GetUpgradeProposalCount | undefined> {
    return this._conn.getRepository(GetUpgradeProposalCount)
      .findOne({
        blockHash,
        contractAddress
      });
  }

  async getGetDocumentProposals ({ blockHash, contractAddress }: { blockHash: string, contractAddress: string }): Promise<GetDocumentProposals | undefined> {
    return this._conn.getRepository(GetDocumentProposals)
      .findOne({
        blockHash,
        contractAddress
      });
  }

  async getGetDocumentProposalCount ({ blockHash, contractAddress }: { blockHash: string, contractAddress: string }): Promise<GetDocumentProposalCount | undefined> {
    return this._conn.getRepository(GetDocumentProposalCount)
      .findOne({
        blockHash,
        contractAddress
      });
  }

  async getGetDocumentMajorities ({ blockHash, contractAddress }: { blockHash: string, contractAddress: string }): Promise<GetDocumentMajorities | undefined> {
    return this._conn.getRepository(GetDocumentMajorities)
      .findOne({
        blockHash,
        contractAddress
      });
  }

  async getHasVotedOnUpgradePoll ({ blockHash, contractAddress, _galaxy, _proposal }: { blockHash: string, contractAddress: string, _galaxy: number, _proposal: string }): Promise<HasVotedOnUpgradePoll | undefined> {
    return this._conn.getRepository(HasVotedOnUpgradePoll)
      .findOne({
        blockHash,
        contractAddress,
        _galaxy,
        _proposal
      });
  }

  async getHasVotedOnDocumentPoll ({ blockHash, contractAddress, _galaxy, _proposal }: { blockHash: string, contractAddress: string, _galaxy: number, _proposal: string }): Promise<HasVotedOnDocumentPoll | undefined> {
    return this._conn.getRepository(HasVotedOnDocumentPoll)
      .findOne({
        blockHash,
        contractAddress,
        _galaxy,
        _proposal
      });
  }

  async saveGetUpgradeProposals ({ blockHash, blockNumber, contractAddress, value, proof }: DeepPartial<GetUpgradeProposals>): Promise<GetUpgradeProposals> {
    const repo = this._conn.getRepository(GetUpgradeProposals);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, value, proof });
    return repo.save(entity);
  }

  async saveGetUpgradeProposalCount ({ blockHash, blockNumber, contractAddress, value, proof }: DeepPartial<GetUpgradeProposalCount>): Promise<GetUpgradeProposalCount> {
    const repo = this._conn.getRepository(GetUpgradeProposalCount);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, value, proof });
    return repo.save(entity);
  }

  async saveGetDocumentProposals ({ blockHash, blockNumber, contractAddress, value, proof }: DeepPartial<GetDocumentProposals>): Promise<GetDocumentProposals> {
    const repo = this._conn.getRepository(GetDocumentProposals);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, value, proof });
    return repo.save(entity);
  }

  async saveGetDocumentProposalCount ({ blockHash, blockNumber, contractAddress, value, proof }: DeepPartial<GetDocumentProposalCount>): Promise<GetDocumentProposalCount> {
    const repo = this._conn.getRepository(GetDocumentProposalCount);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, value, proof });
    return repo.save(entity);
  }

  async saveGetDocumentMajorities ({ blockHash, blockNumber, contractAddress, value, proof }: DeepPartial<GetDocumentMajorities>): Promise<GetDocumentMajorities> {
    const repo = this._conn.getRepository(GetDocumentMajorities);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, value, proof });
    return repo.save(entity);
  }

  async saveHasVotedOnUpgradePoll ({ blockHash, blockNumber, contractAddress, _galaxy, _proposal, value, proof }: DeepPartial<HasVotedOnUpgradePoll>): Promise<HasVotedOnUpgradePoll> {
    const repo = this._conn.getRepository(HasVotedOnUpgradePoll);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _galaxy, _proposal, value, proof });
    return repo.save(entity);
  }

  async saveHasVotedOnDocumentPoll ({ blockHash, blockNumber, contractAddress, _galaxy, _proposal, value, proof }: DeepPartial<HasVotedOnDocumentPoll>): Promise<HasVotedOnDocumentPoll> {
    const repo = this._conn.getRepository(HasVotedOnDocumentPoll);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _galaxy, _proposal, value, proof });
    return repo.save(entity);
  }

  getNewState (): State {
    return new State();
  }

  async getStates (where: FindConditions<State>): Promise<State[]> {
    const repo = this._conn.getRepository(State);

    return this._baseDatabase.getStates(repo, where);
  }

  async getLatestState (contractAddress: string, kind: StateKind | null, blockNumber?: number): Promise<State | undefined> {
    const repo = this._conn.getRepository(State);

    return this._baseDatabase.getLatestState(repo, contractAddress, kind, blockNumber);
  }

  async getPrevState (blockHash: string, contractAddress: string, kind?: string): Promise<State | undefined> {
    const repo = this._conn.getRepository(State);

    return this._baseDatabase.getPrevState(repo, blockHash, contractAddress, kind);
  }

  // Fetch all diff States after the specified block number.
  async getDiffStatesInRange (contractAddress: string, startblock: number, endBlock: number): Promise<State[]> {
    const repo = this._conn.getRepository(State);

    return this._baseDatabase.getDiffStatesInRange(repo, contractAddress, startblock, endBlock);
  }

  async saveOrUpdateState (dbTx: QueryRunner, state: State): Promise<State> {
    const repo = dbTx.manager.getRepository(State);

    return this._baseDatabase.saveOrUpdateState(repo, state);
  }

  async removeStates (dbTx: QueryRunner, blockNumber: number, kind: string): Promise<void> {
    const repo = dbTx.manager.getRepository(State);

    await this._baseDatabase.removeStates(repo, blockNumber, kind);
  }

  async removeStatesAfterBlock (dbTx: QueryRunner, blockNumber: number): Promise<void> {
    const repo = dbTx.manager.getRepository(State);

    await this._baseDatabase.removeStatesAfterBlock(repo, blockNumber);
  }

  async getStateSyncStatus (): Promise<StateSyncStatus | undefined> {
    const repo = this._conn.getRepository(StateSyncStatus);

    return this._baseDatabase.getStateSyncStatus(repo);
  }

  async updateStateSyncStatusIndexedBlock (queryRunner: QueryRunner, blockNumber: number, force?: boolean): Promise<StateSyncStatus> {
    const repo = queryRunner.manager.getRepository(StateSyncStatus);

    return this._baseDatabase.updateStateSyncStatusIndexedBlock(repo, blockNumber, force);
  }

  async updateStateSyncStatusCheckpointBlock (queryRunner: QueryRunner, blockNumber: number, force?: boolean): Promise<StateSyncStatus> {
    const repo = queryRunner.manager.getRepository(StateSyncStatus);

    return this._baseDatabase.updateStateSyncStatusCheckpointBlock(repo, blockNumber, force);
  }

  async getContracts (): Promise<Contract[]> {
    const repo = this._conn.getRepository(Contract);

    return this._baseDatabase.getContracts(repo);
  }

  async createTransactionRunner (): Promise<QueryRunner> {
    return this._baseDatabase.createTransactionRunner();
  }

  async getProcessedBlockCountForRange (fromBlockNumber: number, toBlockNumber: number): Promise<{ expected: number, actual: number }> {
    const repo = this._conn.getRepository(BlockProgress);

    return this._baseDatabase.getProcessedBlockCountForRange(repo, fromBlockNumber, toBlockNumber);
  }

  async getEventsInRange (fromBlockNumber: number, toBlockNumber: number, name?: string): Promise<Array<Event>> {
    const repo = this._conn.getRepository(Event);

    return this._baseDatabase.getEventsInRange(repo, fromBlockNumber, toBlockNumber, name);
  }

  async saveEventEntity (queryRunner: QueryRunner, entity: Event): Promise<Event> {
    const repo = queryRunner.manager.getRepository(Event);
    return this._baseDatabase.saveEventEntity(repo, entity);
  }

  async getBlockEvents (blockHash: string, where: Where, queryOptions: QueryOptions): Promise<Event[]> {
    const repo = this._conn.getRepository(Event);

    return this._baseDatabase.getBlockEvents(repo, blockHash, where, queryOptions);
  }

  async saveBlockWithEvents (queryRunner: QueryRunner, block: DeepPartial<BlockProgress>, events: DeepPartial<Event>[]): Promise<BlockProgress> {
    const blockRepo = queryRunner.manager.getRepository(BlockProgress);
    const eventRepo = queryRunner.manager.getRepository(Event);

    return this._baseDatabase.saveBlockWithEvents(blockRepo, eventRepo, block, events);
  }

  async saveEvents (queryRunner: QueryRunner, events: Event[]): Promise<void> {
    const eventRepo = queryRunner.manager.getRepository(Event);

    return this._baseDatabase.saveEvents(eventRepo, events);
  }

  async saveBlockProgress (queryRunner: QueryRunner, block: DeepPartial<BlockProgress>): Promise<BlockProgress> {
    const repo = queryRunner.manager.getRepository(BlockProgress);

    return this._baseDatabase.saveBlockProgress(repo, block);
  }

  async saveContract (queryRunner: QueryRunner, address: string, kind: string, checkpoint: boolean, startingBlock: number, context?: any): Promise<Contract> {
    const repo = queryRunner.manager.getRepository(Contract);

    return this._baseDatabase.saveContract(repo, address, kind, checkpoint, startingBlock, context);
  }

  async updateSyncStatusIndexedBlock (queryRunner: QueryRunner, blockHash: string, blockNumber: number, force = false): Promise<SyncStatus> {
    const repo = queryRunner.manager.getRepository(SyncStatus);

    return this._baseDatabase.updateSyncStatusIndexedBlock(repo, blockHash, blockNumber, force);
  }

  async updateSyncStatusCanonicalBlock (queryRunner: QueryRunner, blockHash: string, blockNumber: number, force = false): Promise<SyncStatus> {
    const repo = queryRunner.manager.getRepository(SyncStatus);

    return this._baseDatabase.updateSyncStatusCanonicalBlock(repo, blockHash, blockNumber, force);
  }

  async updateSyncStatusChainHead (queryRunner: QueryRunner, blockHash: string, blockNumber: number, force = false): Promise<SyncStatus> {
    const repo = queryRunner.manager.getRepository(SyncStatus);

    return this._baseDatabase.updateSyncStatusChainHead(repo, blockHash, blockNumber, force);
  }

  async updateSyncStatusProcessedBlock (queryRunner: QueryRunner, blockHash: string, blockNumber: number, force = false): Promise<SyncStatus> {
    const repo = queryRunner.manager.getRepository(SyncStatus);

    return this._baseDatabase.updateSyncStatusProcessedBlock(repo, blockHash, blockNumber, force);
  }

  async updateSyncStatusIndexingError (queryRunner: QueryRunner, hasIndexingError: boolean): Promise<SyncStatus | undefined> {
    const repo = queryRunner.manager.getRepository(SyncStatus);

    return this._baseDatabase.updateSyncStatusIndexingError(repo, hasIndexingError);
  }

  async updateSyncStatus (queryRunner: QueryRunner, syncStatus: DeepPartial<SyncStatus>): Promise<SyncStatus> {
    const repo = queryRunner.manager.getRepository(SyncStatus);

    return this._baseDatabase.updateSyncStatus(repo, syncStatus);
  }

  async getSyncStatus (queryRunner: QueryRunner): Promise<SyncStatus | undefined> {
    const repo = queryRunner.manager.getRepository(SyncStatus);

    return this._baseDatabase.getSyncStatus(repo);
  }

  async getEvent (id: string): Promise<Event | undefined> {
    const repo = this._conn.getRepository(Event);

    return this._baseDatabase.getEvent(repo, id);
  }

  async getBlocksAtHeight (height: number, isPruned: boolean): Promise<BlockProgress[]> {
    const repo = this._conn.getRepository(BlockProgress);

    return this._baseDatabase.getBlocksAtHeight(repo, height, isPruned);
  }

  async markBlocksAsPruned (queryRunner: QueryRunner, blocks: BlockProgress[]): Promise<void> {
    const repo = queryRunner.manager.getRepository(BlockProgress);

    return this._baseDatabase.markBlocksAsPruned(repo, blocks);
  }

  async getBlockProgress (blockHash: string): Promise<BlockProgress | undefined> {
    const repo = this._conn.getRepository(BlockProgress);
    return this._baseDatabase.getBlockProgress(repo, blockHash);
  }

  async getBlockProgressEntities (where: FindConditions<BlockProgress>, options: FindManyOptions<BlockProgress>): Promise<BlockProgress[]> {
    const repo = this._conn.getRepository(BlockProgress);

    return this._baseDatabase.getBlockProgressEntities(repo, where, options);
  }

  async getEntitiesForBlock (blockHash: string, tableName: string): Promise<any[]> {
    return this._baseDatabase.getEntitiesForBlock(blockHash, tableName);
  }

  async updateBlockProgress (queryRunner: QueryRunner, block: BlockProgress, lastProcessedEventIndex: number): Promise<BlockProgress> {
    const repo = queryRunner.manager.getRepository(BlockProgress);

    return this._baseDatabase.updateBlockProgress(repo, block, lastProcessedEventIndex);
  }

  async removeEntities<Entity> (queryRunner: QueryRunner, entity: new () => Entity, findConditions?: FindManyOptions<Entity> | FindConditions<Entity>): Promise<void> {
    return this._baseDatabase.removeEntities(queryRunner, entity, findConditions);
  }

  async deleteEntitiesByConditions<Entity> (queryRunner: QueryRunner, entity: EntityTarget<Entity>, findConditions: FindConditions<Entity>): Promise<void> {
    await this._baseDatabase.deleteEntitiesByConditions(queryRunner, entity, findConditions);
  }

  async getAncestorAtHeight (blockHash: string, height: number): Promise<string> {
    return this._baseDatabase.getAncestorAtHeight(blockHash, height);
  }

  _getPropertyColumnMapForEntity (entityName: string): Map<string, string> {
    return this._conn.getMetadata(entityName).ownColumns.reduce((acc, curr) => {
      return acc.set(curr.propertyName, curr.databaseName);
    }, new Map<string, string>());
  }

  _setPropColMaps (): void {
    this._propColMaps.GetUpgradeProposals = this._getPropertyColumnMapForEntity('GetUpgradeProposals');
    this._propColMaps.GetUpgradeProposalCount = this._getPropertyColumnMapForEntity('GetUpgradeProposalCount');
    this._propColMaps.GetDocumentProposals = this._getPropertyColumnMapForEntity('GetDocumentProposals');
    this._propColMaps.GetDocumentProposalCount = this._getPropertyColumnMapForEntity('GetDocumentProposalCount');
    this._propColMaps.GetDocumentMajorities = this._getPropertyColumnMapForEntity('GetDocumentMajorities');
    this._propColMaps.HasVotedOnUpgradePoll = this._getPropertyColumnMapForEntity('HasVotedOnUpgradePoll');
    this._propColMaps.HasVotedOnDocumentPoll = this._getPropertyColumnMapForEntity('HasVotedOnDocumentPoll');
  }
}
