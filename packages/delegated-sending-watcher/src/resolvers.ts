//
// Copyright 2021 Vulcanize, Inc.
//

import assert from 'assert';
import BigInt from 'apollo-type-bigint';
import debug from 'debug';
import Decimal from 'decimal.js';
import {
  GraphQLScalarType,
  GraphQLResolveInfo
} from 'graphql';

import {
  ValueResult,
  gqlTotalQueryCount,
  gqlQueryCount,
  getResultState,
  IndexerInterface,
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
    BigInt: new BigInt('bigInt'),

    BigDecimal: new GraphQLScalarType({
      name: 'BigDecimal',
      description: 'BigDecimal custom scalar type',
      parseValue (value) {
        // value from the client
        return new Decimal(value);
      },
      serialize (value: Decimal) {
        // value sent to the client
        return value.toFixed();
      }
    }),

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
      canSend: (
        _: any,
        { blockHash, contractAddress, _as, _point }: { blockHash: string, contractAddress: string, _as: bigint, _point: bigint },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        __: any,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('canSend', blockHash, contractAddress, _as, _point);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('canSend').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.canSend(blockHash, contractAddress, _as, _point);
      },

      getPool: (
        _: any,
        { blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        __: any,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getPool', blockHash, contractAddress, _point);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getPool').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getPool(blockHash, contractAddress, _point);
      },

      canReceive: (
        _: any,
        { blockHash, contractAddress, _recipient }: { blockHash: string, contractAddress: string, _recipient: string },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        __: any,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('canReceive', blockHash, contractAddress, _recipient);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('canReceive').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.canReceive(blockHash, contractAddress, _recipient);
      },

      getPoolStars: (
        _: any,
        { blockHash, contractAddress, _who }: { blockHash: string, contractAddress: string, _who: bigint },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        __: any,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getPoolStars', blockHash, contractAddress, _who);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getPoolStars').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getPoolStars(blockHash, contractAddress, _who);
      },

      getInviters: (
        _: any,
        { blockHash, contractAddress }: { blockHash: string, contractAddress: string },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        __: any,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getInviters', blockHash, contractAddress);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getInviters').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getInviters(blockHash, contractAddress);
      },

      getInvited: (
        _: any,
        { blockHash, contractAddress, _who }: { blockHash: string, contractAddress: string, _who: bigint },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        __: any,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getInvited', blockHash, contractAddress, _who);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getInvited').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getInvited(blockHash, contractAddress, _who);
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

        const { expected, actual } = await indexer.getProcessedBlockCountForRange(fromBlockNumber, toBlockNumber);
        if (expected !== actual) {
          throw new Error(`Range not available, expected ${expected}, got ${actual} blocks in range`);
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
