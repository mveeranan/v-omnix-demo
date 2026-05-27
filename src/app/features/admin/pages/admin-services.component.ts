import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Clock, DollarSign, Pencil, Plus, Tag, Wrench, X } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { pageFadeIn } from '../animations/admin.animations';
import { AdminServicesStateService } from '../data-access/admin-services-state.service';
import { ServiceDto } from '../models/service.model';
import { AdminPageShellComponent } from '../shared/admin-page-shell.component';

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, AdminPageShellComponent],
  templateUrl: './admin-services.component.html',
  styleUrl: './admin-services.component.scss',
  animations: [pageFadeIn]
})
export class AdminServicesComponent implements OnInit {
  readonly state = inject(AdminServicesStateService);

  readonly wrenchIcon = Wrench;
  readonly plusIcon = Plus;
  readonly editIcon = Pencil;
  readonly closeIcon = X;
  readonly clockIcon = Clock;
  readonly priceIcon = DollarSign;
  readonly tagIcon = Tag;

  ngOnInit(): void {
    this.state.load();
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

  trackByServiceId(_index: number, service: ServiceDto): string {
    return service.id;
  }
}
