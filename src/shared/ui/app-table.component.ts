import { Component } from '@angular/core';

@Component({
  selector: 'app-table',
  standalone: true,
  styleUrl: './app-table.component.scss',
  template: `
    <div class="admin-data-table-context">
      <div class="admin-data-table-wrap">
        <div class="admin-data-table-scroll">
          <ng-content />
        </div>
      </div>
    </div>
  `
})
export class AppTableComponent {}
