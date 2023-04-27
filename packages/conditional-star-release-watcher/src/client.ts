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

  async getGetBatch (blockHash: string, contractAddress: string, _participant: string, _batch: number): Promise<any> {
    const { getBatch } = await this._client.query(
      gql(queries.getBatch),
      { blockHash, contractAddress, _participant, _batch }
    );

    return getBatch;
  }

  async getGetWithdrawnFromBatch (blockHash: string, contractAddress: string, _participant: string, _batch: number): Promise<any> {
    const { getWithdrawnFromBatch } = await this._client.query(
      gql(queries.getWithdrawnFromBatch),
      { blockHash, contractAddress, _participant, _batch }
    );

    return getWithdrawnFromBatch;
  }

  async getHasForfeitedBatch (blockHash: string, contractAddress: string, _participant: string, _batch: number): Promise<any> {
    const { hasForfeitedBatch } = await this._client.query(
      gql(queries.hasForfeitedBatch),
      { blockHash, contractAddress, _participant, _batch }
    );

    return hasForfeitedBatch;
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
