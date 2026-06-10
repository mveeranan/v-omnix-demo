import { Component, inject, signal } from '@angular/core';
import { BookingsUiStateService } from '../data-access/bookings-ui-state.service';
import { AdminModalShellComponent } from './admin-modal-shell.component';
import { BookingStaffMember } from '../models/booking.model';
import { LucideAngularModule, UserCheck } from 'lucide-angular';

@Component({
  selector: 'app-assign-staff-modal',
  standalone: true,
  imports: [AdminModalShellComponent, LucideAngularModule],
  template: `
    <app-admin-modal-shell
      [open]="state.assignStaffModalOpen()"
      title="Assign Staff"
      subtitle="Select a team member for this booking"
      (close)="state.closeAssignStaffModal()">
      <div class="grid gap-2 sm:grid-cols-2">
        @for (member of state.staff; track member.id) {
          <button
            type="button"
            class="admin-bookings-staff-card text-left"
            [class.admin-bookings-staff-card--selected]="selectedId() === member.id"
            (click)="selectedId.set(member.id)">
            <div class="flex items-center gap-3">
              <span
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white {{ member.avatarColor }}">
                {{ member.initials }}
              </span>
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-[var(--text-primary)]">{{ member.name }}</p>
                <p class="text-xs text-[var(--text-muted)]">{{ member.role }}</p>
                <p class="text-xs text-[var(--text-muted)]">{{ member.branch }}</p>
              </div>
            </div>
          </button>
        }
      </div>

      @if (selectedMember()) {
        @let member = selectedMember()!;
        <article class="admin-glass-card mt-4 rounded-xl p-4">
          <p class="admin-widget__section-label mb-2">Selected staff</p>
          <div class="flex items-center gap-3">
            <span
              class="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-white {{ member.avatarColor }}">
              {{ member.initials }}
            </span>
            <div>
              <p class="font-medium text-[var(--text-primary)]">{{ member.name }}</p>
              <p class="text-sm text-[var(--text-muted)]">{{ member.role }} · {{ member.branch }}</p>
            </div>
          </div>
        </article>
      }

      <ng-container modalFooter>
        <button type="button" class="admin-bookings-secondary-btn" (click)="state.closeAssignStaffModal()" [disabled]="assigning()">
          Cancel
        </button>
        <button
          type="button"
          class="admin-bookings-primary-btn"
          [disabled]="!selectedId() || assigning()"
          (click)="confirm()">
          <lucide-icon [img]="checkIcon" class="h-4 w-4" />
          {{ assigning() ? 'Assigning…' : 'Confirm Assignment' }}
        </button>
      </ng-container>
    </app-admin-modal-shell>
  `
})
export class AssignStaffModalComponent {
  readonly state = inject(BookingsUiStateService);
  readonly selectedId = signal<string | null>(null);
  readonly assigning = signal(false);
  readonly checkIcon = UserCheck;

  selectedMember = () => {
    const id = this.selectedId();
    return id ? this.state.staff.find((s) => s.id === id) : null;
  };

  confirm(): void {
    if (this.assigning()) {
      return;
    }

    const bookingId = this.state.assignStaffBookingId();
    const staffId = this.selectedId();
    if (!bookingId || !staffId) {
      return;
    }

    this.assigning.set(true);
    try {
      this.state.assignStaff(bookingId, staffId);
      this.selectedId.set(null);
    } finally {
      this.assigning.set(false);
    }
  }
}
