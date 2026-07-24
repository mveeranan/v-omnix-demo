import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecentOrderItem } from '../../models/dashboard-analytics.model';

@Component({
  selector: 'app-recent-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="recent-orders">
      <div class="recent-orders__header">
        <h3 class="recent-orders__title">Recent Orders</h3>
        <a href="/admin/orders" class="recent-orders__link">View All →</a>
      </div>

      <div class="recent-orders__table-wrapper">
        @if (orders && orders.length > 0) {
          <table class="recent-orders__table">
            <thead class="recent-orders__thead">
              <tr>
                <th class="recent-orders__th">Order</th>
                <th class="recent-orders__th">Customer</th>
                <th class="recent-orders__th">Amount</th>
                <th class="recent-orders__th">Status</th>
                <th class="recent-orders__th">Date</th>
              </tr>
            </thead>
            <tbody class="recent-orders__tbody">
              <tr *ngFor="let order of orders" class="recent-orders__tr">
                <td class="recent-orders__td">
                  <span class="recent-orders__order-num">{{ order.orderNumber }}</span>
                </td>
                <td class="recent-orders__td">
                  <div class="recent-orders__customer">
                    <div class="recent-orders__customer-name">{{ order.customerName }}</div>
                    <div class="recent-orders__customer-email">{{ order.customerEmail }}</div>
                  </div>
                </td>
                <td class="recent-orders__td">
                  <span class="recent-orders__amount">{{ order.total | currency }}</span>
                </td>
                <td class="recent-orders__td">
                  <span [class]="'recent-orders__badge recent-orders__badge--' + order.status">
                    {{ order.status | titlecase }}
                  </span>
                </td>
                <td class="recent-orders__td">
                  <span class="recent-orders__date">{{ order.daysAgo }}d ago</span>
                </td>
              </tr>
            </tbody>
          </table>
        } @else {
          <div class="recent-orders__empty">
            <p>No orders yet</p>
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './recent-orders.component.scss'
})
export class RecentOrdersComponent {
  @Input() orders: RecentOrderItem[] | undefined | null = null;
}
