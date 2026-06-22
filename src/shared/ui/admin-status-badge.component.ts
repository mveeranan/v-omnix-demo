import { Component, computed, input } from '@angular/core';

export type AdminStatusBadgeVariant =
  | 'active'
  | 'draft'
  | 'inactive'
  | 'archived'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral';

@Component({
  selector: 'app-admin-status-badge',
  standalone: true,
  styleUrl: './admin-status-badge.component.scss',
  template: `
    <span class="admin-status-badge" [class]="'admin-status-badge--' + resolvedVariant()">
      <span class="admin-status-badge__dot" aria-hidden="true"></span>
      {{ label() }}
    </span>
  `
})
export class AdminStatusBadgeComponent {
  readonly label = input.required<string>();
  readonly variant = input<AdminStatusBadgeVariant>('neutral');

  readonly resolvedVariant = computed(() => this.variant());
}
