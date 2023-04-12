//
// Copyright 2021 Vulcanize, Inc.
//

import assert from 'assert';
import debug from 'debug';
import { DeepPartial, FindConditions, FindManyOptions, ObjectLiteral } from 'typeorm';
import JSONbig from 'json-bigint';
import { ethers } from 'ethers';

import { JsonFragment } from '@ethersproject/abi';
import { BaseProvider } from '@ethersproject/providers';
import { EthClient } from '@cerc-io/ipld-eth-client';
import { MappingKey, StorageLayout } from '@cerc-io/solidity-mapper';
import {
  Indexer as BaseIndexer,
  IndexerInterface,
  ValueResult,
  ServerConfig,
  JobQueue,
  Where,
  QueryOptions,
  updateStateForElementaryType,
  updateStateForMappingType,
  StateKind,
  StateStatus,
  ResultEvent,
  getResultEvent,
  DatabaseInterface,
  Clients
} from '@cerc-io/util';

import ConditionalStarReleaseArtifacts from './artifacts/ConditionalStarRelease.json';
import { Database, ENTITIES } from './database';
import { createInitialState, handleEvent, createStateDiff, createStateCheckpoint } from './hooks';
import { Contract } from './entity/Contract';
import { Event } from './entity/Event';
import { SyncStatus } from './entity/SyncStatus';
import { StateSyncStatus } from './entity/StateSyncStatus';
import { BlockProgress } from './entity/BlockProgress';
import { State } from './entity/State';

const log = debug('vulcanize:indexer');
const JSONbigNative = JSONbig({ useNativeBigInt: true });

const KIND_CONDITIONALSTARRELEASE = 'ConditionalStarRelease';

export class Indexer implements IndexerInterface {
  _db: Database;
  _ethClient: EthClient;
  _ethProvider: BaseProvider;
  _baseIndexer: BaseIndexer;
  _serverConfig: ServerConfig;

  _abiMap: Map<string, JsonFragment[]>;
  _storageLayoutMap: Map<string, StorageLayout>;
  _contractMap: Map<string, ethers.utils.Interface>;

  constructor (serverConfig: ServerConfig, db: DatabaseInterface, clients: Clients, ethProvider: BaseProvider, jobQueue: JobQueue) {
    assert(db);
    assert(clients.ethClient);

    this._db = db as Database;
    this._ethClient = clients.ethClient;
    this._ethProvider = ethProvider;
    this._serverConfig = serverConfig;
    this._baseIndexer = new BaseIndexer(this._serverConfig, this._db, this._ethClient, this._ethProvider, jobQueue);

    this._abiMap = new Map();
    this._storageLayoutMap = new Map();
    this._contractMap = new Map();

    const { abi: ConditionalStarReleaseABI } = ConditionalStarReleaseArtifacts;

    assert(ConditionalStarReleaseABI);
    this._abiMap.set(KIND_CONDITIONALSTARRELEASE, ConditionalStarReleaseABI);
    this._contractMap.set(KIND_CONDITIONALSTARRELEASE, new ethers.utils.Interface(ConditionalStarReleaseABI));
  }

  get serverConfig (): ServerConfig {
    return this._serverConfig;
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

  async isActive (blockHash: string, contractAddress: string, _point: number): Promise<ValueResult> {
    const entity = await this._db.getIsActive({ blockHash, contractAddress, _point });
    if (entity) {
      log('isActive: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('isActive: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.isActive(_point, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveIsActive({ blockHash, blockNumber, contractAddress, _point, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async getKeyRevisionNumber (blockHash: string, contractAddress: string, _point: number): Promise<ValueResult> {
    const entity = await this._db.getGetKeyRevisionNumber({ blockHash, contractAddress, _point });
    if (entity) {
      log('getKeyRevisionNumber: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('getKeyRevisionNumber: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.getKeyRevisionNumber(_point, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveGetKeyRevisionNumber({ blockHash, blockNumber, contractAddress, _point, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async hasBeenLinked (blockHash: string, contractAddress: string, _point: number): Promise<ValueResult> {
    const entity = await this._db.getHasBeenLinked({ blockHash, contractAddress, _point });
    if (entity) {
      log('hasBeenLinked: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('hasBeenLinked: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.hasBeenLinked(_point, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveHasBeenLinked({ blockHash, blockNumber, contractAddress, _point, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async isLive (blockHash: string, contractAddress: string, _point: number): Promise<ValueResult> {
    const entity = await this._db.getIsLive({ blockHash, contractAddress, _point });
    if (entity) {
      log('isLive: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('isLive: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.isLive(_point, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveIsLive({ blockHash, blockNumber, contractAddress, _point, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async getContinuityNumber (blockHash: string, contractAddress: string, _point: number): Promise<ValueResult> {
    const entity = await this._db.getGetContinuityNumber({ blockHash, contractAddress, _point });
    if (entity) {
      log('getContinuityNumber: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('getContinuityNumber: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.getContinuityNumber(_point, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveGetContinuityNumber({ blockHash, blockNumber, contractAddress, _point, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async getSpawnCount (blockHash: string, contractAddress: string, _point: number): Promise<ValueResult> {
    const entity = await this._db.getGetSpawnCount({ blockHash, contractAddress, _point });
    if (entity) {
      log('getSpawnCount: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('getSpawnCount: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.getSpawnCount(_point, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveGetSpawnCount({ blockHash, blockNumber, contractAddress, _point, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async hasSponsor (blockHash: string, contractAddress: string, _point: number): Promise<ValueResult> {
    const entity = await this._db.getHasSponsor({ blockHash, contractAddress, _point });
    if (entity) {
      log('hasSponsor: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('hasSponsor: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.hasSponsor(_point, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveHasSponsor({ blockHash, blockNumber, contractAddress, _point, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async getSponsor (blockHash: string, contractAddress: string, _point: number): Promise<ValueResult> {
    const entity = await this._db.getGetSponsor({ blockHash, contractAddress, _point });
    if (entity) {
      log('getSponsor: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('getSponsor: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.getSponsor(_point, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveGetSponsor({ blockHash, blockNumber, contractAddress, _point, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async isSponsor (blockHash: string, contractAddress: string, _point: number, _sponsor: number): Promise<ValueResult> {
    const entity = await this._db.getIsSponsor({ blockHash, contractAddress, _point, _sponsor });
    if (entity) {
      log('isSponsor: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('isSponsor: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.isSponsor(_point, _sponsor, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveIsSponsor({ blockHash, blockNumber, contractAddress, _point, _sponsor, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async getSponsoringCount (blockHash: string, contractAddress: string, _sponsor: number): Promise<ValueResult> {
    const entity = await this._db.getGetSponsoringCount({ blockHash, contractAddress, _sponsor });
    if (entity) {
      log('getSponsoringCount: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('getSponsoringCount: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    let value = await contract.getSponsoringCount(_sponsor, { blockTag: blockHash });
    value = value.toString();
    value = BigInt(value);

    const result: ValueResult = { value };

    await this._db.saveGetSponsoringCount({ blockHash, blockNumber, contractAddress, _sponsor, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async isEscaping (blockHash: string, contractAddress: string, _point: number): Promise<ValueResult> {
    const entity = await this._db.getIsEscaping({ blockHash, contractAddress, _point });
    if (entity) {
      log('isEscaping: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('isEscaping: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.isEscaping(_point, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveIsEscaping({ blockHash, blockNumber, contractAddress, _point, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async getEscapeRequest (blockHash: string, contractAddress: string, _point: number): Promise<ValueResult> {
    const entity = await this._db.getGetEscapeRequest({ blockHash, contractAddress, _point });
    if (entity) {
      log('getEscapeRequest: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('getEscapeRequest: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.getEscapeRequest(_point, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveGetEscapeRequest({ blockHash, blockNumber, contractAddress, _point, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async isRequestingEscapeTo (blockHash: string, contractAddress: string, _point: number, _sponsor: number): Promise<ValueResult> {
    const entity = await this._db.getIsRequestingEscapeTo({ blockHash, contractAddress, _point, _sponsor });
    if (entity) {
      log('isRequestingEscapeTo: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('isRequestingEscapeTo: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.isRequestingEscapeTo(_point, _sponsor, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveIsRequestingEscapeTo({ blockHash, blockNumber, contractAddress, _point, _sponsor, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async getEscapeRequestsCount (blockHash: string, contractAddress: string, _sponsor: number): Promise<ValueResult> {
    const entity = await this._db.getGetEscapeRequestsCount({ blockHash, contractAddress, _sponsor });
    if (entity) {
      log('getEscapeRequestsCount: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('getEscapeRequestsCount: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    let value = await contract.getEscapeRequestsCount(_sponsor, { blockTag: blockHash });
    value = value.toString();
    value = BigInt(value);

    const result: ValueResult = { value };

    await this._db.saveGetEscapeRequestsCount({ blockHash, blockNumber, contractAddress, _sponsor, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async getOwner (blockHash: string, contractAddress: string, _point: number): Promise<ValueResult> {
    const entity = await this._db.getGetOwner({ blockHash, contractAddress, _point });
    if (entity) {
      log('getOwner: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('getOwner: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.getOwner(_point, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveGetOwner({ blockHash, blockNumber, contractAddress, _point, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async isOwner (blockHash: string, contractAddress: string, _point: number, _address: string): Promise<ValueResult> {
    const entity = await this._db.getIsOwner({ blockHash, contractAddress, _point, _address });
    if (entity) {
      log('isOwner: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('isOwner: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.isOwner(_point, _address, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveIsOwner({ blockHash, blockNumber, contractAddress, _point, _address, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async getOwnedPointCount (blockHash: string, contractAddress: string, _whose: string): Promise<ValueResult> {
    const entity = await this._db.getGetOwnedPointCount({ blockHash, contractAddress, _whose });
    if (entity) {
      log('getOwnedPointCount: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('getOwnedPointCount: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    let value = await contract.getOwnedPointCount(_whose, { blockTag: blockHash });
    value = value.toString();
    value = BigInt(value);

    const result: ValueResult = { value };

    await this._db.saveGetOwnedPointCount({ blockHash, blockNumber, contractAddress, _whose, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async getOwnedPointAtIndex (blockHash: string, contractAddress: string, _whose: string, _index: bigint): Promise<ValueResult> {
    const entity = await this._db.getGetOwnedPointAtIndex({ blockHash, contractAddress, _whose, _index });
    if (entity) {
      log('getOwnedPointAtIndex: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('getOwnedPointAtIndex: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.getOwnedPointAtIndex(_whose, _index, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveGetOwnedPointAtIndex({ blockHash, blockNumber, contractAddress, _whose, _index, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async getManagementProxy (blockHash: string, contractAddress: string, _point: number): Promise<ValueResult> {
    const entity = await this._db.getGetManagementProxy({ blockHash, contractAddress, _point });
    if (entity) {
      log('getManagementProxy: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('getManagementProxy: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.getManagementProxy(_point, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveGetManagementProxy({ blockHash, blockNumber, contractAddress, _point, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async isManagementProxy (blockHash: string, contractAddress: string, _point: number, _proxy: string): Promise<ValueResult> {
    const entity = await this._db.getIsManagementProxy({ blockHash, contractAddress, _point, _proxy });
    if (entity) {
      log('isManagementProxy: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('isManagementProxy: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.isManagementProxy(_point, _proxy, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveIsManagementProxy({ blockHash, blockNumber, contractAddress, _point, _proxy, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async canManage (blockHash: string, contractAddress: string, _point: number, _who: string): Promise<ValueResult> {
    const entity = await this._db.getCanManage({ blockHash, contractAddress, _point, _who });
    if (entity) {
      log('canManage: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('canManage: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.canManage(_point, _who, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveCanManage({ blockHash, blockNumber, contractAddress, _point, _who, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async getManagerForCount (blockHash: string, contractAddress: string, _proxy: string): Promise<ValueResult> {
    const entity = await this._db.getGetManagerForCount({ blockHash, contractAddress, _proxy });
    if (entity) {
      log('getManagerForCount: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('getManagerForCount: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    let value = await contract.getManagerForCount(_proxy, { blockTag: blockHash });
    value = value.toString();
    value = BigInt(value);

    const result: ValueResult = { value };

    await this._db.saveGetManagerForCount({ blockHash, blockNumber, contractAddress, _proxy, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async getSpawnProxy (blockHash: string, contractAddress: string, _point: number): Promise<ValueResult> {
    const entity = await this._db.getGetSpawnProxy({ blockHash, contractAddress, _point });
    if (entity) {
      log('getSpawnProxy: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('getSpawnProxy: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.getSpawnProxy(_point, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveGetSpawnProxy({ blockHash, blockNumber, contractAddress, _point, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async isSpawnProxy (blockHash: string, contractAddress: string, _point: number, _proxy: string): Promise<ValueResult> {
    const entity = await this._db.getIsSpawnProxy({ blockHash, contractAddress, _point, _proxy });
    if (entity) {
      log('isSpawnProxy: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('isSpawnProxy: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.isSpawnProxy(_point, _proxy, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveIsSpawnProxy({ blockHash, blockNumber, contractAddress, _point, _proxy, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async canSpawnAs (blockHash: string, contractAddress: string, _point: number, _who: string): Promise<ValueResult> {
    const entity = await this._db.getCanSpawnAs({ blockHash, contractAddress, _point, _who });
    if (entity) {
      log('canSpawnAs: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('canSpawnAs: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.canSpawnAs(_point, _who, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveCanSpawnAs({ blockHash, blockNumber, contractAddress, _point, _who, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async getSpawningForCount (blockHash: string, contractAddress: string, _proxy: string): Promise<ValueResult> {
    const entity = await this._db.getGetSpawningForCount({ blockHash, contractAddress, _proxy });
    if (entity) {
      log('getSpawningForCount: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('getSpawningForCount: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    let value = await contract.getSpawningForCount(_proxy, { blockTag: blockHash });
    value = value.toString();
    value = BigInt(value);

    const result: ValueResult = { value };

    await this._db.saveGetSpawningForCount({ blockHash, blockNumber, contractAddress, _proxy, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async getVotingProxy (blockHash: string, contractAddress: string, _point: number): Promise<ValueResult> {
    const entity = await this._db.getGetVotingProxy({ blockHash, contractAddress, _point });
    if (entity) {
      log('getVotingProxy: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('getVotingProxy: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.getVotingProxy(_point, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveGetVotingProxy({ blockHash, blockNumber, contractAddress, _point, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async isVotingProxy (blockHash: string, contractAddress: string, _point: number, _proxy: string): Promise<ValueResult> {
    const entity = await this._db.getIsVotingProxy({ blockHash, contractAddress, _point, _proxy });
    if (entity) {
      log('isVotingProxy: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('isVotingProxy: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.isVotingProxy(_point, _proxy, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveIsVotingProxy({ blockHash, blockNumber, contractAddress, _point, _proxy, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async canVoteAs (blockHash: string, contractAddress: string, _point: number, _who: string): Promise<ValueResult> {
    const entity = await this._db.getCanVoteAs({ blockHash, contractAddress, _point, _who });
    if (entity) {
      log('canVoteAs: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('canVoteAs: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.canVoteAs(_point, _who, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveCanVoteAs({ blockHash, blockNumber, contractAddress, _point, _who, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async getVotingForCount (blockHash: string, contractAddress: string, _proxy: string): Promise<ValueResult> {
    const entity = await this._db.getGetVotingForCount({ blockHash, contractAddress, _proxy });
    if (entity) {
      log('getVotingForCount: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('getVotingForCount: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    let value = await contract.getVotingForCount(_proxy, { blockTag: blockHash });
    value = value.toString();
    value = BigInt(value);

    const result: ValueResult = { value };

    await this._db.saveGetVotingForCount({ blockHash, blockNumber, contractAddress, _proxy, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async getTransferProxy (blockHash: string, contractAddress: string, _point: number): Promise<ValueResult> {
    const entity = await this._db.getGetTransferProxy({ blockHash, contractAddress, _point });
    if (entity) {
      log('getTransferProxy: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('getTransferProxy: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.getTransferProxy(_point, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveGetTransferProxy({ blockHash, blockNumber, contractAddress, _point, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async isTransferProxy (blockHash: string, contractAddress: string, _point: number, _proxy: string): Promise<ValueResult> {
    const entity = await this._db.getIsTransferProxy({ blockHash, contractAddress, _point, _proxy });
    if (entity) {
      log('isTransferProxy: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('isTransferProxy: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.isTransferProxy(_point, _proxy, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveIsTransferProxy({ blockHash, blockNumber, contractAddress, _point, _proxy, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async canTransfer (blockHash: string, contractAddress: string, _point: number, _who: string): Promise<ValueResult> {
    const entity = await this._db.getCanTransfer({ blockHash, contractAddress, _point, _who });
    if (entity) {
      log('canTransfer: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('canTransfer: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.canTransfer(_point, _who, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveCanTransfer({ blockHash, blockNumber, contractAddress, _point, _who, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async getTransferringForCount (blockHash: string, contractAddress: string, _proxy: string): Promise<ValueResult> {
    const entity = await this._db.getGetTransferringForCount({ blockHash, contractAddress, _proxy });
    if (entity) {
      log('getTransferringForCount: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('getTransferringForCount: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    let value = await contract.getTransferringForCount(_proxy, { blockTag: blockHash });
    value = value.toString();
    value = BigInt(value);

    const result: ValueResult = { value };

    await this._db.saveGetTransferringForCount({ blockHash, blockNumber, contractAddress, _proxy, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async isOperator (blockHash: string, contractAddress: string, _owner: string, _operator: string): Promise<ValueResult> {
    const entity = await this._db.getIsOperator({ blockHash, contractAddress, _owner, _operator });
    if (entity) {
      log('isOperator: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('isOperator: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.isOperator(_owner, _operator, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveIsOperator({ blockHash, blockNumber, contractAddress, _owner, _operator, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async getUpgradeProposalCount (blockHash: string, contractAddress: string): Promise<ValueResult> {
    const entity = await this._db.getGetUpgradeProposalCount({ blockHash, contractAddress });
    if (entity) {
      log('getUpgradeProposalCount: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('getUpgradeProposalCount: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    let value = await contract.getUpgradeProposalCount({ blockTag: blockHash });
    value = value.toString();
    value = BigInt(value);

    const result: ValueResult = { value };

    await this._db.saveGetUpgradeProposalCount({ blockHash, blockNumber, contractAddress, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async getDocumentProposalCount (blockHash: string, contractAddress: string): Promise<ValueResult> {
    const entity = await this._db.getGetDocumentProposalCount({ blockHash, contractAddress });
    if (entity) {
      log('getDocumentProposalCount: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('getDocumentProposalCount: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    let value = await contract.getDocumentProposalCount({ blockTag: blockHash });
    value = value.toString();
    value = BigInt(value);

    const result: ValueResult = { value };

    await this._db.saveGetDocumentProposalCount({ blockHash, blockNumber, contractAddress, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async hasVotedOnUpgradePoll (blockHash: string, contractAddress: string, _galaxy: number, _proposal: string): Promise<ValueResult> {
    const entity = await this._db.getHasVotedOnUpgradePoll({ blockHash, contractAddress, _galaxy, _proposal });
    if (entity) {
      log('hasVotedOnUpgradePoll: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('hasVotedOnUpgradePoll: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.hasVotedOnUpgradePoll(_galaxy, _proposal, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveHasVotedOnUpgradePoll({ blockHash, blockNumber, contractAddress, _galaxy, _proposal, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async hasVotedOnDocumentPoll (blockHash: string, contractAddress: string, _galaxy: number, _proposal: string): Promise<ValueResult> {
    const entity = await this._db.getHasVotedOnDocumentPoll({ blockHash, contractAddress, _galaxy, _proposal });
    if (entity) {
      log('hasVotedOnDocumentPoll: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('hasVotedOnDocumentPoll: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.hasVotedOnDocumentPoll(_galaxy, _proposal, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveHasVotedOnDocumentPoll({ blockHash, blockNumber, contractAddress, _galaxy, _proposal, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async findClaim (blockHash: string, contractAddress: string, _whose: number, _protocol: string, _claim: string): Promise<ValueResult> {
    const entity = await this._db.getFindClaim({ blockHash, contractAddress, _whose, _protocol, _claim });
    if (entity) {
      log('findClaim: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('findClaim: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.findClaim(_whose, _protocol, _claim, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveFindClaim({ blockHash, blockNumber, contractAddress, _whose, _protocol, _claim, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
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

    log('supportsInterface: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.supportsInterface(_interfaceId, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveSupportsInterface({ blockHash, blockNumber, contractAddress, _interfaceId, value: result.value, proof: JSONbigNative.stringify(result.proof) });

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

    log('balanceOf: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    let value = await contract.balanceOf(_owner, { blockTag: blockHash });
    value = value.toString();
    value = BigInt(value);

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

    log('ownerOf: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.ownerOf(_tokenId, { blockTag: blockHash });

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

    log('exists: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.exists(_tokenId, { blockTag: blockHash });

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

    log('getApproved: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.getApproved(_tokenId, { blockTag: blockHash });

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

    log('isApprovedForAll: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.isApprovedForAll(_owner, _operator, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveIsApprovedForAll({ blockHash, blockNumber, contractAddress, _owner, _operator, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async totalSupply (blockHash: string, contractAddress: string): Promise<ValueResult> {
    const entity = await this._db.getTotalSupply({ blockHash, contractAddress });
    if (entity) {
      log('totalSupply: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('totalSupply: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    let value = await contract.totalSupply({ blockTag: blockHash });
    value = value.toString();
    value = BigInt(value);

    const result: ValueResult = { value };

    await this._db.saveTotalSupply({ blockHash, blockNumber, contractAddress, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async tokenOfOwnerByIndex (blockHash: string, contractAddress: string, _owner: string, _index: bigint): Promise<ValueResult> {
    const entity = await this._db.getTokenOfOwnerByIndex({ blockHash, contractAddress, _owner, _index });
    if (entity) {
      log('tokenOfOwnerByIndex: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('tokenOfOwnerByIndex: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    let value = await contract.tokenOfOwnerByIndex(_owner, _index, { blockTag: blockHash });
    value = value.toString();
    value = BigInt(value);

    const result: ValueResult = { value };

    await this._db.saveTokenOfOwnerByIndex({ blockHash, blockNumber, contractAddress, _owner, _index, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async tokenByIndex (blockHash: string, contractAddress: string, _index: bigint): Promise<ValueResult> {
    const entity = await this._db.getTokenByIndex({ blockHash, contractAddress, _index });
    if (entity) {
      log('tokenByIndex: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('tokenByIndex: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    let value = await contract.tokenByIndex(_index, { blockTag: blockHash });
    value = value.toString();
    value = BigInt(value);

    const result: ValueResult = { value };

    await this._db.saveTokenByIndex({ blockHash, blockNumber, contractAddress, _index, value: result.value, proof: JSONbigNative.stringify(result.proof) });

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

    log('name: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.name({ blockTag: blockHash });

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

    log('symbol: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.symbol({ blockTag: blockHash });

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

    log('tokenURI: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.tokenURI(_tokenId, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveTokenURI({ blockHash, blockNumber, contractAddress, _tokenId, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async getSpawnLimit (blockHash: string, contractAddress: string, _point: number, _time: bigint): Promise<ValueResult> {
    const entity = await this._db.getGetSpawnLimit({ blockHash, contractAddress, _point, _time });
    if (entity) {
      log('getSpawnLimit: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('getSpawnLimit: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.getSpawnLimit(_point, _time, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveGetSpawnLimit({ blockHash, blockNumber, contractAddress, _point, _time, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async canEscapeTo (blockHash: string, contractAddress: string, _point: number, _sponsor: number): Promise<ValueResult> {
    const entity = await this._db.getCanEscapeTo({ blockHash, contractAddress, _point, _sponsor });
    if (entity) {
      log('canEscapeTo: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('canEscapeTo: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.canEscapeTo(_point, _sponsor, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveCanEscapeTo({ blockHash, blockNumber, contractAddress, _point, _sponsor, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async withdrawLimit (blockHash: string, contractAddress: string, _participant: string, _batch: number): Promise<ValueResult> {
    const entity = await this._db.getWithdrawLimit({ blockHash, contractAddress, _participant, _batch });
    if (entity) {
      log('withdrawLimit: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('withdrawLimit: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.withdrawLimit(_participant, _batch, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveWithdrawLimit({ blockHash, blockNumber, contractAddress, _participant, _batch, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async verifyBalance (blockHash: string, contractAddress: string, _participant: string): Promise<ValueResult> {
    const entity = await this._db.getVerifyBalance({ blockHash, contractAddress, _participant });
    if (entity) {
      log('verifyBalance: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('verifyBalance: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.verifyBalance(_participant, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveVerifyBalance({ blockHash, blockNumber, contractAddress, _participant, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async getBatch (blockHash: string, contractAddress: string, _participant: string, _batch: number): Promise<ValueResult> {
    const entity = await this._db.getGetBatch({ blockHash, contractAddress, _participant, _batch });
    if (entity) {
      log('getBatch: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('getBatch: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.getBatch(_participant, _batch, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveGetBatch({ blockHash, blockNumber, contractAddress, _participant, _batch, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async getBatches (blockHash: string, contractAddress: string, _participant: string): Promise<ValueResult> {
    const entity = await this._db.getGetBatches({ blockHash, contractAddress, _participant });
    if (entity) {
      log('getBatches: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('getBatches: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.getBatches(_participant, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveGetBatches({ blockHash, blockNumber, contractAddress, _participant, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async getWithdrawn (blockHash: string, contractAddress: string, _participant: string): Promise<ValueResult> {
    const entity = await this._db.getGetWithdrawn({ blockHash, contractAddress, _participant });
    if (entity) {
      log('getWithdrawn: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('getWithdrawn: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.getWithdrawn(_participant, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveGetWithdrawn({ blockHash, blockNumber, contractAddress, _participant, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async getRemainingStars (blockHash: string, contractAddress: string, _participant: string): Promise<ValueResult> {
    const entity = await this._db.getGetRemainingStars({ blockHash, contractAddress, _participant });
    if (entity) {
      log('getRemainingStars: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('getRemainingStars: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.getRemainingStars(_participant, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveGetRemainingStars({ blockHash, blockNumber, contractAddress, _participant, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async getForfeited (blockHash: string, contractAddress: string, _participant: string): Promise<ValueResult> {
    const entity = await this._db.getGetForfeited({ blockHash, contractAddress, _participant });
    if (entity) {
      log('getForfeited: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('getForfeited: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.getForfeited(_participant, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveGetForfeited({ blockHash, blockNumber, contractAddress, _participant, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async getWithdrawnFromBatch (blockHash: string, contractAddress: string, _participant: string, _batch: number): Promise<ValueResult> {
    const entity = await this._db.getGetWithdrawnFromBatch({ blockHash, contractAddress, _participant, _batch });
    if (entity) {
      log('getWithdrawnFromBatch: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('getWithdrawnFromBatch: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.getWithdrawnFromBatch(_participant, _batch, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveGetWithdrawnFromBatch({ blockHash, blockNumber, contractAddress, _participant, _batch, value: result.value, proof: JSONbigNative.stringify(result.proof) });

    return result;
  }

  async hasForfeitedBatch (blockHash: string, contractAddress: string, _participant: string, _batch: number): Promise<ValueResult> {
    const entity = await this._db.getHasForfeitedBatch({ blockHash, contractAddress, _participant, _batch });
    if (entity) {
      log('hasForfeitedBatch: db hit.');

      return {
        value: entity.value,
        proof: JSON.parse(entity.proof)
      };
    }

    log('hasForfeitedBatch: db miss, fetching from upstream server');

    const { block: { number } } = await this._ethClient.getBlockByHash(blockHash);
    const blockNumber = ethers.BigNumber.from(number).toNumber();

    const abi = this._abiMap.get(KIND_CONDITIONALSTARRELEASE);
    assert(abi);

    const contract = new ethers.Contract(contractAddress, abi, this._ethProvider);
    const value = await contract.hasForfeitedBatch(_participant, _batch, { blockTag: blockHash });

    const result: ValueResult = { value };

    await this._db.saveHasForfeitedBatch({ blockHash, blockNumber, contractAddress, _participant, _batch, value: result.value, proof: JSONbigNative.stringify(result.proof) });

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

  async processCanonicalBlock (blockHash: string, blockNumber: number): Promise<void> {
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

  async triggerIndexingOnEvent (event: Event): Promise<void> {
    const resultEvent = this.getResultEvent(event);

    // Call custom hook function for indexing on event.
    await handleEvent(this, resultEvent);
  }

  async processEvent (event: Event): Promise<void> {
    // Trigger indexing of data based on the event.
    await this.triggerIndexingOnEvent(event);
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

  async updateStateSyncStatusIndexedBlock (blockNumber: number, force?: boolean): Promise<StateSyncStatus> {
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

  async getLatestCanonicalBlock (): Promise<BlockProgress> {
    const syncStatus = await this.getSyncStatus();
    assert(syncStatus);

    const latestCanonicalBlock = await this.getBlockProgress(syncStatus.latestCanonicalBlockHash);
    assert(latestCanonicalBlock);

    return latestCanonicalBlock;
  }

  async getLatestStateIndexedBlock (): Promise<BlockProgress> {
    return this._baseIndexer.getLatestStateIndexedBlock();
  }

  async watchContract (address: string, kind: string, checkpoint: boolean, startingBlock: number): Promise<void> {
    return this._baseIndexer.watchContract(address, kind, checkpoint, startingBlock);
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

  async getEventsByFilter (blockHash: string, contract?: string, name?: string): Promise<Array<Event>> {
    return this._baseIndexer.getEventsByFilter(blockHash, contract, name);
  }

  isWatchedContract (address : string): Contract | undefined {
    return this._baseIndexer.isWatchedContract(address);
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

  async saveBlockAndFetchEvents (block: DeepPartial<BlockProgress>): Promise<[BlockProgress, DeepPartial<Event>[]]> {
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

  async _saveBlockAndFetchEvents ({
    cid: blockCid,
    blockHash,
    blockNumber,
    blockTimestamp,
    parentHash
  }: DeepPartial<BlockProgress>): Promise<[BlockProgress, DeepPartial<Event>[]]> {
    assert(blockHash);
    assert(blockNumber);

    const dbEvents = await this._baseIndexer.fetchEvents(blockHash, blockNumber, this.parseEventNameAndArgs.bind(this));

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

      return [blockProgress, []];
    } catch (error) {
      await dbTx.rollbackTransaction();
      throw error;
    } finally {
      await dbTx.release();
    }
  }
}
