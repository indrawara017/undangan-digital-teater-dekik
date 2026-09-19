import { describe, expect, it } from 'vitest';
import { orderPublicEvents } from './public-events';

const referenceTime = new Date('2026-09-19T00:00:00.000Z').getTime();

describe('orderPublicEvents', () => {
  it('prioritizes upcoming events with available tickets, then other upcoming events, then completed events', () => {
    const events = [
      { id: 'past', date: '2026-09-01T19:00:00.000Z', ticket_tiers: [{ available_quota: 10 }] },
      { id: 'coming-soon', date: '2026-10-10T19:00:00.000Z', ticket_tiers: [] },
      { id: 'ready', date: '2026-10-20T19:00:00.000Z', ticket_tiers: [{ available_quota: 10 }] },
    ];

    expect(orderPublicEvents(events, referenceTime).map((event) => event.id)).toEqual([
      'ready',
      'coming-soon',
      'past',
    ]);
  });
});
