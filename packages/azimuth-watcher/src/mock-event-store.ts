//
// Copyright 2025 DeepStack
//

import { ResultEvent } from '@cerc-io/util';

const AZIMUTH_CONTRACT = '0x223c067F8CF28ae173EE5CafEa60cA44C335fecB';
const MOCK_TX_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000';
const MOCK_FROM_ADDRESS = '0x0000000000000000000000000000000000000000';

export type MockEventType = 'ESCAPE_REQUESTED' | 'ESCAPE_ACCEPTED' | 'ESCAPE_CANCELED' | 'LOST_SPONSOR' | 'OWNER_CHANGED';

export interface MockEventInput {
  type: MockEventType;
  point: number;
  sponsor?: number;
  owner?: string;
  blockNumber: number;
}

class MockEventStore {
  private events: ResultEvent[] = [];

  addEvents (inputs: MockEventInput[]): number {
    const newEvents = inputs.map((input, index) => this.createMockEvent(input, index));
    this.events.push(...newEvents);
    return newEvents.length;
  }

  getEventsInRange (fromBlock: number, toBlock: number, eventName?: string): ResultEvent[] {
    return this.events.filter(event => {
      const blockNumber = event.block.number;
      const matchesRange = blockNumber >= fromBlock && blockNumber <= toBlock;
      const matchesName = !eventName || event.event.__typename === `${eventName}Event`;
      return matchesRange && matchesName;
    });
  }

  private createMockEvent (input: MockEventInput, eventIndex: number): ResultEvent {
    const { type, point, sponsor, owner, blockNumber } = input;

    const blockHash = `0x${blockNumber.toString(16).padStart(64, '0')}`;
    const parentHash = `0x${(blockNumber - 1).toString(16).padStart(64, '0')}`;

    return {
      block: {
        cid: null,
        hash: blockHash,
        number: blockNumber,
        timestamp: Math.floor(Date.now() / 1000),
        parentHash
      },
      tx: {
        hash: MOCK_TX_HASH,
        index: 0,
        from: MOCK_FROM_ADDRESS,
        to: AZIMUTH_CONTRACT
      },
      contract: AZIMUTH_CONTRACT,
      eventIndex,
      eventSignature: '',
      event: this.createEventData(type, point, sponsor, owner),
      proof: ''
    };
  }

  private createEventData (type: MockEventType, point: number, sponsor?: number, owner?: string): any {
    switch (type) {
      case 'ESCAPE_REQUESTED':
        return {
          __typename: 'EscapeRequestedEvent',
          point: BigInt(point),
          sponsor: BigInt(sponsor ?? 0)
        };
      case 'ESCAPE_ACCEPTED':
        return {
          __typename: 'EscapeAcceptedEvent',
          point: BigInt(point),
          sponsor: BigInt(sponsor ?? 0)
        };
      case 'ESCAPE_CANCELED':
        return {
          __typename: 'EscapeCanceledEvent',
          point: BigInt(point),
          sponsor: BigInt(sponsor ?? 0)
        };
      case 'LOST_SPONSOR':
        return {
          __typename: 'LostSponsorEvent',
          point: BigInt(point),
          sponsor: BigInt(sponsor ?? 0)
        };
      case 'OWNER_CHANGED':
        return {
          __typename: 'OwnerChangedEvent',
          point: BigInt(point),
          owner: owner ?? ''
        };
      default:
        throw new Error(`Unknown mock event type: ${type}`);
    }
  }
}

export const mockEventStore = new MockEventStore();
