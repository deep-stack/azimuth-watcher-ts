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
