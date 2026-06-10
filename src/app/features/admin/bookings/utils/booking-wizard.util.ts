import { BookingServiceOption } from '../models/booking.model';

export function resolveSelectedServices(
  options: BookingServiceOption[],
  serviceIds: string[]
): BookingServiceOption[] {
  const idSet = new Set(serviceIds);
  return options.filter((s) => idSet.has(s.id));
}

export function sumServiceDurationMinutes(services: BookingServiceOption[]): number {
  return services.reduce((sum, s) => sum + s.durationMinutes, 0);
}

export function sumServicePrice(services: BookingServiceOption[]): number {
  return services.reduce((sum, s) => sum + s.price, 0);
}

export function formatServiceNamesList(services: BookingServiceOption[]): string {
  return services.map((s) => s.name).join(', ');
}

export function servicesDurationChanged(
  previousIds: string[],
  nextIds: string[],
  options: BookingServiceOption[]
): boolean {
  const prev = sumServiceDurationMinutes(resolveSelectedServices(options, previousIds));
  const next = sumServiceDurationMinutes(resolveSelectedServices(options, nextIds));
  return prev !== next;
}
