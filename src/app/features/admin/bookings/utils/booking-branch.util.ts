import { BranchDto } from '../../models/branch.model';
import { ServiceDto } from '../../models/service.model';
import { BookingServiceOption } from '../models/booking.model';

export function serviceToBookingOption(service: ServiceDto): BookingServiceOption {
  return {
    id: service.id,
    name: service.name,
    durationMinutes: service.durationMinutes,
    price: service.price,
    category: service.category ?? undefined
  };
}

export function branchServicesToBookingOptions(branch: BranchDto | null | undefined): BookingServiceOption[] {
  const services = branch?.services ?? [];
  return services.filter((s) => s.isActive).map(serviceToBookingOption);
}

export function aggregateBookingServiceOptions(branches: BranchDto[]): BookingServiceOption[] {
  const seen = new Set<string>();
  const options: BookingServiceOption[] = [];
  for (const branch of branches) {
    for (const service of branchServicesToBookingOptions(branch)) {
      if (seen.has(service.id)) {
        continue;
      }
      seen.add(service.id);
      options.push(service);
    }
  }
  return options.sort((a, b) => a.name.localeCompare(b.name));
}
