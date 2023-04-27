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

  async getWithdrawLimit (blockHash: string, contractAddress: string, _participant: string, _batch: number): Promise<any> {
    const { withdrawLimit } = await this._client.query(
      gql(queries.withdrawLimit),
      { blockHash, contractAddress, _participant, _batch }
    );

    return withdrawLimit;
  }

  async getVerifyBalance (blockHash: string, contractAddress: string, _participant: string): Promise<any> {
    const { verifyBalance } = await this._client.query(
      gql(queries.verifyBalance),
      { blockHash, contractAddress, _participant }
    );

    return verifyBalance;
  }

  async getGetBatches (blockHash: string, contractAddress: string, _participant: string): Promise<any> {
    const { getBatches } = await this._client.query(
      gql(queries.getBatches),
      { blockHash, contractAddress, _participant }
    );

    return getBatches;
  }

  async getGetBatch (blockHash: string, contractAddress: string, _participant: string, _batch: number): Promise<any> {
    const { getBatch } = await this._client.query(
      gql(queries.getBatch),
      { blockHash, contractAddress, _participant, _batch }
    );

    return getBatch;
  }

  async getGetWithdrawn (blockHash: string, contractAddress: string, _participant: string): Promise<any> {
    const { getWithdrawn } = await this._client.query(
      gql(queries.getWithdrawn),
      { blockHash, contractAddress, _participant }
    );

    return getWithdrawn;
  }

  async getGetWithdrawnFromBatch (blockHash: string, contractAddress: string, _participant: string, _batch: number): Promise<any> {
    const { getWithdrawnFromBatch } = await this._client.query(
      gql(queries.getWithdrawnFromBatch),
      { blockHash, contractAddress, _participant, _batch }
    );

    return getWithdrawnFromBatch;
  }

  async getGetForfeited (blockHash: string, contractAddress: string, _participant: string): Promise<any> {
    const { getForfeited } = await this._client.query(
      gql(queries.getForfeited),
      { blockHash, contractAddress, _participant }
    );

    return getForfeited;
  }

  async getHasForfeitedBatch (blockHash: string, contractAddress: string, _participant: string, _batch: number): Promise<any> {
    const { hasForfeitedBatch } = await this._client.query(
      gql(queries.hasForfeitedBatch),
      { blockHash, contractAddress, _participant, _batch }
    );

    return hasForfeitedBatch;
  }

  async getGetRemainingStars (blockHash: string, contractAddress: string, _participant: string): Promise<any> {
    const { getRemainingStars } = await this._client.query(
      gql(queries.getRemainingStars),
      { blockHash, contractAddress, _participant }
    );

    return getRemainingStars;
  }

  async getGetConditionsState (blockHash: string, contractAddress: string): Promise<any> {
    const { getConditionsState } = await this._client.query(
      gql(queries.getConditionsState),
      { blockHash, contractAddress }
    );

    return getConditionsState;
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
