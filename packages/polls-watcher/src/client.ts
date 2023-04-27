//
// Copyright 2021 Vulcanize, Inc.
//

import { gql } from '@apollo/client/core';
import { GraphQLClient, GraphQLConfig } from '@cerc-io/ipld-eth-client';

import { queries, mutations, subscriptions } from './gql';

export class Client {
  _config: GraphQLConfig;
  _client: GraphQLClient;

  constructor (config: GraphQLConfig) {
    this._config = config;

    this._client = new GraphQLClient(config);
  }

  async getGetUpgradeProposals (blockHash: string, contractAddress: string): Promise<any> {
    const { getUpgradeProposals } = await this._client.query(
      gql(queries.getUpgradeProposals),
      { blockHash, contractAddress }
    );

    return getUpgradeProposals;
  }

  async getGetUpgradeProposalCount (blockHash: string, contractAddress: string): Promise<any> {
    const { getUpgradeProposalCount } = await this._client.query(
      gql(queries.getUpgradeProposalCount),
      { blockHash, contractAddress }
    );

    return getUpgradeProposalCount;
  }

  async getGetDocumentProposals (blockHash: string, contractAddress: string): Promise<any> {
    const { getDocumentProposals } = await this._client.query(
      gql(queries.getDocumentProposals),
      { blockHash, contractAddress }
    );

    return getDocumentProposals;
  }

  async getGetDocumentProposalCount (blockHash: string, contractAddress: string): Promise<any> {
    const { getDocumentProposalCount } = await this._client.query(
      gql(queries.getDocumentProposalCount),
      { blockHash, contractAddress }
    );

    return getDocumentProposalCount;
  }

  async getGetDocumentMajorities (blockHash: string, contractAddress: string): Promise<any> {
    const { getDocumentMajorities } = await this._client.query(
      gql(queries.getDocumentMajorities),
      { blockHash, contractAddress }
    );

    return getDocumentMajorities;
  }

  async getHasVotedOnUpgradePoll (blockHash: string, contractAddress: string, _galaxy: number, _proposal: string): Promise<any> {
    const { hasVotedOnUpgradePoll } = await this._client.query(
      gql(queries.hasVotedOnUpgradePoll),
      { blockHash, contractAddress, _galaxy, _proposal }
    );

    return hasVotedOnUpgradePoll;
  }

  async getHasVotedOnDocumentPoll (blockHash: string, contractAddress: string, _galaxy: number, _proposal: string): Promise<any> {
    const { hasVotedOnDocumentPoll } = await this._client.query(
      gql(queries.hasVotedOnDocumentPoll),
      { blockHash, contractAddress, _galaxy, _proposal }
    );

    return hasVotedOnDocumentPoll;
  }

  async getEvents (blockHash: string, contractAddress: string, name: string): Promise<any> {
    const { events } = await this._client.query(
      gql(queries.events),
      { blockHash, contractAddress, name }
    );

    return events;
  }

  async getEventsInRange (fromBlockNumber: number, toBlockNumber: number): Promise<any> {
    const { eventsInRange } = await this._client.query(
      gql(queries.eventsInRange),
      { fromBlockNumber, toBlockNumber }
    );

    return eventsInRange;
  }

  async watchContract (contractAddress: string, startingBlock?: number): Promise<any> {
    const { watchContract } = await this._client.mutate(
      gql(mutations.watchContract),
      { contractAddress, startingBlock }
    );

    return watchContract;
  }

  async watchEvents (onNext: (value: any) => void): Promise<ZenObservable.Subscription> {
    return this._client.subscribe(
      gql(subscriptions.onEvent),
      ({ data }) => {
        onNext(data.onEvent);
      }
    );
  }
}
