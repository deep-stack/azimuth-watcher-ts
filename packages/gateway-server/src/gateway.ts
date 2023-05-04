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
  graphiql: {
    title: 'Azimuth Watchers'
  }
});
