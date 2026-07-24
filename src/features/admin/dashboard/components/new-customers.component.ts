import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewCustomerItem } from '../../models/dashboard-analytics.model';

@Component({
  selector: 'app-new-customers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="new-customers">
      <div class="new-customers__header">
        <h3 class="new-customers__title">New Customers</h3>
        <a href="/admin/customers" class="new-customers__link">View All →</a>
      </div>

      @if (customers && customers.length > 0) {
        <div class="new-customers__list">
          <div *ngFor="let customer of customers" class="new-customers__item">
            <div class="new-customers__avatar">{{ getInitials(customer.name) }}</div>

            <div class="new-customers__content">
              <div class="new-customers__name">{{ customer.name }}</div>
              <div class="new-customers__email">{{ customer.email }}</div>
            </div>

            <div class="new-customers__stats">
              <div class="new-customers__stat">
                <span class="new-customers__stat-label">First Order</span>
                <span class="new-customers__stat-value">{{ customer.daysAgo }}d ago</span>
              </div>
              <div class="new-customers__stat">
                <span class="new-customers__stat-label">Amount</span>
                <span class="new-customers__stat-value">{{ customer.firstOrderTotal | currency }}</span>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="new-customers__empty">
          <p>No new customers yet</p>
        </div>
      }
    </div>
  `,
  styleUrl: './new-customers.component.scss'
})
export class NewCustomersComponent {
  @Input() customers: NewCustomerItem[] | undefined | null = null;

  getInitials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }
}
