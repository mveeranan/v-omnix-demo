import { Component, input } from '@angular/core';

@Component({
  selector: 'app-admin-detail-card',
  standalone: true,
  host: {
    class: 'admin-detail-card-host',
    '[class.admin-detail-card-host--full]': 'full()'
  },
  template: `
    <div class="admin-detail-card" [class.admin-detail-card--full]="full()">
      @if (label()) {
        <span class="admin-detail-card__label">{{ label() }}</span>
      }
      <div class="admin-detail-card__body" [class.admin-detail-card__body--stack]="stack()">
        <ng-content />
      </div>
    </div>
  `
})
export class AdminDetailCardComponent {
  readonly label = input('');
  readonly full = input(false);
  readonly stack = input(true);
}
