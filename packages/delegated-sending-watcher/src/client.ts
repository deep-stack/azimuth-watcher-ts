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

  async getCanSend (blockHash: string, contractAddress: string, _as: bigint, _point: bigint): Promise<any> {
    const { canSend } = await this._client.query(
      gql(queries.canSend),
      { blockHash, contractAddress, _as, _point }
    );

    return canSend;
  }

  async getGetPool (blockHash: string, contractAddress: string, _point: bigint): Promise<any> {
    const { getPool } = await this._client.query(
      gql(queries.getPool),
      { blockHash, contractAddress, _point }
    );

    return getPool;
  }

  async getCanReceive (blockHash: string, contractAddress: string, _recipient: string): Promise<any> {
    const { canReceive } = await this._client.query(
      gql(queries.canReceive),
      { blockHash, contractAddress, _recipient }
    );

    return canReceive;
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
