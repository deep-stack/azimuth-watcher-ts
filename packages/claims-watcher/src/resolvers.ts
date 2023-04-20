//
// Copyright 2021 Vulcanize, Inc.
//

import assert from 'assert';
import BigInt from 'apollo-type-bigint';
import debug from 'debug';
import Decimal from 'decimal.js';
import { GraphQLResolveInfo, GraphQLScalarType } from 'graphql';

import {
  ValueResult,
  BlockHeight,
  gqlTotalQueryCount,
  gqlQueryCount,
  jsonBigIntStringReplacer,
  getResultState,
  setGQLCacheHints,
  IndexerInterface,
  EventWatcher
} from '@cerc-io/util';

import { Indexer } from './indexer';

const log = debug('vulcanize:resolver');

export const createResolvers = async (indexerArg: IndexerInterface, eventWatcher: EventWatcher): Promise<any> => {
  const indexer = indexerArg as Indexer;

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
      isActive: (
        _: any,
        { blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('isActive', blockHash, contractAddress, _point);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('isActive').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.isActive(blockHash, contractAddress, _point);
      },

      getKeyRevisionNumber: (
        _: any,
        { blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getKeyRevisionNumber', blockHash, contractAddress, _point);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getKeyRevisionNumber').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getKeyRevisionNumber(blockHash, contractAddress, _point);
      },

      hasBeenLinked: (
        _: any,
        { blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('hasBeenLinked', blockHash, contractAddress, _point);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('hasBeenLinked').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.hasBeenLinked(blockHash, contractAddress, _point);
      },

      isLive: (
        _: any,
        { blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('isLive', blockHash, contractAddress, _point);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('isLive').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.isLive(blockHash, contractAddress, _point);
      },

      getContinuityNumber: (
        _: any,
        { blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getContinuityNumber', blockHash, contractAddress, _point);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getContinuityNumber').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getContinuityNumber(blockHash, contractAddress, _point);
      },

      getSpawnCount: (
        _: any,
        { blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getSpawnCount', blockHash, contractAddress, _point);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getSpawnCount').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getSpawnCount(blockHash, contractAddress, _point);
      },

      getSpawned: (
        _: any,
        { blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getSpawned', blockHash, contractAddress, _point);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getSpawned').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getSpawned(blockHash, contractAddress, _point);
      },

      hasSponsor: (
        _: any,
        { blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('hasSponsor', blockHash, contractAddress, _point);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('hasSponsor').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.hasSponsor(blockHash, contractAddress, _point);
      },

      getSponsor: (
        _: any,
        { blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getSponsor', blockHash, contractAddress, _point);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getSponsor').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getSponsor(blockHash, contractAddress, _point);
      },

      isSponsor: (
        _: any,
        { blockHash, contractAddress, _point, _sponsor }: { blockHash: string, contractAddress: string, _point: bigint, _sponsor: bigint },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('isSponsor', blockHash, contractAddress, _point, _sponsor);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('isSponsor').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.isSponsor(blockHash, contractAddress, _point, _sponsor);
      },

      getSponsoringCount: (
        _: any,
        { blockHash, contractAddress, _sponsor }: { blockHash: string, contractAddress: string, _sponsor: bigint },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getSponsoringCount', blockHash, contractAddress, _sponsor);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getSponsoringCount').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getSponsoringCount(blockHash, contractAddress, _sponsor);
      },

      getSponsoring: (
        _: any,
        { blockHash, contractAddress, _sponsor }: { blockHash: string, contractAddress: string, _sponsor: bigint },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getSponsoring', blockHash, contractAddress, _sponsor);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getSponsoring').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getSponsoring(blockHash, contractAddress, _sponsor);
      },

      isEscaping: (
        _: any,
        { blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('isEscaping', blockHash, contractAddress, _point);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('isEscaping').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.isEscaping(blockHash, contractAddress, _point);
      },

      getEscapeRequest: (
        _: any,
        { blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getEscapeRequest', blockHash, contractAddress, _point);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getEscapeRequest').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getEscapeRequest(blockHash, contractAddress, _point);
      },

      isRequestingEscapeTo: (
        _: any,
        { blockHash, contractAddress, _point, _sponsor }: { blockHash: string, contractAddress: string, _point: bigint, _sponsor: bigint },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('isRequestingEscapeTo', blockHash, contractAddress, _point, _sponsor);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('isRequestingEscapeTo').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.isRequestingEscapeTo(blockHash, contractAddress, _point, _sponsor);
      },

      getEscapeRequestsCount: (
        _: any,
        { blockHash, contractAddress, _sponsor }: { blockHash: string, contractAddress: string, _sponsor: bigint },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getEscapeRequestsCount', blockHash, contractAddress, _sponsor);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getEscapeRequestsCount').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getEscapeRequestsCount(blockHash, contractAddress, _sponsor);
      },

      getEscapeRequests: (
        _: any,
        { blockHash, contractAddress, _sponsor }: { blockHash: string, contractAddress: string, _sponsor: bigint },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getEscapeRequests', blockHash, contractAddress, _sponsor);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getEscapeRequests').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getEscapeRequests(blockHash, contractAddress, _sponsor);
      },

      getOwner: (
        _: any,
        { blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getOwner', blockHash, contractAddress, _point);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getOwner').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getOwner(blockHash, contractAddress, _point);
      },

      isOwner: (
        _: any,
        { blockHash, contractAddress, _point, _address }: { blockHash: string, contractAddress: string, _point: bigint, _address: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('isOwner', blockHash, contractAddress, _point, _address);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('isOwner').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.isOwner(blockHash, contractAddress, _point, _address);
      },

      getOwnedPointCount: (
        _: any,
        { blockHash, contractAddress, _whose }: { blockHash: string, contractAddress: string, _whose: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getOwnedPointCount', blockHash, contractAddress, _whose);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getOwnedPointCount').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getOwnedPointCount(blockHash, contractAddress, _whose);
      },

      getOwnedPoints: (
        _: any,
        { blockHash, contractAddress, _whose }: { blockHash: string, contractAddress: string, _whose: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getOwnedPoints', blockHash, contractAddress, _whose);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getOwnedPoints').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getOwnedPoints(blockHash, contractAddress, _whose);
      },

      getOwnedPointAtIndex: (
        _: any,
        { blockHash, contractAddress, _whose, _index }: { blockHash: string, contractAddress: string, _whose: string, _index: bigint },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getOwnedPointAtIndex', blockHash, contractAddress, _whose, _index);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getOwnedPointAtIndex').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getOwnedPointAtIndex(blockHash, contractAddress, _whose, _index);
      },

      getManagementProxy: (
        _: any,
        { blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getManagementProxy', blockHash, contractAddress, _point);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getManagementProxy').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getManagementProxy(blockHash, contractAddress, _point);
      },

      isManagementProxy: (
        _: any,
        { blockHash, contractAddress, _point, _proxy }: { blockHash: string, contractAddress: string, _point: bigint, _proxy: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('isManagementProxy', blockHash, contractAddress, _point, _proxy);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('isManagementProxy').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.isManagementProxy(blockHash, contractAddress, _point, _proxy);
      },

      canManage: (
        _: any,
        { blockHash, contractAddress, _point, _who }: { blockHash: string, contractAddress: string, _point: bigint, _who: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('canManage', blockHash, contractAddress, _point, _who);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('canManage').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.canManage(blockHash, contractAddress, _point, _who);
      },

      getManagerForCount: (
        _: any,
        { blockHash, contractAddress, _proxy }: { blockHash: string, contractAddress: string, _proxy: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getManagerForCount', blockHash, contractAddress, _proxy);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getManagerForCount').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getManagerForCount(blockHash, contractAddress, _proxy);
      },

      getManagerFor: (
        _: any,
        { blockHash, contractAddress, _proxy }: { blockHash: string, contractAddress: string, _proxy: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getManagerFor', blockHash, contractAddress, _proxy);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getManagerFor').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getManagerFor(blockHash, contractAddress, _proxy);
      },

      getSpawnProxy: (
        _: any,
        { blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getSpawnProxy', blockHash, contractAddress, _point);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getSpawnProxy').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getSpawnProxy(blockHash, contractAddress, _point);
      },

      isSpawnProxy: (
        _: any,
        { blockHash, contractAddress, _point, _proxy }: { blockHash: string, contractAddress: string, _point: bigint, _proxy: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('isSpawnProxy', blockHash, contractAddress, _point, _proxy);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('isSpawnProxy').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.isSpawnProxy(blockHash, contractAddress, _point, _proxy);
      },

      canSpawnAs: (
        _: any,
        { blockHash, contractAddress, _point, _who }: { blockHash: string, contractAddress: string, _point: bigint, _who: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('canSpawnAs', blockHash, contractAddress, _point, _who);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('canSpawnAs').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.canSpawnAs(blockHash, contractAddress, _point, _who);
      },

      getSpawningForCount: (
        _: any,
        { blockHash, contractAddress, _proxy }: { blockHash: string, contractAddress: string, _proxy: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getSpawningForCount', blockHash, contractAddress, _proxy);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getSpawningForCount').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getSpawningForCount(blockHash, contractAddress, _proxy);
      },

      getSpawningFor: (
        _: any,
        { blockHash, contractAddress, _proxy }: { blockHash: string, contractAddress: string, _proxy: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getSpawningFor', blockHash, contractAddress, _proxy);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getSpawningFor').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getSpawningFor(blockHash, contractAddress, _proxy);
      },

      getVotingProxy: (
        _: any,
        { blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getVotingProxy', blockHash, contractAddress, _point);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getVotingProxy').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getVotingProxy(blockHash, contractAddress, _point);
      },

      isVotingProxy: (
        _: any,
        { blockHash, contractAddress, _point, _proxy }: { blockHash: string, contractAddress: string, _point: bigint, _proxy: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('isVotingProxy', blockHash, contractAddress, _point, _proxy);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('isVotingProxy').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.isVotingProxy(blockHash, contractAddress, _point, _proxy);
      },

      canVoteAs: (
        _: any,
        { blockHash, contractAddress, _point, _who }: { blockHash: string, contractAddress: string, _point: bigint, _who: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('canVoteAs', blockHash, contractAddress, _point, _who);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('canVoteAs').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.canVoteAs(blockHash, contractAddress, _point, _who);
      },

      getVotingForCount: (
        _: any,
        { blockHash, contractAddress, _proxy }: { blockHash: string, contractAddress: string, _proxy: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getVotingForCount', blockHash, contractAddress, _proxy);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getVotingForCount').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getVotingForCount(blockHash, contractAddress, _proxy);
      },

      getVotingFor: (
        _: any,
        { blockHash, contractAddress, _proxy }: { blockHash: string, contractAddress: string, _proxy: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getVotingFor', blockHash, contractAddress, _proxy);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getVotingFor').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getVotingFor(blockHash, contractAddress, _proxy);
      },

      getTransferProxy: (
        _: any,
        { blockHash, contractAddress, _point }: { blockHash: string, contractAddress: string, _point: bigint },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getTransferProxy', blockHash, contractAddress, _point);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getTransferProxy').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getTransferProxy(blockHash, contractAddress, _point);
      },

      isTransferProxy: (
        _: any,
        { blockHash, contractAddress, _point, _proxy }: { blockHash: string, contractAddress: string, _point: bigint, _proxy: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('isTransferProxy', blockHash, contractAddress, _point, _proxy);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('isTransferProxy').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.isTransferProxy(blockHash, contractAddress, _point, _proxy);
      },

      canTransfer: (
        _: any,
        { blockHash, contractAddress, _point, _who }: { blockHash: string, contractAddress: string, _point: bigint, _who: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('canTransfer', blockHash, contractAddress, _point, _who);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('canTransfer').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.canTransfer(blockHash, contractAddress, _point, _who);
      },

      getTransferringForCount: (
        _: any,
        { blockHash, contractAddress, _proxy }: { blockHash: string, contractAddress: string, _proxy: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getTransferringForCount', blockHash, contractAddress, _proxy);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getTransferringForCount').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getTransferringForCount(blockHash, contractAddress, _proxy);
      },

      getTransferringFor: (
        _: any,
        { blockHash, contractAddress, _proxy }: { blockHash: string, contractAddress: string, _proxy: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getTransferringFor', blockHash, contractAddress, _proxy);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getTransferringFor').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getTransferringFor(blockHash, contractAddress, _proxy);
      },

      isOperator: (
        _: any,
        { blockHash, contractAddress, _owner, _operator }: { blockHash: string, contractAddress: string, _owner: string, _operator: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('isOperator', blockHash, contractAddress, _owner, _operator);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('isOperator').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.isOperator(blockHash, contractAddress, _owner, _operator);
      },

      findClaim: (
        _: any,
        { blockHash, contractAddress, _whose, _protocol, _claim }: { blockHash: string, contractAddress: string, _whose: bigint, _protocol: string, _claim: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('findClaim', blockHash, contractAddress, _whose, _protocol, _claim);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('findClaim').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.findClaim(blockHash, contractAddress, _whose, _protocol, _claim);
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
