import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AdminPageShellComponent } from '@features/admin/shared/admin-page-shell.component';
import { AppTableComponent } from '@shared/ui/app-table.component';
import { AdminStatusBadgeComponent, AdminStatusBadgeVariant } from '@shared/ui/admin-status-badge.component';
import { AdminTableActionComponent } from '@shared/ui/admin-table-action.component';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner.component';
import { ReturnAdminService } from '../data-access/return-admin.service';
import { Return } from '../models/return.model';
import { ReturnStatus } from '@shared/models/backend-enums';
import { NotificationService } from '@core/notifications/notification.service';

// Map numeric enum values returned by older API versions to string labels.
const RETURN_STATUS_LABELS: Record<number, ReturnStatus> = {
  1: 'Pending', 2: 'Approved', 3: 'Rejected', 4: 'Shipped', 5: 'Received', 6: 'Completed'
};

@Component({
  selector: 'app-returns-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AdminPageShellComponent,
    AppTableComponent,
    AdminStatusBadgeComponent,
    AdminTableActionComponent,
    LoadingSpinnerComponent,
  ],
  template: `
    <app-admin-page-shell eyebrow="Operations" title="Returns" description="Manage return requests and refund status.">

      <!-- Detail / Edit panel -->
      @if (formOpen()) {
        <div class="admin-glass-card mb-4 space-y-4 rounded-xl p-6">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Return — {{ currentReturn()?.referenceNumber }}</h3>
            <app-admin-status-badge
              [label]="resolveLabel(currentReturn()?.status)"
              [variant]="statusVariant(resolveLabel(currentReturn()?.status))" />
          </div>

          <!-- Read-only info always visible -->
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="font-medium">Reason</span>
              <p class="text-[var(--text-secondary)] mt-0.5">{{ currentReturn()?.reason }}</p>
            </div>
            <div>
              <span class="font-medium">Customer Notes</span>
              <p class="text-[var(--text-secondary)] mt-0.5">{{ currentReturn()?.customerNotes || 'None' }}</p>
            </div>
            <div>
              <span class="font-medium">Refund Amount</span>
              <p class="text-[var(--text-secondary)] mt-0.5">{{ format(currentReturn()?.refundAmount ?? 0) }}</p>
            </div>
            <div>
              <span class="font-medium">Requested</span>
              <p class="text-[var(--text-secondary)] mt-0.5">{{ currentReturn()?.requestedAt | date: 'medium' }}</p>
            </div>
          </div>

          @if (isTerminal()) {
            <!-- Terminal state: closed, no further transitions allowed -->
            <div class="rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              This return is <strong>{{ resolveLabel(currentReturn()?.status) }}</strong> and cannot be modified further.
            </div>
            <div class="flex justify-end">
              <button type="button" class="admin-action-secondary rounded-lg px-4 py-2 text-sm" (click)="closeForm()">Close</button>
            </div>
          } @else {
            <!-- Active state: show transition form -->
            <form [formGroup]="form" (ngSubmit)="save()">
              <div class="space-y-3">
                <label class="block space-y-1">
                  <span class="text-sm font-medium">Move to Status</span>
                  <select class="pf-editor-input w-full" formControlName="status">
                    @for (s of nextStatuses(); track s) {
                      <option [value]="s">{{ s }}</option>
                    }
                  </select>
                </label>
                <label class="block space-y-1">
                  <span class="text-sm font-medium">Admin Notes (optional)</span>
                  <textarea class="pf-editor-input w-full" formControlName="adminNotes" rows="2"></textarea>
                </label>
              </div>
              <div class="mt-4 flex justify-end gap-2">
                <button type="button" class="admin-action-secondary rounded-lg px-4 py-2 text-sm" (click)="closeForm()">Cancel</button>
                <button type="submit" [disabled]="saving()" class="admin-section-action-btn rounded-lg px-4 py-2 text-sm">
                  {{ saving() ? 'Saving…' : 'Update Status' }}
                </button>
              </div>
            </form>
          }
        </div>
      }

      <!-- List view -->
      @if (!formOpen()) {
        <div class="admin-data-table-toolbar">
          <p class="admin-data-table-toolbar__summary">Showing {{ filtered().length }} of {{ returns().length }} returns</p>
          <div class="admin-data-table-toolbar__filters">
            <select class="pf-editor-input" [(ngModel)]="statusFilter" (ngModelChange)="applyFilter()">
              <option value="">All statuses</option>
              @for (s of allStatuses; track s) {
                <option [value]="s">{{ s }}</option>
              }
            </select>
          </div>
        </div>

        @if (loading()) {
          <app-loading-spinner label="Loading returns…" />
        } @else if (!filtered().length) {
          <div class="admin-glass-card rounded-xl p-8 text-center">
            <p class="font-medium">No returns found</p>
          </div>
        } @else {
          <app-table>
            <table class="admin-data-table">
              <thead>
                <tr>
                  <th class="admin-data-table__index">#</th>
                  <th>Reference</th>
                  <th>Reason</th>
                  <th>Refund Amount</th>
                  <th>Requested</th>
                  <th class="admin-data-table__col-status">Status</th>
                  <th class="admin-data-table__col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (r of filtered(); track r.id; let i = $index) {
                  <tr class="admin-data-table__row">
                    <td class="admin-data-table__index">{{ i + 1 }}</td>
                    <td><span class="admin-data-table__entity-title">{{ r.referenceNumber }}</span></td>
                    <td class="text-[var(--text-secondary)]">{{ r.reason }}</td>
                    <td><span class="admin-data-table__price">{{ format(r.refundAmount) }}</span></td>
                    <td><small class="text-[var(--text-secondary)]">{{ r.requestedAt | date: 'short' }}</small></td>
                    <td class="admin-data-table__col-status">
                      <app-admin-status-badge
                        [label]="resolveLabel(r.status)"
                        [variant]="statusVariant(resolveLabel(r.status))" />
                    </td>
                    <td class="admin-data-table__col-actions">
                      <div class="admin-data-table__actions">
                        <app-admin-table-action label="View" variant="edit" (action)="openEdit(r)" />
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </app-table>
        }
      }
    </app-admin-page-shell>
  `
})
export class ReturnsListComponent implements OnInit {
  private readonly api = inject(ReturnAdminService);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);

  readonly allStatuses: ReturnStatus[] = ['Pending', 'Approved', 'Rejected', 'Shipped', 'Received', 'Completed'];

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly returns = signal<Return[]>([]);
  readonly filtered = signal<Return[]>([]);
  readonly formOpen = signal(false);
  readonly editingId = signal<string | null>(null);
  statusFilter = '';

  readonly currentReturn = computed(() => {
    const id = this.editingId();
    return id ? this.returns().find(r => r.id === id) : null;
  });

  readonly isTerminal = computed(() => {
    const s = this.resolveLabel(this.currentReturn()?.status);
    return s === 'Rejected' || s === 'Completed';
  });

  readonly nextStatuses = computed((): ReturnStatus[] => {
    switch (this.resolveLabel(this.currentReturn()?.status)) {
      case 'Pending':   return ['Approved', 'Rejected'];
      case 'Approved':  return ['Shipped', 'Rejected'];
      case 'Shipped':   return ['Received'];
      case 'Received':  return ['Completed'];
      default:          return [];
    }
  });

  readonly form = this.fb.nonNullable.group({
    status: ['' as ReturnStatus],
    adminNotes: ['']
  });

  ngOnInit(): void {
    this.load();
  }

  /** Converts numeric enum values (legacy API) or unknown values to a string ReturnStatus. */
  resolveLabel(status: ReturnStatus | number | null | undefined): ReturnStatus {
    if (status == null) return 'Pending';
    if (typeof status === 'number') return RETURN_STATUS_LABELS[status] ?? 'Pending';
    return status;
  }

  statusVariant(status: ReturnStatus): AdminStatusBadgeVariant {
    switch (status) {
      case 'Approved':
      case 'Completed':
      case 'Received':
        return 'success';
      case 'Pending':
      case 'Shipped':
        return 'warning';
      case 'Rejected':
        return 'danger';
      default:
        return 'neutral';
    }
  }

  load(): void {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (response) => {
        this.returns.set(response.items);
        this.applyFilter();
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  applyFilter(): void {
    const all = this.returns();
    this.filtered.set(
      this.statusFilter
        ? all.filter(r => this.resolveLabel(r.status) === this.statusFilter)
        : all
    );
  }

  openEdit(r: Return): void {
    this.editingId.set(r.id);
    this.formOpen.set(true);
    // Patch with first valid next status so the dropdown always has a selection.
    const first = this.nextStatuses()[0] ?? '';
    this.form.patchValue({ status: first, adminNotes: '' });
  }

  closeForm(): void {
    this.formOpen.set(false);
    this.editingId.set(null);
  }

  save(): void {
    const v = this.form.getRawValue();
    const id = this.editingId();
    if (!id || !v.status) return;

    const valid = this.nextStatuses();
    if (!valid.includes(v.status)) {
      this.notifications.error(`"${v.status}" is not a valid transition from "${this.resolveLabel(this.currentReturn()?.status)}".`);
      return;
    }

    this.saving.set(true);
    this.api.update(id, { status: v.status, adminNotes: v.adminNotes || undefined }).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeForm();
        this.load();
        this.notifications.success('Return status updated');
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.notifications.errorFromApi(err, 'Could not update return');
      }
    });
  }

  format(value: number, currency = 'USD'): string {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
  }
}
