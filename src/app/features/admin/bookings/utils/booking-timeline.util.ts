import { BookingStatus, TimelineEvent } from '../models/booking.model';

export function buildTimeline(status: BookingStatus, baseDate: Date): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      key: 'created',
      label: 'Booking Created',
      completed: true,
      active: false,
      timestamp: new Date(baseDate)
    }
  ];

  const statusOrder: BookingStatus[] = [
    'pending',
    'confirmed',
    'assigned',
    'in-progress',
    'completed'
  ];
  const idx =
    status === 'cancelled'
      ? statusOrder.indexOf('confirmed')
      : statusOrder.indexOf(status);

  const addEvent = (
    key: TimelineEvent['key'],
    label: string,
    completed: boolean,
    active: boolean,
    offsetHours: number
  ) => {
    const ts = new Date(baseDate);
    ts.setHours(ts.getHours() + offsetHours);
    events.push({
      key,
      label,
      completed,
      active,
      timestamp: completed ? ts : undefined
    });
  };

  addEvent('confirmed', 'Confirmed', idx >= 1, status === 'confirmed', 1);
  addEvent('assigned', 'Staff Assigned', idx >= 2, status === 'assigned', 3);
  addEvent('in-progress', 'Service In Progress', idx >= 3, status === 'in-progress', 5);
  addEvent('completed', 'Completed', idx >= 4, status === 'completed', 8);

  if (status === 'cancelled') {
    const ts = new Date(baseDate);
    ts.setHours(ts.getHours() + 2);
    events.push({
      key: 'cancelled',
      label: 'Cancelled',
      completed: true,
      active: true,
      timestamp: ts
    });
  }

  return events;
}
