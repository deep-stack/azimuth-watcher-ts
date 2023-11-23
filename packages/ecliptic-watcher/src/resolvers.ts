//
// Copyright 2021 Vulcanize, Inc.
//

import assert from 'assert';
import debug from 'debug';
import { GraphQLResolveInfo } from 'graphql';

import {
  ValueResult,
  gqlTotalQueryCount,
  gqlQueryCount,
  getResultState,
  IndexerInterface,
  GraphQLBigInt,
  GraphQLBigDecimal,
  EventWatcher,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGQLCacheHints
} from '@cerc-io/util';

import { Indexer } from './indexer';

const log = debug('vulcanize:resolver');

export const createResolvers = async (indexerArg: IndexerInterface, eventWatcher: EventWatcher): Promise<any> => {
  const indexer = indexerArg as Indexer;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const gqlCacheConfig = indexer.serverConfig.gqlCache;

  return {
    BigInt: GraphQLBigInt,

    BigDecimal: GraphQLBigDecimal,

    Event: {
      __resolveType: (obj: any) => {
        assert(obj.__typename);

        return obj.__typename;
      }
    },

    Subscription: {
      onEvent: {
        subscribe: () => eventWatcher.getEventIterator()
      }
    },

    Mutation: {
      watchContract: async (_: any, { address, kind, checkpoint, startingBlock = 1 }: { address: string, kind: string, checkpoint: boolean, startingBlock: number }): Promise<boolean> => {
        log('watchContract', address, kind, checkpoint, startingBlock);
        await indexer.watchContract(address, kind, checkpoint, startingBlock);

        return true;
      }
    },

    Query: {
      supportsInterface: (
        _: any,
        { blockHash, contractAddress, _interfaceId }: { blockHash: string, contractAddress: string, _interfaceId: string },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        __: any,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('supportsInterface', blockHash, contractAddress, _interfaceId);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('supportsInterface').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.supportsInterface(blockHash, contractAddress, _interfaceId);
      },

      name: (
        _: any,
        { blockHash, contractAddress }: { blockHash: string, contractAddress: string },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        __: any,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('name', blockHash, contractAddress);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('name').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.name(blockHash, contractAddress);
      },

      symbol: (
        _: any,
        { blockHash, contractAddress }: { blockHash: string, contractAddress: string },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        __: any,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('symbol', blockHash, contractAddress);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('symbol').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.symbol(blockHash, contractAddress);
      },

      tokenURI: (
        _: any,
        { blockHash, contractAddress, _tokenId }: { blockHash: string, contractAddress: string, _tokenId: bigint },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        __: any,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('tokenURI', blockHash, contractAddress, _tokenId);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('tokenURI').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.tokenURI(blockHash, contractAddress, _tokenId);
      },

      balanceOf: (
        _: any,
        { blockHash, contractAddress, _owner }: { blockHash: string, contractAddress: string, _owner: string },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        __: any,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('balanceOf', blockHash, contractAddress, _owner);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('balanceOf').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.balanceOf(blockHash, contractAddress, _owner);
      },

      ownerOf: (
        _: any,
        { blockHash, contractAddress, _tokenId }: { blockHash: string, contractAddress: string, _tokenId: bigint },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        __: any,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('ownerOf', blockHash, contractAddress, _tokenId);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('ownerOf').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.ownerOf(blockHash, contractAddress, _tokenId);
      },

      exists: (
        _: any,
        { blockHash, contractAddress, _tokenId }: { blockHash: string, contractAddress: string, _tokenId: bigint },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        __: any,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('exists', blockHash, contractAddress, _tokenId);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('exists').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.exists(blockHash, contractAddress, _tokenId);
      },

      getApproved: (
        _: any,
        { blockHash, contractAddress, _tokenId }: { blockHash: string, contractAddress: string, _tokenId: bigint },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        __: any,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getApproved', blockHash, contractAddress, _tokenId);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getApproved').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getApproved(blockHash, contractAddress, _tokenId);
      },

      isApprovedForAll: (
        _: any,
        { blockHash, contractAddress, _owner, _operator }: { blockHash: string, contractAddress: string, _owner: string, _operator: string },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        __: any,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('isApprovedForAll', blockHash, contractAddress, _owner, _operator);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('isApprovedForAll').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.isApprovedForAll(blockHash, contractAddress, _owner, _operator);
      },

      getSpawnLimit: (
        _: any,
        { blockHash, contractAddress, _point, _time }: { blockHash: string, contractAddress: string, _point: bigint, _time: bigint },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        __: any,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getSpawnLimit', blockHash, contractAddress, _point, _time);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getSpawnLimit').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getSpawnLimit(blockHash, contractAddress, _point, _time);
      },

      canEscapeTo: (
        _: any,
        { blockHash, contractAddress, _point, _sponsor }: { blockHash: string, contractAddress: string, _point: bigint, _sponsor: bigint },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        __: any,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('canEscapeTo', blockHash, contractAddress, _point, _sponsor);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('canEscapeTo').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.canEscapeTo(blockHash, contractAddress, _point, _sponsor);
      },

      events: async (_: any, { blockHash, contractAddress, name }: { blockHash: string, contractAddress: string, name?: string }) => {
        log('events', blockHash, contractAddress, name);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('events').inc(1);

        const block = await indexer.getBlockProgress(blockHash);
        if (!block || !block.isComplete) {
          throw new Error(`Block hash ${blockHash} number ${block?.blockNumber} not processed yet`);
        }

        const events = await indexer.getEventsByFilter(blockHash, contractAddress, name);
        return events.map(event => indexer.getResultEvent(event));
      },

      eventsInRange: async (_: any, { fromBlockNumber, toBlockNumber }: { fromBlockNumber: number, toBlockNumber: number }) => {
        log('eventsInRange', fromBlockNumber, toBlockNumber);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('eventsInRange').inc(1);

        const syncStatus = await indexer.getSyncStatus();

        if (!syncStatus) {
          throw new Error('No blocks processed yet');
        }

        if ((fromBlockNumber < syncStatus.initialIndexedBlockNumber) || (toBlockNumber > syncStatus.latestProcessedBlockNumber)) {
          throw new Error(`Block range should be between ${syncStatus.initialIndexedBlockNumber} and ${syncStatus.latestProcessedBlockNumber}`);
        }

        const events = await indexer.getEventsInRange(fromBlockNumber, toBlockNumber);
        return events.map(event => indexer.getResultEvent(event));
      },

      getStateByCID: async (_: any, { cid }: { cid: string }) => {
        log('getStateByCID', cid);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getStateByCID').inc(1);

        const state = await indexer.getStateByCID(cid);

        return state && state.block.isComplete ? getResultState(state) : undefined;
      },

      getState: async (_: any, { blockHash, contractAddress, kind }: { blockHash: string, contractAddress: string, kind: string }) => {
        log('getState', blockHash, contractAddress, kind);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getState').inc(1);

        const state = await indexer.getPrevState(blockHash, contractAddress, kind);

        return state && state.block.isComplete ? getResultState(state) : undefined;
      },

      getSyncStatus: async () => {
        log('getSyncStatus');
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getSyncStatus').inc(1);

        return indexer.getSyncStatus();
      }
    }
  };
};
