import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ListChecks, MapPin, Pencil, Plus, Star, Wrench, X } from 'lucide-angular';
import { pageFadeIn } from '../animations/admin.animations';
import { AdminBranchesStateService } from '../data-access/admin-branches-state.service';
import { BranchDto, getBranchAssignedServiceIds } from '../models/branch.model';
import { ServiceDto } from '../models/service.model';
import { AdminPageShellComponent } from '../shared/admin-page-shell.component';
import { CountryDialCodePickerComponent } from '../../../shared/ui/country-dial-code-picker.component';

@Component({
  selector: 'app-admin-branches',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    AdminPageShellComponent,
    CountryDialCodePickerComponent
  ],
  templateUrl: './admin-branches.component.html',
  styleUrl: './admin-branches.component.scss',
  animations: [pageFadeIn]
})
export class AdminBranchesComponent implements OnInit {
  readonly state = inject(AdminBranchesStateService);

  readonly mapPinIcon = MapPin;
  readonly plusIcon = Plus;
  readonly editIcon = Pencil;
  readonly closeIcon = X;
  readonly starIcon = Star;
  readonly wrenchIcon = Wrench;
  readonly listChecksIcon = ListChecks;

  ngOnInit(): void {
    this.state.load();
  }

  formatLocation(branch: BranchDto): string {
    const parts = [branch.city, branch.addressLine1].filter((p) => p?.trim());
    return parts.length ? parts.join(' · ') : 'No address';
  }

  formatHours(branch: BranchDto): string {
    const open = branch.openingTime?.slice(0, 5);
    const close = branch.closingTime?.slice(0, 5);
    if (open && close) {
      return `${open} – ${close}`;
    }
    return open || close || '—';
  }

  trackByBranchId(_index: number, branch: BranchDto): string {
    return branch.id ?? branch.name;
  }

  trackByServiceId(_index: number, service: ServiceDto): string {
    return service.id;
  }

  branchServiceCount(branch: BranchDto): number {
    return getBranchAssignedServiceIds(branch).length;
  }

  formatDuration(minutes: number): string {
    if (!minutes || minutes < 1) {
      return '—';
    }
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price ?? 0);
  }
}
