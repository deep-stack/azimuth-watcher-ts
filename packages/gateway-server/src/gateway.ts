//
// Copyright 2023 Vulcanize, Inc.
//

import { createYoga } from 'graphql-yoga';
import isReachable from 'is-reachable';
import assert from 'assert';
import { URL } from 'url';

import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { stitchSchemas } from '@graphql-tools/stitch';
import { RenameRootFields, schemaFromExecutor } from '@graphql-tools/wrap';

import watchers from './watchers.json';

async function makeGatewaySchema () {
  // Check that watcher endpoints are reachable.
  for (const watcher of watchers) {
    const url = new URL(watcher.endpoint);

    assert(
      await isReachable(`${url.hostname}:${url.port}`),
      `Watcher endpoint ${watcher.endpoint} is not reachable.`
    );
  }

  const subSchemaPromises = watchers.map(async watcher => {
    // Make remote executor:
    // Simple function that queries a remote GraphQL API for JSON.
    const remoteExecutor = buildHTTPExecutor({
      endpoint: watcher.endpoint
    });

    return {
      // Introspect remote schema.
      schema: await schemaFromExecutor(remoteExecutor),
      executor: remoteExecutor,
      transforms: [
        // Add prefix to queries, mutations and subscriptions
        new RenameRootFields(
          (op, name) => `${watcher.prefix}${name.charAt(0).toUpperCase()}${name.slice(1)}`
        )
      ]
    };
  });

  return stitchSchemas({
    subschemas: await Promise.all(subSchemaPromises)
  });
}

export const gatewayApp = createYoga({
  schema: makeGatewaySchema(),
  maskedErrors: false,
  graphqlEndpoint: '/',
  graphiql: {
    title: 'Azimuth Watchers',
    defaultQuery: `#
# Welcome to the Azimuth Watcher for the Urbit PKI on Ethereum
#
# Below are example queries that run out of the box
#
# See the following document for background, rational, and relevant links:
#
# https://github.com/LaconicNetwork/awesome-urbit/blob/main/docs/azimuth-watcher.md
#

{
  azimuthIsActive(
    blockHash: "0x2461e78f075e618173c524b5ab4309111001517bb50cfd1b3505aed5433cf5f9"
    contractAddress: "0x223c067F8CF28ae173EE5CafEa60cA44C335fecB"
    _point: 1
  ) {
    value
  }
  censuresGetCensuredByCount(
    blockHash: "0x2461e78f075e618173c524b5ab4309111001517bb50cfd1b3505aed5433cf5f9"
    contractAddress: "0x325f68d32BdEe6Ed86E7235ff2480e2A433D6189"
    _who: 6054
  ) {
    value
  }
  claimsFindClaim(
    blockHash: "0x2461e78f075e618173c524b5ab4309111001517bb50cfd1b3505aed5433cf5f9"
    contractAddress: "0xe7e7f69b34D7d9Bd8d61Fb22C33b22708947971A"
    _whose: 1967913144
    _protocol: "text"
    _claim: "Shrek is NOT Drek!"
  ) {
    value
  }
  linearStarReleaseVerifyBalance(
    blockHash: "0x2461e78f075e618173c524b5ab4309111001517bb50cfd1b3505aed5433cf5f9"
    contractAddress: "0x86cd9cd0992F04231751E3761De45cEceA5d1801"
    _participant: "0xbD396c580d868FBbE4a115DD667E756079880801"
  ) {
    value
  }
  conditionalStarReleaseWithdrawLimit(
    blockHash: "0x2461e78f075e618173c524b5ab4309111001517bb50cfd1b3505aed5433cf5f9"
    contractAddress: "0x8C241098C3D3498Fe1261421633FD57986D74AeA"
    _participant: "0x7F0584938E649061e80e45cF88E6d8dDDb22f2aB"
    _batch: 2
  ) {
    value
  }
  pollsGetUpgradeProposalCount(
    blockHash: "0xeaf611fabbe604932d36b97c89955c091e9582e292b741ebf144962b9ff5c271"
    contractAddress: "0x7fEcaB617c868Bb5996d99D95200D2Fa708218e4"
  ) {
    value
  }
  eclipticBalanceOf(
    blockHash: "0x5e82abbe6474caf7b5325022db1d1287ce352488b303685493289770484f54f4"
    contractAddress: "0x33EeCbf908478C10614626A9D304bfe18B78DD73"
    _owner: "0x4b5E239C1bbb98d44ea23BC9f8eC7584F54096E8"
  ) {
    value
  }
  delegatedSendingCanSend(
    blockHash: "0x2461e78f075e618173c524b5ab4309111001517bb50cfd1b3505aed5433cf5f9"
    contractAddress: "0xf6b461fE1aD4bd2ce25B23Fe0aff2ac19B3dFA76"
    _as: 1
    _point: 1
  ) {
    value
  }
}
`
  }
});
