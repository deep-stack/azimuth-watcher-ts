//
// Copyright 2021 Vulcanize, Inc.
//

import assert from 'assert';
import debug from 'debug';
import { GraphQLResolveInfo } from 'graphql';
import { ExpressContext } from 'apollo-server-express';
import winston from 'winston';

import {
  ValueResult,
  gqlTotalQueryCount,
  gqlQueryCount,
  gqlQueryDuration,
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

const executeAndRecordMetrics = async (
  indexer: Indexer,
  gqlLogger: winston.Logger,
  opName: string,
  expressContext: ExpressContext,
  operation: () => Promise<any>
) => {
  gqlTotalQueryCount.inc(1);
  gqlQueryCount.labels(opName).inc(1);
  const endTimer = gqlQueryDuration.labels(opName).startTimer();

  try {
    const [result, syncStatus] = await Promise.all([
      operation(),
      indexer.getSyncStatus()
    ]);

    gqlLogger.info({
      opName,
      query: expressContext.req.body.query,
      variables: expressContext.req.body.variables,
      latestIndexedBlockNumber: syncStatus?.latestIndexedBlockNumber,
      urlPath: expressContext.req.path,
      apiKey: expressContext.req.header('x-api-key'),
      origin: expressContext.req.headers.origin
    });
    return result;
  } catch (error) {
    gqlLogger.error({
      opName,
      error,
      query: expressContext.req.body.query,
      variables: expressContext.req.body.variables,
      urlPath: expressContext.req.path,
      apiKey: expressContext.req.header('x-api-key'),
      origin: expressContext.req.headers.origin
    });

    throw error;
  } finally {
    endTimer();
  }
};

export const createResolvers = async (
  indexerArg: IndexerInterface,
  eventWatcher: EventWatcher,
  gqlLogger: winston.Logger
): Promise<any> => {
  const indexer = indexerArg as Indexer;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const gqlCacheConfig = indexer.serverConfig.gql.cache;

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
      withdrawLimit: (
        _: any,
        { blockHash, contractAddress, _participant, _batch }: { blockHash: string, contractAddress: string, _participant: string, _batch: number },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('withdrawLimit', blockHash, contractAddress, _participant, _batch);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'withdrawLimit',
          expressContext,
          async () => indexer.withdrawLimit(blockHash, contractAddress, _participant, _batch)
        );
      },

      verifyBalance: (
        _: any,
        { blockHash, contractAddress, _participant }: { blockHash: string, contractAddress: string, _participant: string },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('verifyBalance', blockHash, contractAddress, _participant);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'verifyBalance',
          expressContext,
          async () => indexer.verifyBalance(blockHash, contractAddress, _participant)
        );
      },

      getBatches: (
        _: any,
        { blockHash, contractAddress, _participant }: { blockHash: string, contractAddress: string, _participant: string },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getBatches', blockHash, contractAddress, _participant);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getBatches',
          expressContext,
          async () => indexer.getBatches(blockHash, contractAddress, _participant)
        );
      },

      getBatch: (
        _: any,
        { blockHash, contractAddress, _participant, _batch }: { blockHash: string, contractAddress: string, _participant: string, _batch: number },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getBatch', blockHash, contractAddress, _participant, _batch);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getBatch',
          expressContext,
          async () => indexer.getBatch(blockHash, contractAddress, _participant, _batch)
        );
      },

      getWithdrawn: (
        _: any,
        { blockHash, contractAddress, _participant }: { blockHash: string, contractAddress: string, _participant: string },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getWithdrawn', blockHash, contractAddress, _participant);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getWithdrawn',
          expressContext,
          async () => indexer.getWithdrawn(blockHash, contractAddress, _participant)
        );
      },

      getWithdrawnFromBatch: (
        _: any,
        { blockHash, contractAddress, _participant, _batch }: { blockHash: string, contractAddress: string, _participant: string, _batch: number },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getWithdrawnFromBatch', blockHash, contractAddress, _participant, _batch);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getWithdrawnFromBatch',
          expressContext,
          async () => indexer.getWithdrawnFromBatch(blockHash, contractAddress, _participant, _batch)
        );
      },

      getForfeited: (
        _: any,
        { blockHash, contractAddress, _participant }: { blockHash: string, contractAddress: string, _participant: string },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getForfeited', blockHash, contractAddress, _participant);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getForfeited',
          expressContext,
          async () => indexer.getForfeited(blockHash, contractAddress, _participant)
        );
      },

      hasForfeitedBatch: (
        _: any,
        { blockHash, contractAddress, _participant, _batch }: { blockHash: string, contractAddress: string, _participant: string, _batch: number },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('hasForfeitedBatch', blockHash, contractAddress, _participant, _batch);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'hasForfeitedBatch',
          expressContext,
          async () => indexer.hasForfeitedBatch(blockHash, contractAddress, _participant, _batch)
        );
      },

      getRemainingStars: (
        _: any,
        { blockHash, contractAddress, _participant }: { blockHash: string, contractAddress: string, _participant: string },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getRemainingStars', blockHash, contractAddress, _participant);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getRemainingStars',
          expressContext,
          async () => indexer.getRemainingStars(blockHash, contractAddress, _participant)
        );
      },

      getConditionsState: (
        _: any,
        { blockHash, contractAddress }: { blockHash: string, contractAddress: string },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getConditionsState', blockHash, contractAddress);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getConditionsState',
          expressContext,
          async () => indexer.getConditionsState(blockHash, contractAddress)
        );
      },

      events: async (
        _: any,
        { blockHash, contractAddress, name }: { blockHash: string, contractAddress: string, name?: string },
        expressContext: ExpressContext
      ) => {
        log('events', blockHash, contractAddress, name);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'events',
          expressContext,
          async () => {
            const block = await indexer.getBlockProgress(blockHash);
            if (!block || !block.isComplete) {
              throw new Error(`Block hash ${blockHash} number ${block?.blockNumber} not processed yet`);
            }

            const events = await indexer.getEventsByFilter(blockHash, contractAddress, name);
            return events.map(event => indexer.getResultEvent(event));
          }
        );
      },

      eventsInRange: async (
        _: any,
        { fromBlockNumber, toBlockNumber }: { fromBlockNumber: number, toBlockNumber: number },
        expressContext: ExpressContext
      ) => {
        log('eventsInRange', fromBlockNumber, toBlockNumber);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'eventsInRange',
          expressContext,
          async () => {
            const syncStatus = await indexer.getSyncStatus();

            if (!syncStatus) {
              throw new Error('No blocks processed yet');
            }

            if ((fromBlockNumber < syncStatus.initialIndexedBlockNumber) || (toBlockNumber > syncStatus.latestProcessedBlockNumber)) {
              throw new Error(`Block range should be between ${syncStatus.initialIndexedBlockNumber} and ${syncStatus.latestProcessedBlockNumber}`);
            }

            const events = await indexer.getEventsInRange(fromBlockNumber, toBlockNumber);
            return events.map(event => indexer.getResultEvent(event));
          }
        );
      },

      getStateByCID: async (
        _: any,
        { cid }: { cid: string },
        expressContext: ExpressContext
      ) => {
        log('getStateByCID', cid);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getStateByCID',
          expressContext,
          async () => {
            const state = await indexer.getStateByCID(cid);

            return state && state.block.isComplete ? getResultState(state) : undefined;
          }
        );
      },

      getState: async (
        _: any,
        { blockHash, contractAddress, kind }: { blockHash: string, contractAddress: string, kind: string },
        expressContext: ExpressContext
      ) => {
        log('getState', blockHash, contractAddress, kind);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getState',
          expressContext,
          async () => {
            const state = await indexer.getPrevState(blockHash, contractAddress, kind);

            return state && state.block.isComplete ? getResultState(state) : undefined;
          }
        );
      },

      getSyncStatus: async (
        _: any,
        __: Record<string, never>,
        expressContext: ExpressContext
      ) => {
        log('getSyncStatus');

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getSyncStatus',
          expressContext,
          async () => indexer.getSyncStatus()
        );
      }
    }
  };
};
