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

  async getIsActive (blockHash: string, contractAddress: string, _point: bigint): Promise<any> {
    const { isActive } = await this._client.query(
      gql(queries.isActive),
      { blockHash, contractAddress, _point }
    );

    return isActive;
  }

  async getGetKeyRevisionNumber (blockHash: string, contractAddress: string, _point: bigint): Promise<any> {
    const { getKeyRevisionNumber } = await this._client.query(
      gql(queries.getKeyRevisionNumber),
      { blockHash, contractAddress, _point }
    );

    return getKeyRevisionNumber;
  }

  async getHasBeenLinked (blockHash: string, contractAddress: string, _point: bigint): Promise<any> {
    const { hasBeenLinked } = await this._client.query(
      gql(queries.hasBeenLinked),
      { blockHash, contractAddress, _point }
    );

    return hasBeenLinked;
  }

  async getIsLive (blockHash: string, contractAddress: string, _point: bigint): Promise<any> {
    const { isLive } = await this._client.query(
      gql(queries.isLive),
      { blockHash, contractAddress, _point }
    );

    return isLive;
  }

  async getGetContinuityNumber (blockHash: string, contractAddress: string, _point: bigint): Promise<any> {
    const { getContinuityNumber } = await this._client.query(
      gql(queries.getContinuityNumber),
      { blockHash, contractAddress, _point }
    );

    return getContinuityNumber;
  }

  async getGetSpawnCount (blockHash: string, contractAddress: string, _point: bigint): Promise<any> {
    const { getSpawnCount } = await this._client.query(
      gql(queries.getSpawnCount),
      { blockHash, contractAddress, _point }
    );

    return getSpawnCount;
  }

  async getHasSponsor (blockHash: string, contractAddress: string, _point: bigint): Promise<any> {
    const { hasSponsor } = await this._client.query(
      gql(queries.hasSponsor),
      { blockHash, contractAddress, _point }
    );

    return hasSponsor;
  }

  async getGetSponsor (blockHash: string, contractAddress: string, _point: bigint): Promise<any> {
    const { getSponsor } = await this._client.query(
      gql(queries.getSponsor),
      { blockHash, contractAddress, _point }
    );

    return getSponsor;
  }

  async getIsSponsor (blockHash: string, contractAddress: string, _point: bigint, _sponsor: bigint): Promise<any> {
    const { isSponsor } = await this._client.query(
      gql(queries.isSponsor),
      { blockHash, contractAddress, _point, _sponsor }
    );

    return isSponsor;
  }

  async getGetSponsoringCount (blockHash: string, contractAddress: string, _sponsor: bigint): Promise<any> {
    const { getSponsoringCount } = await this._client.query(
      gql(queries.getSponsoringCount),
      { blockHash, contractAddress, _sponsor }
    );

    return getSponsoringCount;
  }

  async getIsEscaping (blockHash: string, contractAddress: string, _point: bigint): Promise<any> {
    const { isEscaping } = await this._client.query(
      gql(queries.isEscaping),
      { blockHash, contractAddress, _point }
    );

    return isEscaping;
  }

  async getGetEscapeRequest (blockHash: string, contractAddress: string, _point: bigint): Promise<any> {
    const { getEscapeRequest } = await this._client.query(
      gql(queries.getEscapeRequest),
      { blockHash, contractAddress, _point }
    );

    return getEscapeRequest;
  }

  async getIsRequestingEscapeTo (blockHash: string, contractAddress: string, _point: bigint, _sponsor: bigint): Promise<any> {
    const { isRequestingEscapeTo } = await this._client.query(
      gql(queries.isRequestingEscapeTo),
      { blockHash, contractAddress, _point, _sponsor }
    );

    return isRequestingEscapeTo;
  }

  async getGetEscapeRequestsCount (blockHash: string, contractAddress: string, _sponsor: bigint): Promise<any> {
    const { getEscapeRequestsCount } = await this._client.query(
      gql(queries.getEscapeRequestsCount),
      { blockHash, contractAddress, _sponsor }
    );

    return getEscapeRequestsCount;
  }

  async getGetOwner (blockHash: string, contractAddress: string, _point: bigint): Promise<any> {
    const { getOwner } = await this._client.query(
      gql(queries.getOwner),
      { blockHash, contractAddress, _point }
    );

    return getOwner;
  }

  async getIsOwner (blockHash: string, contractAddress: string, _point: bigint, _address: string): Promise<any> {
    const { isOwner } = await this._client.query(
      gql(queries.isOwner),
      { blockHash, contractAddress, _point, _address }
    );

    return isOwner;
  }

  async getGetOwnedPointCount (blockHash: string, contractAddress: string, _whose: string): Promise<any> {
    const { getOwnedPointCount } = await this._client.query(
      gql(queries.getOwnedPointCount),
      { blockHash, contractAddress, _whose }
    );

    return getOwnedPointCount;
  }

  async getGetOwnedPointAtIndex (blockHash: string, contractAddress: string, _whose: string, _index: bigint): Promise<any> {
    const { getOwnedPointAtIndex } = await this._client.query(
      gql(queries.getOwnedPointAtIndex),
      { blockHash, contractAddress, _whose, _index }
    );

    return getOwnedPointAtIndex;
  }

  async getGetManagementProxy (blockHash: string, contractAddress: string, _point: bigint): Promise<any> {
    const { getManagementProxy } = await this._client.query(
      gql(queries.getManagementProxy),
      { blockHash, contractAddress, _point }
    );

    return getManagementProxy;
  }

  async getIsManagementProxy (blockHash: string, contractAddress: string, _point: bigint, _proxy: string): Promise<any> {
    const { isManagementProxy } = await this._client.query(
      gql(queries.isManagementProxy),
      { blockHash, contractAddress, _point, _proxy }
    );

    return isManagementProxy;
  }

  async getCanManage (blockHash: string, contractAddress: string, _point: bigint, _who: string): Promise<any> {
    const { canManage } = await this._client.query(
      gql(queries.canManage),
      { blockHash, contractAddress, _point, _who }
    );

    return canManage;
  }

  async getGetManagerForCount (blockHash: string, contractAddress: string, _proxy: string): Promise<any> {
    const { getManagerForCount } = await this._client.query(
      gql(queries.getManagerForCount),
      { blockHash, contractAddress, _proxy }
    );

    return getManagerForCount;
  }

  async getGetSpawnProxy (blockHash: string, contractAddress: string, _point: bigint): Promise<any> {
    const { getSpawnProxy } = await this._client.query(
      gql(queries.getSpawnProxy),
      { blockHash, contractAddress, _point }
    );

    return getSpawnProxy;
  }

  async getIsSpawnProxy (blockHash: string, contractAddress: string, _point: bigint, _proxy: string): Promise<any> {
    const { isSpawnProxy } = await this._client.query(
      gql(queries.isSpawnProxy),
      { blockHash, contractAddress, _point, _proxy }
    );

    return isSpawnProxy;
  }

  async getCanSpawnAs (blockHash: string, contractAddress: string, _point: bigint, _who: string): Promise<any> {
    const { canSpawnAs } = await this._client.query(
      gql(queries.canSpawnAs),
      { blockHash, contractAddress, _point, _who }
    );

    return canSpawnAs;
  }

  async getGetSpawningForCount (blockHash: string, contractAddress: string, _proxy: string): Promise<any> {
    const { getSpawningForCount } = await this._client.query(
      gql(queries.getSpawningForCount),
      { blockHash, contractAddress, _proxy }
    );

    return getSpawningForCount;
  }

  async getGetVotingProxy (blockHash: string, contractAddress: string, _point: bigint): Promise<any> {
    const { getVotingProxy } = await this._client.query(
      gql(queries.getVotingProxy),
      { blockHash, contractAddress, _point }
    );

    return getVotingProxy;
  }

  async getIsVotingProxy (blockHash: string, contractAddress: string, _point: bigint, _proxy: string): Promise<any> {
    const { isVotingProxy } = await this._client.query(
      gql(queries.isVotingProxy),
      { blockHash, contractAddress, _point, _proxy }
    );

    return isVotingProxy;
  }

  async getCanVoteAs (blockHash: string, contractAddress: string, _point: bigint, _who: string): Promise<any> {
    const { canVoteAs } = await this._client.query(
      gql(queries.canVoteAs),
      { blockHash, contractAddress, _point, _who }
    );

    return canVoteAs;
  }

  async getGetVotingForCount (blockHash: string, contractAddress: string, _proxy: string): Promise<any> {
    const { getVotingForCount } = await this._client.query(
      gql(queries.getVotingForCount),
      { blockHash, contractAddress, _proxy }
    );

    return getVotingForCount;
  }

  async getGetTransferProxy (blockHash: string, contractAddress: string, _point: bigint): Promise<any> {
    const { getTransferProxy } = await this._client.query(
      gql(queries.getTransferProxy),
      { blockHash, contractAddress, _point }
    );

    return getTransferProxy;
  }

  async getIsTransferProxy (blockHash: string, contractAddress: string, _point: bigint, _proxy: string): Promise<any> {
    const { isTransferProxy } = await this._client.query(
      gql(queries.isTransferProxy),
      { blockHash, contractAddress, _point, _proxy }
    );

    return isTransferProxy;
  }

  async getCanTransfer (blockHash: string, contractAddress: string, _point: bigint, _who: string): Promise<any> {
    const { canTransfer } = await this._client.query(
      gql(queries.canTransfer),
      { blockHash, contractAddress, _point, _who }
    );

    return canTransfer;
  }

  async getGetTransferringForCount (blockHash: string, contractAddress: string, _proxy: string): Promise<any> {
    const { getTransferringForCount } = await this._client.query(
      gql(queries.getTransferringForCount),
      { blockHash, contractAddress, _proxy }
    );

    return getTransferringForCount;
  }

  async getIsOperator (blockHash: string, contractAddress: string, _owner: string, _operator: string): Promise<any> {
    const { isOperator } = await this._client.query(
      gql(queries.isOperator),
      { blockHash, contractAddress, _owner, _operator }
    );

    return isOperator;
  }

  async getGetUpgradeProposalCount (blockHash: string, contractAddress: string): Promise<any> {
    const { getUpgradeProposalCount } = await this._client.query(
      gql(queries.getUpgradeProposalCount),
      { blockHash, contractAddress }
    );

    return getUpgradeProposalCount;
  }

  async getGetDocumentProposalCount (blockHash: string, contractAddress: string): Promise<any> {
    const { getDocumentProposalCount } = await this._client.query(
      gql(queries.getDocumentProposalCount),
      { blockHash, contractAddress }
    );

    return getDocumentProposalCount;
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

  async getFindClaim (blockHash: string, contractAddress: string, _whose: bigint, _protocol: string, _claim: string): Promise<any> {
    const { findClaim } = await this._client.query(
      gql(queries.findClaim),
      { blockHash, contractAddress, _whose, _protocol, _claim }
    );

    return findClaim;
  }

  async getSupportsInterface (blockHash: string, contractAddress: string, _interfaceId: string): Promise<any> {
    const { supportsInterface } = await this._client.query(
      gql(queries.supportsInterface),
      { blockHash, contractAddress, _interfaceId }
    );

    return supportsInterface;
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

  async getTotalSupply (blockHash: string, contractAddress: string): Promise<any> {
    const { totalSupply } = await this._client.query(
      gql(queries.totalSupply),
      { blockHash, contractAddress }
    );

    return totalSupply;
  }

  async getTokenOfOwnerByIndex (blockHash: string, contractAddress: string, _owner: string, _index: bigint): Promise<any> {
    const { tokenOfOwnerByIndex } = await this._client.query(
      gql(queries.tokenOfOwnerByIndex),
      { blockHash, contractAddress, _owner, _index }
    );

    return tokenOfOwnerByIndex;
  }

  async getTokenByIndex (blockHash: string, contractAddress: string, _index: bigint): Promise<any> {
    const { tokenByIndex } = await this._client.query(
      gql(queries.tokenByIndex),
      { blockHash, contractAddress, _index }
    );

    return tokenByIndex;
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
