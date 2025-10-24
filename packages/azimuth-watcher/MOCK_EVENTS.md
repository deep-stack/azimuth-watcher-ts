# Mock Sponsorship Events

This document describes how to inject mock sponsorship change events into the azimuth-watcher for testing purposes.

## Overview

The azimuth-watcher supports injecting mock events for sponsorship changes (EscapeRequested, EscapeAccepted, EscapeCanceled, LostSponsor) via a GraphQL mutation.

## Usage

### Inject Mock Events

Open the GraphQL playground and run the `injectMockEvents` mutation:

```graphql
mutation {
  injectMockEvents(
    events: [
      {
        type: ESCAPE_REQUESTED
        point: 256
        sponsor: 1
        blockNumber: 1000
      }
      {
        type: ESCAPE_ACCEPTED
        point: 256
        sponsor: 1
        blockNumber: 1001
      }
    ]
  ) {
    success
    eventsInjected
  }
}
```

## Event Types

The following event types are supported:

### Sponsorship Events
- `ESCAPE_REQUESTED` - Star requests to change sponsor
- `ESCAPE_ACCEPTED` - New galaxy accepts the star
- `ESCAPE_CANCELED` - Escape request is canceled (by star or rejected by galaxy)
- `LOST_SPONSOR` - Current galaxy stops sponsoring the star

### Ownership Events
- `OWNER_CHANGED` - Ownership of a point changes

## Example Scenarios

### Successful Sponsor Change

```graphql
mutation {
  injectMockEvents(
    events: [
      { type: ESCAPE_REQUESTED, point: 256, sponsor: 1, blockNumber: 1000 }
      { type: ESCAPE_ACCEPTED, point: 256, sponsor: 1, blockNumber: 1001 }
    ]
  ) {
    success
    eventsInjected
  }
}
```

### Galaxy Detaches Star

```graphql
mutation {
  injectMockEvents(
    events: [
      { type: LOST_SPONSOR, point: 512, sponsor: 0, blockNumber: 2000 }
    ]
  ) {
    success
    eventsInjected
  }
}
```

### Canceled Escape

```graphql
mutation {
  injectMockEvents(
    events: [
      { type: ESCAPE_REQUESTED, point: 768, sponsor: 2, blockNumber: 3000 }
      { type: ESCAPE_CANCELED, point: 768, sponsor: 2, blockNumber: 3001 }
    ]
  ) {
    success
    eventsInjected
  }
}
```

### Ownership Change

```graphql
mutation {
  injectMockEvents(
    events: [
      { type: OWNER_CHANGED, point: 256, owner: "0x1234567890123456789012345678901234567890", blockNumber: 4000 }
    ]
  ) {
    success
    eventsInjected
  }
}
```

## Testing from zenithd

1. Set the azimuth-watcher endpoint:
   ```bash
   export AZIMUTH_WATCHER_ENDPOINT=http://localhost:3001/graphql
   ```

2. Inject mock events via GraphQL playground (step 2 above)

3. Run zenithd tests - it will receive the mock events through normal GraphQL queries

## Files Modified

- `src/mock-event-store.ts` - In-memory event storage
- `src/schema.gql` - Added mutation and types
- `src/resolvers.ts` - Added mutation resolver and modified `eventsInRange` query
