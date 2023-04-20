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
import { IsActive } from './entity/IsActive';
import { GetKeyRevisionNumber } from './entity/GetKeyRevisionNumber';
import { HasBeenLinked } from './entity/HasBeenLinked';
import { IsLive } from './entity/IsLive';
import { GetContinuityNumber } from './entity/GetContinuityNumber';
import { GetSpawnCount } from './entity/GetSpawnCount';
import { HasSponsor } from './entity/HasSponsor';
import { GetSponsor } from './entity/GetSponsor';
import { IsSponsor } from './entity/IsSponsor';
import { GetSponsoringCount } from './entity/GetSponsoringCount';
import { IsEscaping } from './entity/IsEscaping';
import { GetEscapeRequest } from './entity/GetEscapeRequest';
import { IsRequestingEscapeTo } from './entity/IsRequestingEscapeTo';
import { GetEscapeRequestsCount } from './entity/GetEscapeRequestsCount';
import { GetOwner } from './entity/GetOwner';
import { IsOwner } from './entity/IsOwner';
import { GetOwnedPointCount } from './entity/GetOwnedPointCount';
import { GetOwnedPointAtIndex } from './entity/GetOwnedPointAtIndex';
import { GetManagementProxy } from './entity/GetManagementProxy';
import { IsManagementProxy } from './entity/IsManagementProxy';
import { CanManage } from './entity/CanManage';
import { GetManagerForCount } from './entity/GetManagerForCount';
import { GetSpawnProxy } from './entity/GetSpawnProxy';
import { IsSpawnProxy } from './entity/IsSpawnProxy';
import { CanSpawnAs } from './entity/CanSpawnAs';
import { GetSpawningForCount } from './entity/GetSpawningForCount';
import { GetVotingProxy } from './entity/GetVotingProxy';
import { IsVotingProxy } from './entity/IsVotingProxy';
import { CanVoteAs } from './entity/CanVoteAs';
import { GetVotingForCount } from './entity/GetVotingForCount';
import { GetTransferProxy } from './entity/GetTransferProxy';
import { IsTransferProxy } from './entity/IsTransferProxy';
import { CanTransfer } from './entity/CanTransfer';
import { GetTransferringForCount } from './entity/GetTransferringForCount';
import { IsOperator } from './entity/IsOperator';
import { GetCensuringCount } from './entity/GetCensuringCount';
import { GetCensuredByCount } from './entity/GetCensuredByCount';

export const ENTITIES = [IsActive, GetKeyRevisionNumber, HasBeenLinked, IsLive, GetContinuityNumber, GetSpawnCount, HasSponsor, GetSponsor, IsSponsor, GetSponsoringCount, IsEscaping, GetEscapeRequest, IsRequestingEscapeTo, GetEscapeRequestsCount, GetOwner, IsOwner, GetOwnedPointCount, GetOwnedPointAtIndex, GetManagementProxy, IsManagementProxy, CanManage, GetManagerForCount, GetSpawnProxy, IsSpawnProxy, CanSpawnAs, GetSpawningForCount, GetVotingProxy, IsVotingProxy, CanVoteAs, GetVotingForCount, GetTransferProxy, IsTransferProxy, CanTransfer, GetTransferringForCount, IsOperator, GetCensuringCount, GetCensuredByCount];

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

  async getIsActive ({ blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint }): Promise<IsActive | undefined> {
    return this._conn.getRepository(IsActive)
      .findOne({
        blockHash,
        contractAddress,
        _point
      });
  }

  async getGetKeyRevisionNumber ({ blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint }): Promise<GetKeyRevisionNumber | undefined> {
    return this._conn.getRepository(GetKeyRevisionNumber)
      .findOne({
        blockHash,
        contractAddress,
        _point
      });
  }

  async getHasBeenLinked ({ blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint }): Promise<HasBeenLinked | undefined> {
    return this._conn.getRepository(HasBeenLinked)
      .findOne({
        blockHash,
        contractAddress,
        _point
      });
  }

  async getIsLive ({ blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint }): Promise<IsLive | undefined> {
    return this._conn.getRepository(IsLive)
      .findOne({
        blockHash,
        contractAddress,
        _point
      });
  }

  async getGetContinuityNumber ({ blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint }): Promise<GetContinuityNumber | undefined> {
    return this._conn.getRepository(GetContinuityNumber)
      .findOne({
        blockHash,
        contractAddress,
        _point
      });
  }

  async getGetSpawnCount ({ blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint }): Promise<GetSpawnCount | undefined> {
    return this._conn.getRepository(GetSpawnCount)
      .findOne({
        blockHash,
        contractAddress,
        _point
      });
  }

  async getHasSponsor ({ blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint }): Promise<HasSponsor | undefined> {
    return this._conn.getRepository(HasSponsor)
      .findOne({
        blockHash,
        contractAddress,
        _point
      });
  }

  async getGetSponsor ({ blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint }): Promise<GetSponsor | undefined> {
    return this._conn.getRepository(GetSponsor)
      .findOne({
        blockHash,
        contractAddress,
        _point
      });
  }

  async getIsSponsor ({ blockHash, contractAddress, _point, _sponsor }: { blockHash: string, contractAddress: string, _point: bigint, _sponsor: bigint }): Promise<IsSponsor | undefined> {
    return this._conn.getRepository(IsSponsor)
      .findOne({
        blockHash,
        contractAddress,
        _point,
        _sponsor
      });
  }

  async getGetSponsoringCount ({ blockHash, contractAddress, _sponsor }: { blockHash: string, contractAddress: string, _sponsor: bigint }): Promise<GetSponsoringCount | undefined> {
    return this._conn.getRepository(GetSponsoringCount)
      .findOne({
        blockHash,
        contractAddress,
        _sponsor
      });
  }

  async getIsEscaping ({ blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint }): Promise<IsEscaping | undefined> {
    return this._conn.getRepository(IsEscaping)
      .findOne({
        blockHash,
        contractAddress,
        _point
      });
  }

  async getGetEscapeRequest ({ blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint }): Promise<GetEscapeRequest | undefined> {
    return this._conn.getRepository(GetEscapeRequest)
      .findOne({
        blockHash,
        contractAddress,
        _point
      });
  }

  async getIsRequestingEscapeTo ({ blockHash, contractAddress, _point, _sponsor }: { blockHash: string, contractAddress: string, _point: bigint, _sponsor: bigint }): Promise<IsRequestingEscapeTo | undefined> {
    return this._conn.getRepository(IsRequestingEscapeTo)
      .findOne({
        blockHash,
        contractAddress,
        _point,
        _sponsor
      });
  }

  async getGetEscapeRequestsCount ({ blockHash, contractAddress, _sponsor }: { blockHash: string, contractAddress: string, _sponsor: bigint }): Promise<GetEscapeRequestsCount | undefined> {
    return this._conn.getRepository(GetEscapeRequestsCount)
      .findOne({
        blockHash,
        contractAddress,
        _sponsor
      });
  }

  async getGetOwner ({ blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint }): Promise<GetOwner | undefined> {
    return this._conn.getRepository(GetOwner)
      .findOne({
        blockHash,
        contractAddress,
        _point
      });
  }

  async getIsOwner ({ blockHash, contractAddress, _point, _address }: { blockHash: string, contractAddress: string, _point: bigint, _address: string }): Promise<IsOwner | undefined> {
    return this._conn.getRepository(IsOwner)
      .findOne({
        blockHash,
        contractAddress,
        _point,
        _address
      });
  }

  async getGetOwnedPointCount ({ blockHash, contractAddress, _whose }: { blockHash: string, contractAddress: string, _whose: string }): Promise<GetOwnedPointCount | undefined> {
    return this._conn.getRepository(GetOwnedPointCount)
      .findOne({
        blockHash,
        contractAddress,
        _whose
      });
  }

  async getGetOwnedPointAtIndex ({ blockHash, contractAddress, _whose, _index }: { blockHash: string, contractAddress: string, _whose: string, _index: bigint }): Promise<GetOwnedPointAtIndex | undefined> {
    return this._conn.getRepository(GetOwnedPointAtIndex)
      .findOne({
        blockHash,
        contractAddress,
        _whose,
        _index
      });
  }

  async getGetManagementProxy ({ blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint }): Promise<GetManagementProxy | undefined> {
    return this._conn.getRepository(GetManagementProxy)
      .findOne({
        blockHash,
        contractAddress,
        _point
      });
  }

  async getIsManagementProxy ({ blockHash, contractAddress, _point, _proxy }: { blockHash: string, contractAddress: string, _point: bigint, _proxy: string }): Promise<IsManagementProxy | undefined> {
    return this._conn.getRepository(IsManagementProxy)
      .findOne({
        blockHash,
        contractAddress,
        _point,
        _proxy
      });
  }

  async getCanManage ({ blockHash, contractAddress, _point, _who }: { blockHash: string, contractAddress: string, _point: bigint, _who: string }): Promise<CanManage | undefined> {
    return this._conn.getRepository(CanManage)
      .findOne({
        blockHash,
        contractAddress,
        _point,
        _who
      });
  }

  async getGetManagerForCount ({ blockHash, contractAddress, _proxy }: { blockHash: string, contractAddress: string, _proxy: string }): Promise<GetManagerForCount | undefined> {
    return this._conn.getRepository(GetManagerForCount)
      .findOne({
        blockHash,
        contractAddress,
        _proxy
      });
  }

  async getGetSpawnProxy ({ blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint }): Promise<GetSpawnProxy | undefined> {
    return this._conn.getRepository(GetSpawnProxy)
      .findOne({
        blockHash,
        contractAddress,
        _point
      });
  }

  async getIsSpawnProxy ({ blockHash, contractAddress, _point, _proxy }: { blockHash: string, contractAddress: string, _point: bigint, _proxy: string }): Promise<IsSpawnProxy | undefined> {
    return this._conn.getRepository(IsSpawnProxy)
      .findOne({
        blockHash,
        contractAddress,
        _point,
        _proxy
      });
  }

  async getCanSpawnAs ({ blockHash, contractAddress, _point, _who }: { blockHash: string, contractAddress: string, _point: bigint, _who: string }): Promise<CanSpawnAs | undefined> {
    return this._conn.getRepository(CanSpawnAs)
      .findOne({
        blockHash,
        contractAddress,
        _point,
        _who
      });
  }

  async getGetSpawningForCount ({ blockHash, contractAddress, _proxy }: { blockHash: string, contractAddress: string, _proxy: string }): Promise<GetSpawningForCount | undefined> {
    return this._conn.getRepository(GetSpawningForCount)
      .findOne({
        blockHash,
        contractAddress,
        _proxy
      });
  }

  async getGetVotingProxy ({ blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint }): Promise<GetVotingProxy | undefined> {
    return this._conn.getRepository(GetVotingProxy)
      .findOne({
        blockHash,
        contractAddress,
        _point
      });
  }

  async getIsVotingProxy ({ blockHash, contractAddress, _point, _proxy }: { blockHash: string, contractAddress: string, _point: bigint, _proxy: string }): Promise<IsVotingProxy | undefined> {
    return this._conn.getRepository(IsVotingProxy)
      .findOne({
        blockHash,
        contractAddress,
        _point,
        _proxy
      });
  }

  async getCanVoteAs ({ blockHash, contractAddress, _point, _who }: { blockHash: string, contractAddress: string, _point: bigint, _who: string }): Promise<CanVoteAs | undefined> {
    return this._conn.getRepository(CanVoteAs)
      .findOne({
        blockHash,
        contractAddress,
        _point,
        _who
      });
  }

  async getGetVotingForCount ({ blockHash, contractAddress, _proxy }: { blockHash: string, contractAddress: string, _proxy: string }): Promise<GetVotingForCount | undefined> {
    return this._conn.getRepository(GetVotingForCount)
      .findOne({
        blockHash,
        contractAddress,
        _proxy
      });
  }

  async getGetTransferProxy ({ blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint }): Promise<GetTransferProxy | undefined> {
    return this._conn.getRepository(GetTransferProxy)
      .findOne({
        blockHash,
        contractAddress,
        _point
      });
  }

  async getIsTransferProxy ({ blockHash, contractAddress, _point, _proxy }: { blockHash: string, contractAddress: string, _point: bigint, _proxy: string }): Promise<IsTransferProxy | undefined> {
    return this._conn.getRepository(IsTransferProxy)
      .findOne({
        blockHash,
        contractAddress,
        _point,
        _proxy
      });
  }

  async getCanTransfer ({ blockHash, contractAddress, _point, _who }: { blockHash: string, contractAddress: string, _point: bigint, _who: string }): Promise<CanTransfer | undefined> {
    return this._conn.getRepository(CanTransfer)
      .findOne({
        blockHash,
        contractAddress,
        _point,
        _who
      });
  }

  async getGetTransferringForCount ({ blockHash, contractAddress, _proxy }: { blockHash: string, contractAddress: string, _proxy: string }): Promise<GetTransferringForCount | undefined> {
    return this._conn.getRepository(GetTransferringForCount)
      .findOne({
        blockHash,
        contractAddress,
        _proxy
      });
  }

  async getIsOperator ({ blockHash, contractAddress, _owner, _operator }: { blockHash: string, contractAddress: string, _owner: string, _operator: string }): Promise<IsOperator | undefined> {
    return this._conn.getRepository(IsOperator)
      .findOne({
        blockHash,
        contractAddress,
        _owner,
        _operator
      });
  }

  async getGetCensuringCount ({ blockHash, contractAddress, _whose }: { blockHash: string, contractAddress: string, _whose: number }): Promise<GetCensuringCount | undefined> {
    return this._conn.getRepository(GetCensuringCount)
      .findOne({
        blockHash,
        contractAddress,
        _whose
      });
  }

  async getGetCensuredByCount ({ blockHash, contractAddress, _who }: { blockHash: string, contractAddress: string, _who: number }): Promise<GetCensuredByCount | undefined> {
    return this._conn.getRepository(GetCensuredByCount)
      .findOne({
        blockHash,
        contractAddress,
        _who
      });
  }

  async saveIsActive ({ blockHash, blockNumber, contractAddress, _point, value, proof }: DeepPartial<IsActive>): Promise<IsActive> {
    const repo = this._conn.getRepository(IsActive);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _point, value, proof });
    return repo.save(entity);
  }

  async saveGetKeyRevisionNumber ({ blockHash, blockNumber, contractAddress, _point, value, proof }: DeepPartial<GetKeyRevisionNumber>): Promise<GetKeyRevisionNumber> {
    const repo = this._conn.getRepository(GetKeyRevisionNumber);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _point, value, proof });
    return repo.save(entity);
  }

  async saveHasBeenLinked ({ blockHash, blockNumber, contractAddress, _point, value, proof }: DeepPartial<HasBeenLinked>): Promise<HasBeenLinked> {
    const repo = this._conn.getRepository(HasBeenLinked);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _point, value, proof });
    return repo.save(entity);
  }

  async saveIsLive ({ blockHash, blockNumber, contractAddress, _point, value, proof }: DeepPartial<IsLive>): Promise<IsLive> {
    const repo = this._conn.getRepository(IsLive);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _point, value, proof });
    return repo.save(entity);
  }

  async saveGetContinuityNumber ({ blockHash, blockNumber, contractAddress, _point, value, proof }: DeepPartial<GetContinuityNumber>): Promise<GetContinuityNumber> {
    const repo = this._conn.getRepository(GetContinuityNumber);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _point, value, proof });
    return repo.save(entity);
  }

  async saveGetSpawnCount ({ blockHash, blockNumber, contractAddress, _point, value, proof }: DeepPartial<GetSpawnCount>): Promise<GetSpawnCount> {
    const repo = this._conn.getRepository(GetSpawnCount);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _point, value, proof });
    return repo.save(entity);
  }

  async saveHasSponsor ({ blockHash, blockNumber, contractAddress, _point, value, proof }: DeepPartial<HasSponsor>): Promise<HasSponsor> {
    const repo = this._conn.getRepository(HasSponsor);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _point, value, proof });
    return repo.save(entity);
  }

  async saveGetSponsor ({ blockHash, blockNumber, contractAddress, _point, value, proof }: DeepPartial<GetSponsor>): Promise<GetSponsor> {
    const repo = this._conn.getRepository(GetSponsor);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _point, value, proof });
    return repo.save(entity);
  }

  async saveIsSponsor ({ blockHash, blockNumber, contractAddress, _point, _sponsor, value, proof }: DeepPartial<IsSponsor>): Promise<IsSponsor> {
    const repo = this._conn.getRepository(IsSponsor);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _point, _sponsor, value, proof });
    return repo.save(entity);
  }

  async saveGetSponsoringCount ({ blockHash, blockNumber, contractAddress, _sponsor, value, proof }: DeepPartial<GetSponsoringCount>): Promise<GetSponsoringCount> {
    const repo = this._conn.getRepository(GetSponsoringCount);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _sponsor, value, proof });
    return repo.save(entity);
  }

  async saveIsEscaping ({ blockHash, blockNumber, contractAddress, _point, value, proof }: DeepPartial<IsEscaping>): Promise<IsEscaping> {
    const repo = this._conn.getRepository(IsEscaping);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _point, value, proof });
    return repo.save(entity);
  }

  async saveGetEscapeRequest ({ blockHash, blockNumber, contractAddress, _point, value, proof }: DeepPartial<GetEscapeRequest>): Promise<GetEscapeRequest> {
    const repo = this._conn.getRepository(GetEscapeRequest);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _point, value, proof });
    return repo.save(entity);
  }

  async saveIsRequestingEscapeTo ({ blockHash, blockNumber, contractAddress, _point, _sponsor, value, proof }: DeepPartial<IsRequestingEscapeTo>): Promise<IsRequestingEscapeTo> {
    const repo = this._conn.getRepository(IsRequestingEscapeTo);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _point, _sponsor, value, proof });
    return repo.save(entity);
  }

  async saveGetEscapeRequestsCount ({ blockHash, blockNumber, contractAddress, _sponsor, value, proof }: DeepPartial<GetEscapeRequestsCount>): Promise<GetEscapeRequestsCount> {
    const repo = this._conn.getRepository(GetEscapeRequestsCount);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _sponsor, value, proof });
    return repo.save(entity);
  }

  async saveGetOwner ({ blockHash, blockNumber, contractAddress, _point, value, proof }: DeepPartial<GetOwner>): Promise<GetOwner> {
    const repo = this._conn.getRepository(GetOwner);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _point, value, proof });
    return repo.save(entity);
  }

  async saveIsOwner ({ blockHash, blockNumber, contractAddress, _point, _address, value, proof }: DeepPartial<IsOwner>): Promise<IsOwner> {
    const repo = this._conn.getRepository(IsOwner);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _point, _address, value, proof });
    return repo.save(entity);
  }

  async saveGetOwnedPointCount ({ blockHash, blockNumber, contractAddress, _whose, value, proof }: DeepPartial<GetOwnedPointCount>): Promise<GetOwnedPointCount> {
    const repo = this._conn.getRepository(GetOwnedPointCount);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _whose, value, proof });
    return repo.save(entity);
  }

  async saveGetOwnedPointAtIndex ({ blockHash, blockNumber, contractAddress, _whose, _index, value, proof }: DeepPartial<GetOwnedPointAtIndex>): Promise<GetOwnedPointAtIndex> {
    const repo = this._conn.getRepository(GetOwnedPointAtIndex);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _whose, _index, value, proof });
    return repo.save(entity);
  }

  async saveGetManagementProxy ({ blockHash, blockNumber, contractAddress, _point, value, proof }: DeepPartial<GetManagementProxy>): Promise<GetManagementProxy> {
    const repo = this._conn.getRepository(GetManagementProxy);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _point, value, proof });
    return repo.save(entity);
  }

  async saveIsManagementProxy ({ blockHash, blockNumber, contractAddress, _point, _proxy, value, proof }: DeepPartial<IsManagementProxy>): Promise<IsManagementProxy> {
    const repo = this._conn.getRepository(IsManagementProxy);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _point, _proxy, value, proof });
    return repo.save(entity);
  }

  async saveCanManage ({ blockHash, blockNumber, contractAddress, _point, _who, value, proof }: DeepPartial<CanManage>): Promise<CanManage> {
    const repo = this._conn.getRepository(CanManage);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _point, _who, value, proof });
    return repo.save(entity);
  }

  async saveGetManagerForCount ({ blockHash, blockNumber, contractAddress, _proxy, value, proof }: DeepPartial<GetManagerForCount>): Promise<GetManagerForCount> {
    const repo = this._conn.getRepository(GetManagerForCount);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _proxy, value, proof });
    return repo.save(entity);
  }

  async saveGetSpawnProxy ({ blockHash, blockNumber, contractAddress, _point, value, proof }: DeepPartial<GetSpawnProxy>): Promise<GetSpawnProxy> {
    const repo = this._conn.getRepository(GetSpawnProxy);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _point, value, proof });
    return repo.save(entity);
  }

  async saveIsSpawnProxy ({ blockHash, blockNumber, contractAddress, _point, _proxy, value, proof }: DeepPartial<IsSpawnProxy>): Promise<IsSpawnProxy> {
    const repo = this._conn.getRepository(IsSpawnProxy);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _point, _proxy, value, proof });
    return repo.save(entity);
  }

  async saveCanSpawnAs ({ blockHash, blockNumber, contractAddress, _point, _who, value, proof }: DeepPartial<CanSpawnAs>): Promise<CanSpawnAs> {
    const repo = this._conn.getRepository(CanSpawnAs);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _point, _who, value, proof });
    return repo.save(entity);
  }

  async saveGetSpawningForCount ({ blockHash, blockNumber, contractAddress, _proxy, value, proof }: DeepPartial<GetSpawningForCount>): Promise<GetSpawningForCount> {
    const repo = this._conn.getRepository(GetSpawningForCount);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _proxy, value, proof });
    return repo.save(entity);
  }

  async saveGetVotingProxy ({ blockHash, blockNumber, contractAddress, _point, value, proof }: DeepPartial<GetVotingProxy>): Promise<GetVotingProxy> {
    const repo = this._conn.getRepository(GetVotingProxy);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _point, value, proof });
    return repo.save(entity);
  }

  async saveIsVotingProxy ({ blockHash, blockNumber, contractAddress, _point, _proxy, value, proof }: DeepPartial<IsVotingProxy>): Promise<IsVotingProxy> {
    const repo = this._conn.getRepository(IsVotingProxy);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _point, _proxy, value, proof });
    return repo.save(entity);
  }

  async saveCanVoteAs ({ blockHash, blockNumber, contractAddress, _point, _who, value, proof }: DeepPartial<CanVoteAs>): Promise<CanVoteAs> {
    const repo = this._conn.getRepository(CanVoteAs);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _point, _who, value, proof });
    return repo.save(entity);
  }

  async saveGetVotingForCount ({ blockHash, blockNumber, contractAddress, _proxy, value, proof }: DeepPartial<GetVotingForCount>): Promise<GetVotingForCount> {
    const repo = this._conn.getRepository(GetVotingForCount);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _proxy, value, proof });
    return repo.save(entity);
  }

  async saveGetTransferProxy ({ blockHash, blockNumber, contractAddress, _point, value, proof }: DeepPartial<GetTransferProxy>): Promise<GetTransferProxy> {
    const repo = this._conn.getRepository(GetTransferProxy);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _point, value, proof });
    return repo.save(entity);
  }

  async saveIsTransferProxy ({ blockHash, blockNumber, contractAddress, _point, _proxy, value, proof }: DeepPartial<IsTransferProxy>): Promise<IsTransferProxy> {
    const repo = this._conn.getRepository(IsTransferProxy);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _point, _proxy, value, proof });
    return repo.save(entity);
  }

  async saveCanTransfer ({ blockHash, blockNumber, contractAddress, _point, _who, value, proof }: DeepPartial<CanTransfer>): Promise<CanTransfer> {
    const repo = this._conn.getRepository(CanTransfer);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _point, _who, value, proof });
    return repo.save(entity);
  }

  async saveGetTransferringForCount ({ blockHash, blockNumber, contractAddress, _proxy, value, proof }: DeepPartial<GetTransferringForCount>): Promise<GetTransferringForCount> {
    const repo = this._conn.getRepository(GetTransferringForCount);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _proxy, value, proof });
    return repo.save(entity);
  }

  async saveIsOperator ({ blockHash, blockNumber, contractAddress, _owner, _operator, value, proof }: DeepPartial<IsOperator>): Promise<IsOperator> {
    const repo = this._conn.getRepository(IsOperator);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _owner, _operator, value, proof });
    return repo.save(entity);
  }

  async saveGetCensuringCount ({ blockHash, blockNumber, contractAddress, _whose, value, proof }: DeepPartial<GetCensuringCount>): Promise<GetCensuringCount> {
    const repo = this._conn.getRepository(GetCensuringCount);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _whose, value, proof });
    return repo.save(entity);
  }

  async saveGetCensuredByCount ({ blockHash, blockNumber, contractAddress, _who, value, proof }: DeepPartial<GetCensuredByCount>): Promise<GetCensuredByCount> {
    const repo = this._conn.getRepository(GetCensuredByCount);
    const entity = repo.create({ blockHash, blockNumber, contractAddress, _who, value, proof });
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

  async saveContract (queryRunner: QueryRunner, address: string, kind: string, checkpoint: boolean, startingBlock: number): Promise<Contract> {
    const repo = queryRunner.manager.getRepository(Contract);

    return this._baseDatabase.saveContract(repo, address, kind, checkpoint, startingBlock);
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

  async getAncestorAtDepth (blockHash: string, depth: number): Promise<string> {
    return this._baseDatabase.getAncestorAtDepth(blockHash, depth);
  }

  _getPropertyColumnMapForEntity (entityName: string): Map<string, string> {
    return this._conn.getMetadata(entityName).ownColumns.reduce((acc, curr) => {
      return acc.set(curr.propertyName, curr.databaseName);
    }, new Map<string, string>());
  }

  _setPropColMaps (): void {
    this._propColMaps.IsActive = this._getPropertyColumnMapForEntity('IsActive');
    this._propColMaps.GetKeyRevisionNumber = this._getPropertyColumnMapForEntity('GetKeyRevisionNumber');
    this._propColMaps.HasBeenLinked = this._getPropertyColumnMapForEntity('HasBeenLinked');
    this._propColMaps.IsLive = this._getPropertyColumnMapForEntity('IsLive');
    this._propColMaps.GetContinuityNumber = this._getPropertyColumnMapForEntity('GetContinuityNumber');
    this._propColMaps.GetSpawnCount = this._getPropertyColumnMapForEntity('GetSpawnCount');
    this._propColMaps.HasSponsor = this._getPropertyColumnMapForEntity('HasSponsor');
    this._propColMaps.GetSponsor = this._getPropertyColumnMapForEntity('GetSponsor');
    this._propColMaps.IsSponsor = this._getPropertyColumnMapForEntity('IsSponsor');
    this._propColMaps.GetSponsoringCount = this._getPropertyColumnMapForEntity('GetSponsoringCount');
    this._propColMaps.IsEscaping = this._getPropertyColumnMapForEntity('IsEscaping');
    this._propColMaps.GetEscapeRequest = this._getPropertyColumnMapForEntity('GetEscapeRequest');
    this._propColMaps.IsRequestingEscapeTo = this._getPropertyColumnMapForEntity('IsRequestingEscapeTo');
    this._propColMaps.GetEscapeRequestsCount = this._getPropertyColumnMapForEntity('GetEscapeRequestsCount');
    this._propColMaps.GetOwner = this._getPropertyColumnMapForEntity('GetOwner');
    this._propColMaps.IsOwner = this._getPropertyColumnMapForEntity('IsOwner');
    this._propColMaps.GetOwnedPointCount = this._getPropertyColumnMapForEntity('GetOwnedPointCount');
    this._propColMaps.GetOwnedPointAtIndex = this._getPropertyColumnMapForEntity('GetOwnedPointAtIndex');
    this._propColMaps.GetManagementProxy = this._getPropertyColumnMapForEntity('GetManagementProxy');
    this._propColMaps.IsManagementProxy = this._getPropertyColumnMapForEntity('IsManagementProxy');
    this._propColMaps.CanManage = this._getPropertyColumnMapForEntity('CanManage');
    this._propColMaps.GetManagerForCount = this._getPropertyColumnMapForEntity('GetManagerForCount');
    this._propColMaps.GetSpawnProxy = this._getPropertyColumnMapForEntity('GetSpawnProxy');
    this._propColMaps.IsSpawnProxy = this._getPropertyColumnMapForEntity('IsSpawnProxy');
    this._propColMaps.CanSpawnAs = this._getPropertyColumnMapForEntity('CanSpawnAs');
    this._propColMaps.GetSpawningForCount = this._getPropertyColumnMapForEntity('GetSpawningForCount');
    this._propColMaps.GetVotingProxy = this._getPropertyColumnMapForEntity('GetVotingProxy');
    this._propColMaps.IsVotingProxy = this._getPropertyColumnMapForEntity('IsVotingProxy');
    this._propColMaps.CanVoteAs = this._getPropertyColumnMapForEntity('CanVoteAs');
    this._propColMaps.GetVotingForCount = this._getPropertyColumnMapForEntity('GetVotingForCount');
    this._propColMaps.GetTransferProxy = this._getPropertyColumnMapForEntity('GetTransferProxy');
    this._propColMaps.IsTransferProxy = this._getPropertyColumnMapForEntity('IsTransferProxy');
    this._propColMaps.CanTransfer = this._getPropertyColumnMapForEntity('CanTransfer');
    this._propColMaps.GetTransferringForCount = this._getPropertyColumnMapForEntity('GetTransferringForCount');
    this._propColMaps.IsOperator = this._getPropertyColumnMapForEntity('IsOperator');
    this._propColMaps.GetCensuringCount = this._getPropertyColumnMapForEntity('GetCensuringCount');
    this._propColMaps.GetCensuredByCount = this._getPropertyColumnMapForEntity('GetCensuredByCount');
  }
}
