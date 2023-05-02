//
// Copyright 2023 Vulcanize, Inc.
//

import { createServer } from 'http';
import debug from 'debug';

import { gatewayApp } from './gateway';

const log = debug('vulcanize:server');

const server = createServer(gatewayApp);
server.listen(4000, () => log('gateway running at http://localhost:4000/graphql'));
