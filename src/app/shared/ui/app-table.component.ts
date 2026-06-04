import { Component } from '@angular/core';

@Component({
  selector: 'app-table',
  standalone: true,
  template: `
    <div class="admin-glass-card admin-bookings-table-wrap overflow-hidden rounded-xl">
      <div class="overflow-x-auto">
        <ng-content />
      </div>
    </div>
  `
})
export class AppTableComponent {}
