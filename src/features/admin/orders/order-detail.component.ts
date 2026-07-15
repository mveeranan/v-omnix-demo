import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminPageShellComponent } from '@features/admin/shared/admin-page-shell.component';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner.component';
import { OrderService } from './data-access/order.service';
import { Order, OrderStatus } from './models/order.model';
import { NotificationService } from '@core/notifications/notification.service';
import { getApiErrorMessage } from '@shared/utils/api-error.util';

/** Mirrors the backend's status transition graph (OrderManagementService.AllowedTransitions). */
const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: []
};

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [FormsModule, RouterLink, AdminPageShellComponent, LoadingSpinnerComponent],
  template: `
    <app-admin-page-shell eyebrow="Order" [title]="order()?.orderNumber ? '#' + order()!.orderNumber : 'Order detail'" description="Complete order information and actions.">
      @if (loading()) {
        <app-loading-spinner />
      } @else if (!order()) {
        <p>Order not found.</p>
        <a routerLink="/admin/orders" class="text-indigo-600 hover:underline">Back to orders</a>
      } @else {
        @if (order(); as o) {
          @if (statusError()) {
            <p class="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{{ statusError() }}</p>
          }
          <div class="grid gap-6 lg:grid-cols-3">
            <div class="space-y-6 lg:col-span-2">
              <section class="admin-glass-card rounded-xl p-6">
                <h2 class="font-semibold">Customer</h2>
                <p class="mt-2">{{ o.customerName }}</p>
                <p class="text-sm text-[var(--text-muted)]">{{ o.customerEmail }} · {{ o.customerPhone }}</p>
                <p class="mt-2 text-sm">{{ o.shippingAddress.address }}, {{ o.shippingAddress.city }}, {{ o.shippingAddress.country }}</p>
              </section>

              <section class="admin-glass-card rounded-xl p-6">
                <h2 class="mb-4 font-semibold">Items</h2>
                @for (line of o.items; track line.productId) {
                  <div class="flex justify-between border-t py-3 text-sm">
                    <span>{{ line.productName }} × {{ line.quantity }}</span>
                    <span>{{ format(line.lineTotal, o.currency) }}</span>
                  </div>
                }
                <div class="mt-4 space-y-1 border-t pt-4 text-sm">
                  <div class="flex justify-between"><span>Subtotal</span><span>{{ format(o.subtotal, o.currency) }}</span></div>
                  <div class="flex justify-between"><span>Shipping</span><span>{{ format(o.shipping, o.currency) }}</span></div>
                  <div class="flex justify-between"><span>Tax</span><span>{{ format(o.tax, o.currency) }}</span></div>
                  @if (o.discount) {
                    <div class="flex justify-between text-emerald-600"><span>Discount</span><span>-{{ format(o.discount, o.currency) }}</span></div>
                  }
                  <div class="flex justify-between text-lg font-bold"><span>Total</span><span>{{ format(o.total, o.currency) }}</span></div>
                </div>
              </section>

              <section class="admin-glass-card rounded-xl p-6">
                <h2 class="mb-4 font-semibold">Timeline</h2>
                <ul class="space-y-3">
                  @for (e of o.timeline; track e.id) {
                    <li class="flex items-center gap-2 text-sm">
                      <span class="h-2 w-2 rounded-full" [class.bg-emerald-500]="e.completed" [class.bg-zinc-300]="!e.completed"></span>
                      {{ e.label }} — {{ formatDate(e.at) }}
                    </li>
                  }
                </ul>
              </section>
            </div>

            <aside class="space-y-4">
              <section class="admin-glass-card rounded-xl p-6">
                <p class="text-sm">Current status: <strong class="capitalize">{{ o.status }}</strong></p>

                @if (nextStatuses(o.status).length) {
                  <label class="mt-3 block space-y-1 text-sm">
                    <span class="font-medium">Move to</span>
                    <select class="pf-editor-input w-full" [(ngModel)]="pendingStatus">
                      <option value="" disabled>Select next status…</option>
                      @for (s of nextStatuses(o.status); track s) {
                        <option [value]="s">{{ s }}</option>
                      }
                    </select>
                  </label>

                  @if (pendingStatus === 'shipped' || pendingStatus === 'delivered') {
                    <label class="mt-3 block space-y-1 text-sm">
                      <span class="font-medium">Tracking number</span>
                      <input class="pf-editor-input w-full" [(ngModel)]="trackingNumber" placeholder="e.g. 1Z999AA10123456784" />
                    </label>
                    <label class="mt-3 block space-y-1 text-sm">
                      <span class="font-medium">Carrier</span>
                      <input class="pf-editor-input w-full" [(ngModel)]="carrier" placeholder="e.g. UPS, FedEx" />
                    </label>
                  }

                  <label class="mt-3 block space-y-1 text-sm">
                    <span class="font-medium">Note (optional)</span>
                    <textarea class="pf-editor-input w-full min-h-[60px]" [(ngModel)]="statusNote" placeholder="Reason for this update…"></textarea>
                  </label>

                  <button
                    type="button"
                    class="admin-section-action-btn mt-3 w-full rounded-lg py-2 text-sm"
                    [disabled]="!pendingStatus || updatingStatus()"
                    (click)="applyStatus(o.id)">
                    {{ updatingStatus() ? 'Updating…' : 'Update status' }}
                  </button>
                } @else {
                  <p class="mt-3 text-xs text-[var(--text-muted)]">This order is in a final state.</p>
                }

                <p class="mt-4 text-sm">Payment: <strong class="capitalize">{{ o.paymentStatus }}</strong> ({{ o.paymentMethod }})</p>
                <button type="button" class="admin-action-secondary mt-4 w-full rounded-lg py-2 text-sm" (click)="print()">Print invoice</button>
              </section>

              <section class="admin-glass-card rounded-xl p-6">
                <h3 class="font-semibold">General notes</h3>
                <p class="text-xs text-[var(--text-muted)]">For notes not tied to a status change (e.g. a support call).</p>
                <textarea class="pf-editor-input mt-2 w-full min-h-[80px]" [(ngModel)]="noteText" placeholder="Add a note…"></textarea>
                <button type="button" class="admin-section-action-btn mt-2 w-full rounded-lg py-2 text-sm" [disabled]="savingNote()" (click)="addNote()">
                  {{ savingNote() ? 'Saving…' : 'Save note' }}
                </button>
                <ul class="mt-4 space-y-2 text-sm">
                  @for (n of o.notes; track n.id) {
                    <li class="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-900">{{ n.text }} <span class="text-xs text-[var(--text-muted)]">— {{ n.author }}</span></li>
                  }
                </ul>
              </section>
            </aside>
          </div>
        }
      }
    </app-admin-page-shell>
  `
})
export class OrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(OrderService);
  private readonly notifications = inject(NotificationService);

  readonly loading = signal(true);
  readonly order = signal<Order | null>(null);
  readonly updatingStatus = signal(false);
  readonly savingNote = signal(false);
  readonly statusError = signal('');

  pendingStatus: OrderStatus | '' = '';
  trackingNumber = '';
  carrier = '';
  statusNote = '';
  noteText = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      return;
    }
    this.api.getById(id).subscribe({
      next: (o) => {
        this.order.set(o);
        this.loading.set(false);
      },
      error: (err) => {
        this.notifications.errorFromApi(err, 'Could not load this order.');
        this.loading.set(false);
      }
    });
  }

  nextStatuses(current: OrderStatus): OrderStatus[] {
    return NEXT_STATUSES[current] ?? [];
  }

  applyStatus(orderId: string): void {
    if (!this.pendingStatus) return;
    this.updatingStatus.set(true);
    this.statusError.set('');
    this.api
      .updateStatus(orderId, this.pendingStatus, this.trackingNumber, this.carrier, this.statusNote)
      .subscribe({
        next: (updated) => {
          if (updated) this.order.set(updated);
          this.pendingStatus = '';
          this.trackingNumber = '';
          this.carrier = '';
          this.statusNote = '';
          this.updatingStatus.set(false);
        },
        error: (err) => {
          this.statusError.set(getApiErrorMessage(err, 'Could not update status.'));
          this.updatingStatus.set(false);
        }
      });
  }

  addNote(): void {
    const o = this.order();
    if (!o || !this.noteText.trim()) return;
    this.savingNote.set(true);
    this.api.addNote(o.id, this.noteText.trim()).subscribe({
      next: (updated) => {
        if (updated) {
          this.order.set(updated);
          this.noteText = '';
        }
        this.savingNote.set(false);
      },
      error: (err) => {
        this.notifications.errorFromApi(err, 'Could not save note.');
        this.savingNote.set(false);
      }
    });
  }

  print(): void {
    window.print();
  }

  format(value: number, currency: string): string {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString();
  }
}
