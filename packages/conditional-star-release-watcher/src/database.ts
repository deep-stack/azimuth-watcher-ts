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
import { WithdrawLimit } from './entity/WithdrawLimit';
import { VerifyBalance } from './entity/VerifyBalance';
import { GetBatches } from './entity/GetBatches';
import { GetBatch } from './entity/GetBatch';
import { GetWithdrawn } from './entity/GetWithdrawn';
import { GetWithdrawnFromBatch } from './entity/GetWithdrawnFromBatch';
import { GetForfeited } from './entity/GetForfeited';
import { HasForfeitedBatch } from './entity/HasForfeitedBatch';
import { GetRemainingStars } from './entity/GetRemainingStars';
import { GetConditionsState } from './entity/GetConditionsState';

export const ENTITIES = [WithdrawLimit, VerifyBalance, GetBatches, GetBatch, GetWithdrawn, GetWithdrawnFromBatch, GetForfeited, HasForfeitedBatch, GetRemainingStars, GetConditionsState];

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

  async getWithdrawLimit ({ blockHash, contractAddress, _participant, _batch }: { blockHash: string, contractAddress: string, _participant: string, _batch: number }): Promise<WithdrawLimit | undefined> {
    return this._conn.getRepository(WithdrawLimit)
      .findOne({
        blockHash,
        contractAddress,
        _participant,
        _batch
      });
  }

  async getVerifyBalance ({ blockHash, contractAddress, _participant }: { blockHash: string, contractAddress: string, _participant: string }): Promise<VerifyBalance | undefined> {
    return this._conn.getRepository(VerifyBalance)
      .findOne({
        blockHash,
        contractAddress,
        _participant
      });
  }

  async getGetBatches ({ blockHash, contractAddress, _participant }: { blockHash: string, contractAddress: string, _participant: string }): Promise<GetBatches | undefined> {
    return this._conn.getRepository(GetBatches)
      .findOne({
        blockHash,
        contractAddress,
        _participant
      });
  }

  async getGetBatch ({ blockHash, contractAddress, _participant, _batch }: { blockHash: string, contractAddress: string, _participant: string, _batch: number }): Promise<GetBatch | undefined> {
    return this._conn.getRepository(GetBatch)
      .findOne({
        blockHash,
        contractAddress,
        _participant,
        _batch
      });
  }

  async getGetWithdrawn ({ blockHash, contractAddress, _participant }: { blockHash: string, contractAddress: string, _participant: string }): Promise<GetWithdrawn | undefined> {
    return this._conn.getRepository(GetWithdrawn)
      .findOne({
        blockHash,
        contractAddress,
        _participant
      });
  }

  async getGetWithdrawnFromBatch ({ blockHash, contractAddress, _participant, _batch }: { blockHash: string, contractAddress: string, _participant: string, _batch: number }): Promise<GetWithdrawnFromBatch | undefined> {
    return this._conn.getRepository(GetWithdrawnFromBatch)
      .findOne({
        blockHash,
        contractAddress,
        _participant,
        _batch
      });
  }

  async getGetForfeited ({ blockHash, contractAddress, _participant }: { blockHash: string, contractAddress: string, _participant: string }): Promise<GetForfeited | undefined> {
    return this._conn.getRepository(GetForfeited)
      .findOne({
        blockHash,
        contractAddress,
        _participant
      });
  }

  async getHasForfeitedBatch ({ blockHash, contractAddress, _participant, _batch }: { blockHash: string, contractAddress: string, _participant: string, _batch: number }): Promise<HasForfeitedBatch | undefined> {
    return this._conn.getRepository(HasForfeitedBatch)
      .findOne({
        blockHash,
        contractAddress,
        _participant,
        _batch
      });
  }

  async getGetRemainingStars ({ blockHash, contractAddress, _participant }: { blockHash: string, contractAddress: string, _participant: string }): Promise<GetRemainingStars | undefined> {
    return this._conn.getRepository(GetRemainingStars)
      .findOne({
        blockHash,
        contractAddress,
        _participant
      });
  }

  async getGetConditionsState ({ blockHash, contractAddress }: { blockHash: string, contractAddress: string }): Promise<GetConditionsState | undefined> {
    return this._conn.getRepository(GetConditionsState)
      .findOne({
        blockHash,
        contractAddress
      });
  }

  async saveWithdrawLimit ({ blockHash, blockNumber, contractAddress, _participant, _batch, value, proof }: DeepPartial<WithdrawLimit>): Promise<WithdrawLimit> {
    const repo = this._conn.getRepository(WithdrawLimit);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _participant, _batch, value, proof });
    return repo.save(entity);
  }

  async saveVerifyBalance ({ blockHash, blockNumber, contractAddress, _participant, value, proof }: DeepPartial<VerifyBalance>): Promise<VerifyBalance> {
    const repo = this._conn.getRepository(VerifyBalance);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _participant, value, proof });
    return repo.save(entity);
  }

  async saveGetBatches ({ blockHash, blockNumber, contractAddress, _participant, value, proof }: DeepPartial<GetBatches>): Promise<GetBatches> {
    const repo = this._conn.getRepository(GetBatches);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _participant, value, proof });
    return repo.save(entity);
  }

  async saveGetBatch ({ blockHash, blockNumber, contractAddress, _participant, _batch, value, proof }: DeepPartial<GetBatch>): Promise<GetBatch> {
    const repo = this._conn.getRepository(GetBatch);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _participant, _batch, value, proof });
    return repo.save(entity);
  }

  async saveGetWithdrawn ({ blockHash, blockNumber, contractAddress, _participant, value, proof }: DeepPartial<GetWithdrawn>): Promise<GetWithdrawn> {
    const repo = this._conn.getRepository(GetWithdrawn);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _participant, value, proof });
    return repo.save(entity);
  }

  async saveGetWithdrawnFromBatch ({ blockHash, blockNumber, contractAddress, _participant, _batch, value, proof }: DeepPartial<GetWithdrawnFromBatch>): Promise<GetWithdrawnFromBatch> {
    const repo = this._conn.getRepository(GetWithdrawnFromBatch);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _participant, _batch, value, proof });
    return repo.save(entity);
  }

  async saveGetForfeited ({ blockHash, blockNumber, contractAddress, _participant, value, proof }: DeepPartial<GetForfeited>): Promise<GetForfeited> {
    const repo = this._conn.getRepository(GetForfeited);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _participant, value, proof });
    return repo.save(entity);
  }

  async saveHasForfeitedBatch ({ blockHash, blockNumber, contractAddress, _participant, _batch, value, proof }: DeepPartial<HasForfeitedBatch>): Promise<HasForfeitedBatch> {
    const repo = this._conn.getRepository(HasForfeitedBatch);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _participant, _batch, value, proof });
    return repo.save(entity);
  }

  async saveGetRemainingStars ({ blockHash, blockNumber, contractAddress, _participant, value, proof }: DeepPartial<GetRemainingStars>): Promise<GetRemainingStars> {
    const repo = this._conn.getRepository(GetRemainingStars);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _participant, value, proof });
    return repo.save(entity);
  }

  async saveGetConditionsState ({ blockHash, blockNumber, contractAddress, value0, value1, value2, value3, proof }: DeepPartial<GetConditionsState>): Promise<GetConditionsState> {
    const repo = this._conn.getRepository(GetConditionsState);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, value0, value1, value2, value3, proof });
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

  async getEventsInRange (fromBlockNumber: number, toBlockNumber: number): Promise<Array<Event>> {
    const repo = this._conn.getRepository(Event);

    return this._baseDatabase.getEventsInRange(repo, fromBlockNumber, toBlockNumber);
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
    this._propColMaps.WithdrawLimit = this._getPropertyColumnMapForEntity('WithdrawLimit');
    this._propColMaps.VerifyBalance = this._getPropertyColumnMapForEntity('VerifyBalance');
    this._propColMaps.GetBatches = this._getPropertyColumnMapForEntity('GetBatches');
    this._propColMaps.GetBatch = this._getPropertyColumnMapForEntity('GetBatch');
    this._propColMaps.GetWithdrawn = this._getPropertyColumnMapForEntity('GetWithdrawn');
    this._propColMaps.GetWithdrawnFromBatch = this._getPropertyColumnMapForEntity('GetWithdrawnFromBatch');
    this._propColMaps.GetForfeited = this._getPropertyColumnMapForEntity('GetForfeited');
    this._propColMaps.HasForfeitedBatch = this._getPropertyColumnMapForEntity('HasForfeitedBatch');
    this._propColMaps.GetRemainingStars = this._getPropertyColumnMapForEntity('GetRemainingStars');
    this._propColMaps.GetConditionsState = this._getPropertyColumnMapForEntity('GetConditionsState');
  }
}
