# azimuth-watcher-ts

A comprehensive blockchain indexing and querying system for [Azimuth](https://docs.urbit.org/system/identity), Urbit's identity layer on Ethereum. This system monitors multiple Ethereum smart contracts that make up the Azimuth PKI and provides a unified GraphQL API for querying Urbit identity information.

## What is Azimuth?

Azimuth is Urbit's public key infrastructure (PKI) that lives on Ethereum. It's a set of smart contracts that manage Urbit identities called "points" (similar to usernames), their ownership, cryptographic keys, and hierarchical relationships. By storing identity data on Ethereum, the system is decentralized and censorship-resistant.

## What are Watchers?

Watchers are services that continuously monitor smart contracts on Ethereum, index their events and state changes, and provide efficient APIs for querying blockchain data. Instead of directly querying the Ethereum blockchain (which is slow and expensive), applications can query watchers for fast, indexed access to current and historical blockchain state.

## System Architecture

This system consists of **8 specialized watchers** that each monitor different Azimuth smart contracts:

- **azimuth-watcher** - Core identity operations (ownership, keys, sponsorship)
- **censures-watcher** - Reputation and censure system
- **claims-watcher** - On-chain claims and metadata
- **ecliptic-watcher** - Galaxy operations and governance
- **polls-watcher** - Voting and governance proposals
- **conditional-star-release-watcher** - Conditional star distribution
- **linear-star-release-watcher** - Linear star distribution
- **delegated-sending-watcher** - Delegated operations

Plus a **gateway server** that provides a unified GraphQL endpoint routing queries to the appropriate watcher.

## Hosted Service

A public instance is available at: **<https://azimuth.dev.vdb.to/graphql>**

You can also run the system locally using [Stack Orchestrator](https://git.vdb.to/cerc-io/stack-orchestrator/src/branch/main/app/data/stacks/azimuth).

## Common Use Cases

### Querying Urbit Point Information

The **azimuth-watcher** is the primary service for querying Urbit identity data. Here are the most common operations:

#### 1. Get Point Owner and Basic Info

```bash
# Check who owns a specific Urbit point
# Example:
curl 'https://azimuth.dev.vdb.to/graphql' \
  -H 'Content-Type: application/json' \
  --data-raw '{"query":"{ azimuthGetOwner(blockHash: \"latest\", contractAddress: \"0x223c067F8CF28ae173EE5CafEa60cA44C335fecB\", _point: 1234) { value } }"}' \
  | jq

# Response:
# {
#   "data": {
#     "azimuthGetOwner": {
#       "value": "0x4b22764F2Db640aB4d0Ecfd0F84344F3CB5C3715"
#     }
#   }
# }
```

#### 2. Get Cryptographic Keys for a Point

```bash
# Get encryption and authentication keys for networking
# Example:
curl 'https://azimuth.dev.vdb.to/graphql' \
  -H 'Content-Type: application/json' \
  --data-raw '{"query":"{ azimuthGetKeys(blockHash: \"latest\", contractAddress: \"0x223c067F8CF28ae173EE5CafEa60cA44C335fecB\", _point: 58213) { value { encryptionKey: value0 authenticationKey: value1 cryptoSuiteVersion: value2 keyRevisionNumber: value3 } } }"}' \
  | jq

# Response:
# {
#   "data": {
#     "azimuthGetKeys": {
#       "value": {
#         "encryptionKey": "0xc248f759474b16192bd8bdca0bff1b8bff555cd3d118022095331d6d98690c6d",
#         "authenticationKey": "0x21188bac08542730e1c4697636d6fa25968f404470ccf917756f05e28c69045a",
#         "cryptoSuiteVersion": "1",
#         "keyRevisionNumber": "1"
#       }
#     }
#   }
# }
```

#### 3. Check Point Status

```bash
# Check if a point is active (booted) and has a sponsor
# Example:
curl 'https://azimuth.dev.vdb.to/graphql' \
  -H 'Content-Type: application/json' \
  --data-raw '{"query":"{ azimuthIsActive(blockHash: \"latest\", contractAddress: \"0x223c067F8CF28ae173EE5CafEa60cA44C335fecB\", _point: 1234) { value } azimuthHasSponsor(blockHash: \"latest\", contractAddress: \"0x223c067F8CF28ae173EE5CafEa60cA44C335fecB\", _point: 1234) { value } azimuthGetSponsor(blockHash: \"latest\", contractAddress: \"0x223c067F8CF28ae173EE5CafEa60cA44C335fecB\", _point: 1234) { value } }"}' \
  | jq

# Response:
# {
#   "data": {
#     "azimuthIsActive": {
#       "value": true
#     },
#     "azimuthHasSponsor": {
#       "value": true
#     },
#     "azimuthGetSponsor": {
#       "value": "210"
#     }
#   }
# }
```

#### 4. Get All Points Owned by an Address

```bash
# Find all Urbit points owned by an Ethereum address
# Example:
curl 'https://azimuth.dev.vdb.to/graphql' \
  -H 'Content-Type: application/json' \
  --data-raw '{"query":"{ azimuthGetOwnedPoints(blockHash: \"latest\", contractAddress: \"0x223c067F8CF28ae173EE5CafEa60cA44C335fecB\", _whose: \"0x1234567890123456789012345678901234567890\") { value } }"}' \
  | jq

# Response:
# {
#   "data": {
#     "azimuthGetOwnedPoints": {
#       "value": [
#         "57965",
#         "1234"
#       ]
#     }
#   }
# }
```

#### 5. Multi-Watcher Queries

The gateway server allows querying multiple watchers in a single request:

```graphql
{
  # Check point status (azimuth-watcher)
  azimuthIsActive(
    blockHash: "0x2461e78f075e618173c524b5ab4309111001517bb50cfd1b3505aed5433cf5f9"
    contractAddress: "0x223c067F8CF28ae173EE5CafEa60cA44C335fecB"
    _point: 1
  ) {
    value
  }

  # Check censure count (censures-watcher)
  censuresGetCensuredByCount(
    blockHash: "0x2461e78f075e618173c524b5ab4309111001517bb50cfd1b3505aed5433cf5f9"
    contractAddress: "0x325f68d32BdEe6Ed86E7235ff2480e2A433D6189"
    _who: 6054
  ) {
    value
  } }

  # Find a claim (claims-watcher)
  claimsFindClaim(
    blockHash: "0x2461e78f075e618173c524b5ab4309111001517bb50cfd1b3505aed5433cf5f9"
    contractAddress: "0xe7e7f69b34D7d9Bd8d61Fb22C33b22708947971A"
    _whose: 1967913144
    _protocol: "text"
    _claim: "Shrek is NOT Drek!"
  ) {
    value
  }

  # Check star release balance (linear-star-release-watcher)
  linearStarReleaseVerifyBalance(
    blockHash: "0x2461e78f075e618173c524b5ab4309111001517bb50cfd1b3505aed5433cf5f9"
    contractAddress: "0x86cd9cd0992F04231751E3761De45cEceA5d1801"
    _participant: "0xbD396c580d868FBbE4a115DD667E756079880801"
  ) {
    value
  }

  # Check conditional star release (conditional-star-release-watcher)
  conditionalStarReleaseWithdrawLimit(
    blockHash: "0x2461e78f075e618173c524b5ab4309111001517bb50cfd1b3505aed5433cf5f9"
    contractAddress: "0x8C241098C3D3498Fe1261421633FD57986D74AeA"
    _participant: "0x7F0584938E649061e80e45cF88E6d8dDDb22f2aB"
    _batch: 2
  ) {
    value
  }

  # Check governance proposals (polls-watcher)
  pollsGetUpgradeProposalCount(
    blockHash: "0xeaf611fabbe604932d36b97c89955c091e9582e292b741ebf144962b9ff5c271"
    contractAddress: "0x7fEcaB617c868Bb5996d99D95200D2Fa708218e4"
  ) {
    value
  }

  # Check NFT balance (ecliptic-watcher)
  eclipticBalanceOf(
    blockHash: "0x5e82abbe6474caf7b5325022db1d1287ce352488b303685493289770484f54f4"
    contractAddress: "0x33EeCbf908478C10614626A9D304bfe18B78DD73"
    _owner: "0x4b5E239C1bbb98d44ea23BC9f8eC7584F54096E8"
  ) {
    value
  }

  # Check delegation permissions (delegated-sending-watcher)
  delegatedSendingCanSend(
    blockHash: "0x2461e78f075e618173c524b5ab4309111001517bb50cfd1b3505aed5433cf5f9"
    contractAddress: "0xf6b461fE1aD4bd2ce25B23Fe0aff2ac19B3dFA76"
    _as: 1
    _point: 1
  ) {
    value
  }
}
```

### Understanding Query Parameters

All queries require these standard parameters:

- **`blockHash`**: Use `"latest"` for current state, or a specific block hash for historical queries
- **`contractAddress`**: Azimuth contract address (`0x223c067F8CF28ae173EE5CafEa60cA44C335fecB`)
- **`_point`**: The Urbit point number you're querying
- **`_whose`**: Ethereum address when querying by owner

## How It Works

### Data Source

The watchers continuously monitor Ethereum smart contracts by connecting to Ethereum RPC endpoint(s), indexing blockchain events and state changes.

### Data Flow

1. **Indexing**: Job runners fetch Ethereum events and blocks from RPC endpoint(s)
2. **Processing**: Events are processed and state changes stored in PostgreSQL databases
3. **Querying**: GraphQL servers provide fast, indexed access to current and historical blockchain state
4. **Gateway**: Unified endpoint routes queries to appropriate specialized watchers

### Storage

Each watcher maintains its own PostgreSQL database for efficient querying and data isolation.
