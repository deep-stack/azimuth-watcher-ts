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

  async getSupportsInterface (blockHash: string, contractAddress: string, _interfaceId: string): Promise<any> {
    const { supportsInterface } = await this._client.query(
      gql(queries.supportsInterface),
      { blockHash, contractAddress, _interfaceId }
    );

    return supportsInterface;
  }

  async getName (blockHash: string, contractAddress: string): Promise<any> {
    const { name } = await this._client.query(
      gql(queries.name),
      { blockHash, contractAddress }
    );

    return name;
  }

  async getSymbol (blockHash: string, contractAddress: string): Promise<any> {
    const { symbol } = await this._client.query(
      gql(queries.symbol),
      { blockHash, contractAddress }
    );

    return symbol;
  }

  async getTokenURI (blockHash: string, contractAddress: string, _tokenId: bigint): Promise<any> {
    const { tokenURI } = await this._client.query(
      gql(queries.tokenURI),
      { blockHash, contractAddress, _tokenId }
    );

    return tokenURI;
  }

  async getBalanceOf (blockHash: string, contractAddress: string, _owner: string): Promise<any> {
    const { balanceOf } = await this._client.query(
      gql(queries.balanceOf),
      { blockHash, contractAddress, _owner }
    );

    return balanceOf;
  }

  async getOwnerOf (blockHash: string, contractAddress: string, _tokenId: bigint): Promise<any> {
    const { ownerOf } = await this._client.query(
      gql(queries.ownerOf),
      { blockHash, contractAddress, _tokenId }
    );

    return ownerOf;
  }

  async getExists (blockHash: string, contractAddress: string, _tokenId: bigint): Promise<any> {
    const { exists } = await this._client.query(
      gql(queries.exists),
      { blockHash, contractAddress, _tokenId }
    );

    return exists;
  }

  async getGetApproved (blockHash: string, contractAddress: string, _tokenId: bigint): Promise<any> {
    const { getApproved } = await this._client.query(
      gql(queries.getApproved),
      { blockHash, contractAddress, _tokenId }
    );

    return getApproved;
  }

  async getIsApprovedForAll (blockHash: string, contractAddress: string, _owner: string, _operator: string): Promise<any> {
    const { isApprovedForAll } = await this._client.query(
      gql(queries.isApprovedForAll),
      { blockHash, contractAddress, _owner, _operator }
    );

    return isApprovedForAll;
  }

  async getGetSpawnLimit (blockHash: string, contractAddress: string, _point: bigint, _time: bigint): Promise<any> {
    const { getSpawnLimit } = await this._client.query(
      gql(queries.getSpawnLimit),
      { blockHash, contractAddress, _point, _time }
    );

    return getSpawnLimit;
  }

  async getCanEscapeTo (blockHash: string, contractAddress: string, _point: bigint, _sponsor: bigint): Promise<any> {
    const { canEscapeTo } = await this._client.query(
      gql(queries.canEscapeTo),
      { blockHash, contractAddress, _point, _sponsor }
    );

    return canEscapeTo;
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
