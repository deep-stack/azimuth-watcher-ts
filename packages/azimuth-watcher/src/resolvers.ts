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
      isActive: (
        _: any,
        { blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('isActive', blockHash, contractAddress, _point);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'isActive',
          expressContext,
          async () => indexer.isActive(blockHash, contractAddress, _point)
        );
      },

      getKeys: (
        _: any,
        { blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getKeys', blockHash, contractAddress, _point);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getKeys',
          expressContext,
          async () => indexer.getKeys(blockHash, contractAddress, _point)
        );
      },

      getKeyRevisionNumber: (
        _: any,
        { blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getKeyRevisionNumber', blockHash, contractAddress, _point);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getKeyRevisionNumber',
          expressContext,
          async () => indexer.getKeyRevisionNumber(blockHash, contractAddress, _point)
        );
      },

      hasBeenLinked: (
        _: any,
        { blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('hasBeenLinked', blockHash, contractAddress, _point);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'hasBeenLinked',
          expressContext,
          async () => indexer.hasBeenLinked(blockHash, contractAddress, _point)
        );
      },

      isLive: (
        _: any,
        { blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('isLive', blockHash, contractAddress, _point);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'isLive',
          expressContext,
          async () => indexer.isLive(blockHash, contractAddress, _point)
        );
      },

      getContinuityNumber: (
        _: any,
        { blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getContinuityNumber', blockHash, contractAddress, _point);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getContinuityNumber',
          expressContext,
          async () => indexer.getContinuityNumber(blockHash, contractAddress, _point)
        );
      },

      getSpawnCount: (
        _: any,
        { blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getSpawnCount', blockHash, contractAddress, _point);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getSpawnCount',
          expressContext,
          async () => indexer.getSpawnCount(blockHash, contractAddress, _point)
        );
      },

      getSpawned: (
        _: any,
        { blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getSpawned', blockHash, contractAddress, _point);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getSpawned',
          expressContext,
          async () => indexer.getSpawned(blockHash, contractAddress, _point)
        );
      },

      hasSponsor: (
        _: any,
        { blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('hasSponsor', blockHash, contractAddress, _point);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'hasSponsor',
          expressContext,
          async () => indexer.hasSponsor(blockHash, contractAddress, _point)
        );
      },

      getSponsor: (
        _: any,
        { blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getSponsor', blockHash, contractAddress, _point);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getSponsor',
          expressContext,
          async () => indexer.getSponsor(blockHash, contractAddress, _point)
        );
      },

      isSponsor: (
        _: any,
        { blockHash, contractAddress, _point, _sponsor }: { blockHash: string, contractAddress: string, _point: bigint, _sponsor: bigint },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('isSponsor', blockHash, contractAddress, _point, _sponsor);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'isSponsor',
          expressContext,
          async () => indexer.isSponsor(blockHash, contractAddress, _point, _sponsor)
        );
      },

      getSponsoringCount: (
        _: any,
        { blockHash, contractAddress, _sponsor }: { blockHash: string, contractAddress: string, _sponsor: bigint },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getSponsoringCount', blockHash, contractAddress, _sponsor);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getSponsoringCount',
          expressContext,
          async () => indexer.getSponsoringCount(blockHash, contractAddress, _sponsor)
        );
      },

      getSponsoring: (
        _: any,
        { blockHash, contractAddress, _sponsor }: { blockHash: string, contractAddress: string, _sponsor: bigint },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getSponsoring', blockHash, contractAddress, _sponsor);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getSponsoring',
          expressContext,
          async () => indexer.getSponsoring(blockHash, contractAddress, _sponsor)
        );
      },

      isEscaping: (
        _: any,
        { blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('isEscaping', blockHash, contractAddress, _point);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'isEscaping',
          expressContext,
          async () => indexer.isEscaping(blockHash, contractAddress, _point)
        );
      },

      getEscapeRequest: (
        _: any,
        { blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getEscapeRequest', blockHash, contractAddress, _point);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getEscapeRequest',
          expressContext,
          async () => indexer.getEscapeRequest(blockHash, contractAddress, _point)
        );
      },

      isRequestingEscapeTo: (
        _: any,
        { blockHash, contractAddress, _point, _sponsor }: { blockHash: string, contractAddress: string, _point: bigint, _sponsor: bigint },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('isRequestingEscapeTo', blockHash, contractAddress, _point, _sponsor);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'isRequestingEscapeTo',
          expressContext,
          async () => indexer.isRequestingEscapeTo(blockHash, contractAddress, _point, _sponsor)
        );
      },

      getEscapeRequestsCount: (
        _: any,
        { blockHash, contractAddress, _sponsor }: { blockHash: string, contractAddress: string, _sponsor: bigint },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getEscapeRequestsCount', blockHash, contractAddress, _sponsor);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getEscapeRequestsCount',
          expressContext,
          async () => indexer.getEscapeRequestsCount(blockHash, contractAddress, _sponsor)
        );
      },

      getEscapeRequests: (
        _: any,
        { blockHash, contractAddress, _sponsor }: { blockHash: string, contractAddress: string, _sponsor: bigint },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getEscapeRequests', blockHash, contractAddress, _sponsor);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getEscapeRequests',
          expressContext,
          async () => indexer.getEscapeRequests(blockHash, contractAddress, _sponsor)
        );
      },

      getOwner: (
        _: any,
        { blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getOwner', blockHash, contractAddress, _point);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getOwner',
          expressContext,
          async () => indexer.getOwner(blockHash, contractAddress, _point)
        );
      },

      isOwner: (
        _: any,
        { blockHash, contractAddress, _point, _address }: { blockHash: string, contractAddress: string, _point: bigint, _address: string },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('isOwner', blockHash, contractAddress, _point, _address);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'isOwner',
          expressContext,
          async () => indexer.isOwner(blockHash, contractAddress, _point, _address)
        );
      },

      getOwnedPointCount: (
        _: any,
        { blockHash, contractAddress, _whose }: { blockHash: string, contractAddress: string, _whose: string },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getOwnedPointCount', blockHash, contractAddress, _whose);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getOwnedPointCount',
          expressContext,
          async () => indexer.getOwnedPointCount(blockHash, contractAddress, _whose)
        );
      },

      getOwnedPoints: (
        _: any,
        { blockHash, contractAddress, _whose }: { blockHash: string, contractAddress: string, _whose: string },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getOwnedPoints', blockHash, contractAddress, _whose);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getOwnedPoints',
          expressContext,
          async () => indexer.getOwnedPoints(blockHash, contractAddress, _whose)
        );
      },

      getOwnedPointAtIndex: (
        _: any,
        { blockHash, contractAddress, _whose, _index }: { blockHash: string, contractAddress: string, _whose: string, _index: bigint },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getOwnedPointAtIndex', blockHash, contractAddress, _whose, _index);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getOwnedPointAtIndex',
          expressContext,
          async () => indexer.getOwnedPointAtIndex(blockHash, contractAddress, _whose, _index)
        );
      },

      getManagementProxy: (
        _: any,
        { blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getManagementProxy', blockHash, contractAddress, _point);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getManagementProxy',
          expressContext,
          async () => indexer.getManagementProxy(blockHash, contractAddress, _point)
        );
      },

      isManagementProxy: (
        _: any,
        { blockHash, contractAddress, _point, _proxy }: { blockHash: string, contractAddress: string, _point: bigint, _proxy: string },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('isManagementProxy', blockHash, contractAddress, _point, _proxy);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'isManagementProxy',
          expressContext,
          async () => indexer.isManagementProxy(blockHash, contractAddress, _point, _proxy)
        );
      },

      canManage: (
        _: any,
        { blockHash, contractAddress, _point, _who }: { blockHash: string, contractAddress: string, _point: bigint, _who: string },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('canManage', blockHash, contractAddress, _point, _who);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'canManage',
          expressContext,
          async () => indexer.canManage(blockHash, contractAddress, _point, _who)
        );
      },

      getManagerForCount: (
        _: any,
        { blockHash, contractAddress, _proxy }: { blockHash: string, contractAddress: string, _proxy: string },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getManagerForCount', blockHash, contractAddress, _proxy);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getManagerForCount',
          expressContext,
          async () => indexer.getManagerForCount(blockHash, contractAddress, _proxy)
        );
      },

      getManagerFor: (
        _: any,
        { blockHash, contractAddress, _proxy }: { blockHash: string, contractAddress: string, _proxy: string },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getManagerFor', blockHash, contractAddress, _proxy);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getManagerFor',
          expressContext,
          async () => indexer.getManagerFor(blockHash, contractAddress, _proxy)
        );
      },

      getSpawnProxy: (
        _: any,
        { blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getSpawnProxy', blockHash, contractAddress, _point);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getSpawnProxy',
          expressContext,
          async () => indexer.getSpawnProxy(blockHash, contractAddress, _point)
        );
      },

      isSpawnProxy: (
        _: any,
        { blockHash, contractAddress, _point, _proxy }: { blockHash: string, contractAddress: string, _point: bigint, _proxy: string },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('isSpawnProxy', blockHash, contractAddress, _point, _proxy);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'isSpawnProxy',
          expressContext,
          async () => indexer.isSpawnProxy(blockHash, contractAddress, _point, _proxy)
        );
      },

      canSpawnAs: (
        _: any,
        { blockHash, contractAddress, _point, _who }: { blockHash: string, contractAddress: string, _point: bigint, _who: string },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('canSpawnAs', blockHash, contractAddress, _point, _who);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'canSpawnAs',
          expressContext,
          async () => indexer.canSpawnAs(blockHash, contractAddress, _point, _who)
        );
      },

      getSpawningForCount: (
        _: any,
        { blockHash, contractAddress, _proxy }: { blockHash: string, contractAddress: string, _proxy: string },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getSpawningForCount', blockHash, contractAddress, _proxy);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getSpawningForCount',
          expressContext,
          async () => indexer.getSpawningForCount(blockHash, contractAddress, _proxy)
        );
      },

      getSpawningFor: (
        _: any,
        { blockHash, contractAddress, _proxy }: { blockHash: string, contractAddress: string, _proxy: string },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getSpawningFor', blockHash, contractAddress, _proxy);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getSpawningFor',
          expressContext,
          async () => indexer.getSpawningFor(blockHash, contractAddress, _proxy)
        );
      },

      getVotingProxy: (
        _: any,
        { blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getVotingProxy', blockHash, contractAddress, _point);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getVotingProxy',
          expressContext,
          async () => indexer.getVotingProxy(blockHash, contractAddress, _point)
        );
      },

      isVotingProxy: (
        _: any,
        { blockHash, contractAddress, _point, _proxy }: { blockHash: string, contractAddress: string, _point: bigint, _proxy: string },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('isVotingProxy', blockHash, contractAddress, _point, _proxy);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'isVotingProxy',
          expressContext,
          async () => indexer.isVotingProxy(blockHash, contractAddress, _point, _proxy)
        );
      },

      canVoteAs: (
        _: any,
        { blockHash, contractAddress, _point, _who }: { blockHash: string, contractAddress: string, _point: bigint, _who: string },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('canVoteAs', blockHash, contractAddress, _point, _who);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'canVoteAs',
          expressContext,
          async () => indexer.canVoteAs(blockHash, contractAddress, _point, _who)
        );
      },

      getVotingForCount: (
        _: any,
        { blockHash, contractAddress, _proxy }: { blockHash: string, contractAddress: string, _proxy: string },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getVotingForCount', blockHash, contractAddress, _proxy);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getVotingForCount',
          expressContext,
          async () => indexer.getVotingForCount(blockHash, contractAddress, _proxy)
        );
      },

      getVotingFor: (
        _: any,
        { blockHash, contractAddress, _proxy }: { blockHash: string, contractAddress: string, _proxy: string },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getVotingFor', blockHash, contractAddress, _proxy);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getVotingFor',
          expressContext,
          async () => indexer.getVotingFor(blockHash, contractAddress, _proxy)
        );
      },

      getTransferProxy: (
        _: any,
        { blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getTransferProxy', blockHash, contractAddress, _point);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getTransferProxy',
          expressContext,
          async () => indexer.getTransferProxy(blockHash, contractAddress, _point)
        );
      },

      isTransferProxy: (
        _: any,
        { blockHash, contractAddress, _point, _proxy }: { blockHash: string, contractAddress: string, _point: bigint, _proxy: string },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('isTransferProxy', blockHash, contractAddress, _point, _proxy);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'isTransferProxy',
          expressContext,
          async () => indexer.isTransferProxy(blockHash, contractAddress, _point, _proxy)
        );
      },

      canTransfer: (
        _: any,
        { blockHash, contractAddress, _point, _who }: { blockHash: string, contractAddress: string, _point: bigint, _who: string },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('canTransfer', blockHash, contractAddress, _point, _who);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'canTransfer',
          expressContext,
          async () => indexer.canTransfer(blockHash, contractAddress, _point, _who)
        );
      },

      getTransferringForCount: (
        _: any,
        { blockHash, contractAddress, _proxy }: { blockHash: string, contractAddress: string, _proxy: string },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getTransferringForCount', blockHash, contractAddress, _proxy);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getTransferringForCount',
          expressContext,
          async () => indexer.getTransferringForCount(blockHash, contractAddress, _proxy)
        );
      },

      getTransferringFor: (
        _: any,
        { blockHash, contractAddress, _proxy }: { blockHash: string, contractAddress: string, _proxy: string },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getTransferringFor', blockHash, contractAddress, _proxy);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'getTransferringFor',
          expressContext,
          async () => indexer.getTransferringFor(blockHash, contractAddress, _proxy)
        );
      },

      isOperator: (
        _: any,
        { blockHash, contractAddress, _owner, _operator }: { blockHash: string, contractAddress: string, _owner: string, _operator: string },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expressContext: ExpressContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('isOperator', blockHash, contractAddress, _owner, _operator);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return executeAndRecordMetrics(
          indexer,
          gqlLogger,
          'isOperator',
          expressContext,
          async () => indexer.isOperator(blockHash, contractAddress, _owner, _operator)
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
