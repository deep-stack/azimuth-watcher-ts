# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Azimuth?

Azimuth is Urbit's public key infrastructure (PKI) that lives on Ethereum. It's a set of smart contracts that manage Urbit identities called "points" (similar to usernames), their ownership, cryptographic keys, and hierarchical relationships. By storing identity data on Ethereum, the system is decentralized and censorship-resistant.

## Project Overview

This is a monorepo containing blockchain watchers for the Azimuth PKI system used in Urbit identities. It watches multiple Ethereum contracts (Azimuth, Censures, Claims, ConditionalStarRelease, DelegatedSending, Ecliptic, LinearStarRelease, Polls) and provides GraphQL APIs for querying their state.

**Watchers** are services that continuously monitor smart contracts on Ethereum, index their events and state changes, and provide efficient APIs for querying blockchain data. Instead of directly querying the Ethereum blockchain (which is slow and expensive), applications can query watchers for fast, indexed access to current and historical blockchain state.

## Hosted Service

A public instance is available at: **https://azimuth.dev.vdb.to/graphql**

You can also run the system locally using [Stack Orchestrator](https://git.vdb.to/cerc-io/stack-orchestrator/src/branch/main/app/data/stacks/azimuth).

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
The gateway server runs on port 4000 by default.
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
- **Port**: Runs on port 4000 by default (http://localhost:4000/graphql)
- **Schema stitching**: Combines all watcher schemas with prefixed field names
- **Health checking**: Monitors watcher availability before routing
- **Configuration**: `packages/gateway-server/src/watchers.json` defines watcher endpoints and prefixes
- **GraphQL proxy**: Routes queries like `azimuthGetKeys` to azimuth-watcher at localhost:3001
- **Query prefixing**: Each watcher's queries are prefixed (e.g., `azimuthGetKeys`, `censuresGetCensuredByCount`, `claimsFindClaim`)

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

## Docker & Deployment

### Building Docker Images
The project includes a Dockerfile for building production-ready container images:

```bash
# Build the watcher-azimuth image
docker build -t cerc/watcher-azimuth -f Dockerfile .
```

The Dockerfile:
- Uses Node.js 18.16.0 on Alpine Linux 3.16
- Installs build dependencies (git, python3, alpine-sdk, jq)
- Embeds the Git commit hash in all package.json files
- Builds only azimuth-watcher and gateway-server packages
- Includes toml-js for runtime configuration updates
- Results in a ~1.1GB production image

### CI/CD Pipeline
The project uses GitHub Actions for automated Docker image publishing:

- **Trigger**: On release publication (tags)
- **Workflow**: `.gitea/workflows/docker-image.yml`
- **Outputs**:
  - Image tagged with git SHA (e.g., `git.vdb.to/laconicnetwork/cerc/watcher-azimuth:abc1234`)
  - Image tagged with release version (e.g., `git.vdb.to/laconicnetwork/cerc/watcher-azimuth:v0.1.10`)
- **Registry**: git.vdb.to

To trigger a release build:
1. Create and push a new git tag
2. Publish the release on GitHub
3. CI will automatically build and push Docker images

## Git Hooks

The project uses [Husky](https://typicode.github.io/husky/) for Git hooks:

- **Pre-commit hook**: Automatically runs `yarn lint` before every commit
- **Configuration**: `.husky/pre-commit`
- **Setup**: Run `yarn install` or `yarn prepare` to install hooks
- **Bypass**: Use `git commit --no-verify` to skip hooks (not recommended)

This ensures code quality by enforcing linting rules before code is committed.

## Key Technologies

- **Language**: TypeScript 5.0+
- **Database**: PostgreSQL with TypeORM 0.2.37
- **Blockchain**: ethers.js 5.4+ for Ethereum interaction
- **GraphQL**: graphql 15.5+ with custom resolvers
- **API Framework**: @cerc-io packages for watcher infrastructure
- **Monorepo**: Lerna 6.6+ with Yarn workspaces
- **Base Image**: Node.js 18.16.0 on Alpine Linux (Docker)