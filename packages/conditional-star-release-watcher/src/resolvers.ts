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

      getUpgradeProposals: (
        _: any,
        { blockHash, contractAddress }: { blockHash: string, contractAddress: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getUpgradeProposals', blockHash, contractAddress);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getUpgradeProposals').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getUpgradeProposals(blockHash, contractAddress);
      },

      getUpgradeProposalCount: (
        _: any,
        { blockHash, contractAddress }: { blockHash: string, contractAddress: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getUpgradeProposalCount', blockHash, contractAddress);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getUpgradeProposalCount').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getUpgradeProposalCount(blockHash, contractAddress);
      },

      getDocumentProposals: (
        _: any,
        { blockHash, contractAddress }: { blockHash: string, contractAddress: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getDocumentProposals', blockHash, contractAddress);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getDocumentProposals').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getDocumentProposals(blockHash, contractAddress);
      },

      getDocumentProposalCount: (
        _: any,
        { blockHash, contractAddress }: { blockHash: string, contractAddress: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getDocumentProposalCount', blockHash, contractAddress);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getDocumentProposalCount').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getDocumentProposalCount(blockHash, contractAddress);
      },

      getDocumentMajorities: (
        _: any,
        { blockHash, contractAddress }: { blockHash: string, contractAddress: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getDocumentMajorities', blockHash, contractAddress);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getDocumentMajorities').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getDocumentMajorities(blockHash, contractAddress);
      },

      hasVotedOnUpgradePoll: (
        _: any,
        { blockHash, contractAddress, _galaxy, _proposal }: { blockHash: string, contractAddress: string, _galaxy: number, _proposal: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('hasVotedOnUpgradePoll', blockHash, contractAddress, _galaxy, _proposal);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('hasVotedOnUpgradePoll').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.hasVotedOnUpgradePoll(blockHash, contractAddress, _galaxy, _proposal);
      },

      hasVotedOnDocumentPoll: (
        _: any,
        { blockHash, contractAddress, _galaxy, _proposal }: { blockHash: string, contractAddress: string, _galaxy: number, _proposal: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('hasVotedOnDocumentPoll', blockHash, contractAddress, _galaxy, _proposal);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('hasVotedOnDocumentPoll').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.hasVotedOnDocumentPoll(blockHash, contractAddress, _galaxy, _proposal);
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

      supportsInterface: (
        _: any,
        { blockHash, contractAddress, _interfaceId }: { blockHash: string, contractAddress: string, _interfaceId: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('supportsInterface', blockHash, contractAddress, _interfaceId);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('supportsInterface').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.supportsInterface(blockHash, contractAddress, _interfaceId);
      },

      balanceOf: (
        _: any,
        { blockHash, contractAddress, _owner }: { blockHash: string, contractAddress: string, _owner: string },
        __: any,
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
        __: any,
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
        __: any,
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
        __: any,
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
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('isApprovedForAll', blockHash, contractAddress, _owner, _operator);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('isApprovedForAll').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.isApprovedForAll(blockHash, contractAddress, _owner, _operator);
      },

      totalSupply: (
        _: any,
        { blockHash, contractAddress }: { blockHash: string, contractAddress: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('totalSupply', blockHash, contractAddress);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('totalSupply').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.totalSupply(blockHash, contractAddress);
      },

      tokenOfOwnerByIndex: (
        _: any,
        { blockHash, contractAddress, _owner, _index }: { blockHash: string, contractAddress: string, _owner: string, _index: bigint },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('tokenOfOwnerByIndex', blockHash, contractAddress, _owner, _index);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('tokenOfOwnerByIndex').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.tokenOfOwnerByIndex(blockHash, contractAddress, _owner, _index);
      },

      tokenByIndex: (
        _: any,
        { blockHash, contractAddress, _index }: { blockHash: string, contractAddress: string, _index: bigint },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('tokenByIndex', blockHash, contractAddress, _index);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('tokenByIndex').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.tokenByIndex(blockHash, contractAddress, _index);
      },

      name: (
        _: any,
        { blockHash, contractAddress }: { blockHash: string, contractAddress: string },
        __: any,
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
        __: any,
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
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('tokenURI', blockHash, contractAddress, _tokenId);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('tokenURI').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.tokenURI(blockHash, contractAddress, _tokenId);
      },

      getSpawnLimit: (
        _: any,
        { blockHash, contractAddress, _point, _time }: { blockHash: string, contractAddress: string, _point: bigint, _time: bigint },
        __: any,
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
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('canEscapeTo', blockHash, contractAddress, _point, _sponsor);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('canEscapeTo').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.canEscapeTo(blockHash, contractAddress, _point, _sponsor);
      },

      withdrawLimit: (
        _: any,
        { blockHash, contractAddress, _participant, _batch }: { blockHash: string, contractAddress: string, _participant: string, _batch: number },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('withdrawLimit', blockHash, contractAddress, _participant, _batch);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('withdrawLimit').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.withdrawLimit(blockHash, contractAddress, _participant, _batch);
      },

      verifyBalance: (
        _: any,
        { blockHash, contractAddress, _participant }: { blockHash: string, contractAddress: string, _participant: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('verifyBalance', blockHash, contractAddress, _participant);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('verifyBalance').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.verifyBalance(blockHash, contractAddress, _participant);
      },

      getBatches: (
        _: any,
        { blockHash, contractAddress, _participant }: { blockHash: string, contractAddress: string, _participant: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getBatches', blockHash, contractAddress, _participant);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getBatches').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getBatches(blockHash, contractAddress, _participant);
      },

      getBatch: (
        _: any,
        { blockHash, contractAddress, _participant, _batch }: { blockHash: string, contractAddress: string, _participant: string, _batch: number },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getBatch', blockHash, contractAddress, _participant, _batch);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getBatch').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getBatch(blockHash, contractAddress, _participant, _batch);
      },

      getWithdrawn: (
        _: any,
        { blockHash, contractAddress, _participant }: { blockHash: string, contractAddress: string, _participant: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getWithdrawn', blockHash, contractAddress, _participant);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getWithdrawn').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getWithdrawn(blockHash, contractAddress, _participant);
      },

      getWithdrawnFromBatch: (
        _: any,
        { blockHash, contractAddress, _participant, _batch }: { blockHash: string, contractAddress: string, _participant: string, _batch: number },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getWithdrawnFromBatch', blockHash, contractAddress, _participant, _batch);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getWithdrawnFromBatch').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getWithdrawnFromBatch(blockHash, contractAddress, _participant, _batch);
      },

      getForfeited: (
        _: any,
        { blockHash, contractAddress, _participant }: { blockHash: string, contractAddress: string, _participant: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getForfeited', blockHash, contractAddress, _participant);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getForfeited').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getForfeited(blockHash, contractAddress, _participant);
      },

      hasForfeitedBatch: (
        _: any,
        { blockHash, contractAddress, _participant, _batch }: { blockHash: string, contractAddress: string, _participant: string, _batch: number },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('hasForfeitedBatch', blockHash, contractAddress, _participant, _batch);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('hasForfeitedBatch').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.hasForfeitedBatch(blockHash, contractAddress, _participant, _batch);
      },

      getRemainingStars: (
        _: any,
        { blockHash, contractAddress, _participant }: { blockHash: string, contractAddress: string, _participant: string },
        __: any,
        info: GraphQLResolveInfo
      ): Promise<ValueResult> => {
        log('getRemainingStars', blockHash, contractAddress, _participant);
        gqlTotalQueryCount.inc(1);
        gqlQueryCount.labels('getRemainingStars').inc(1);

        // Set cache-control hints
        // setGQLCacheHints(info, {}, gqlCacheConfig);

        return indexer.getRemainingStars(blockHash, contractAddress, _participant);
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
