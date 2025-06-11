# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo containing blockchain watchers for the Azimuth PKI system used in Urbit identities. It watches multiple Ethereum contracts (Azimuth, Censures, Claims, ConditionalStarRelease, DelegatedSending, Ecliptic, LinearStarRelease, Polls) and provides GraphQL APIs for querying their state.

## Common Commands

### Building and Development
```bash
# Build all packages
yarn build
# or
lerna run build --stream

# Lint all packages (max warnings = 0)
yarn lint
# or
lerna run lint --stream -- --max-warnings=0

# Set versions across packages
yarn version:set
# or
lerna version --no-git-tag-version
```

### Individual Watcher Commands
Each watcher package supports these commands:
```bash
# Development server (with hot reload)
yarn server:dev

# Production server
yarn server

# Job runner (processes blockchain events)
yarn job-runner:dev  # development
yarn job-runner      # production

# Watch contract for events
yarn watch:contract

# Fill historical data
yarn fill

# Reset operations
yarn reset

# State management
yarn checkpoint:dev
yarn export-state:dev
yarn import-state:dev

# Utilities
yarn inspect-cid
yarn index-block
```

### Gateway Server
```bash
# Development gateway server (proxies to all watchers)
yarn server:dev

# Production gateway server
yarn server
```

## Architecture

### Monorepo Structure
- **Lerna-managed** yarn workspaces with 8 watcher packages + 1 gateway server
- Each watcher is a standalone service with its own database and GraphQL endpoint
- **Gateway server** acts as a unified GraphQL proxy that routes queries to appropriate watchers

### Watcher Packages
Each watcher follows identical structure:
- **Port allocation**: azimuth(3001), censures(3002), claims(3003), conditionalStarRelease(3004), delegatedSending(3005), ecliptic(3006), linearStarRelease(3007), polls(3008)
- **Database**: Individual PostgreSQL database per watcher
- **Configuration**: TOML files in `environments/` directory
- **Generated code**: Built from contract ABIs using `@cerc-io/codegen`

### Key Components Per Watcher
- `src/server.ts` - GraphQL server
- `src/job-runner.ts` - Event processing worker
- `src/indexer.ts` - Blockchain event indexing logic
- `src/resolvers.ts` - GraphQL resolvers
- `src/entity/` - TypeORM entities for all contract methods
- `src/gql/queries/` - GraphQL query definitions
- `src/cli/` - Command-line utilities for management

### Gateway Server Architecture
- **Schema stitching**: Combines all watcher schemas with prefixed field names
- **Health checking**: Monitors watcher availability before routing
- **Configuration**: `src/watchers.json` defines watcher endpoints and prefixes
- **GraphQL proxy**: Routes queries like `azimuthGetKeys` to azimuth-watcher at localhost:3001

### Data Flow
1. **Event Processing**: job-runner fetches Ethereum events → processes through indexer → stores in database
2. **Query Processing**: GraphQL queries → gateway server → appropriate watcher → database → response
3. **State Management**: Supports checkpointing, state export/import for data recovery

## Configuration Notes

### Environment Setup
- Each watcher requires PostgreSQL database (configurable in `environments/local.toml`)
- Requires Ethereum RPC endpoint (ipld-eth-server or standard RPC)
- Gateway server expects all watchers running on their designated ports

### Development Workflow
- Start individual watchers with `yarn server:dev` and `yarn job-runner:dev`
- Start gateway server for unified GraphQL endpoint
- Use `yarn fill` to sync historical blockchain data
- Monitor with debug logs using `DEBUG=vulcanize:*`

### Generated Watcher Creation
Watchers are generated using `@cerc-io/codegen` from contract ABIs. The process involves creating config.yaml files specifying contract paths, output folders, and generation modes (eth_call/storage/all).