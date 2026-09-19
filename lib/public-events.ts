export interface PublicTicketTier {
  available_quota?: number | null;
}

export interface PublicEvent {
  id: string;
  date?: string | null;
  ticket_tiers?: PublicTicketTier[] | null;
}

export function isPublicEventUpcoming(event: PublicEvent, referenceTime: number): boolean {
  if (!event.date) return true;
  return new Date(event.date).getTime() > referenceTime - 86400000;
}

export function isPublicEventReadyToOrder(event: PublicEvent, referenceTime: number): boolean {
  return isPublicEventUpcoming(event, referenceTime) && Boolean(
    event.ticket_tiers?.some((tier) => (tier.available_quota || 0) > 0),
  );
}

export function orderPublicEvents<T extends PublicEvent>(events: T[], referenceTime: number): T[] {
  const getPriority = (event: T) => {
    if (isPublicEventReadyToOrder(event, referenceTime)) return 0;
    return isPublicEventUpcoming(event, referenceTime) ? 1 : 2;
  };

  return [...events].sort((first, second) => {
    const priorityDifference = getPriority(first) - getPriority(second);
    if (priorityDifference) return priorityDifference;

    const firstDate = new Date(first.date || 0).getTime();
    const secondDate = new Date(second.date || 0).getTime();
    return isPublicEventUpcoming(first, referenceTime)
      ? firstDate - secondDate
      : secondDate - firstDate;
  });
}
