import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, TrendingUp, ShoppingCart, Users, Package, AlertCircle } from 'lucide-angular';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="empty-state">
      <div class="empty-state__icon">
        <lucide-icon *ngIf="type === 'revenue'" [img]="trendIcon" class="w-16 h-16" />
        <lucide-icon *ngIf="type === 'orders'" [img]="ordersIcon" class="w-16 h-16" />
        <lucide-icon *ngIf="type === 'customers'" [img]="customersIcon" class="w-16 h-16" />
        <lucide-icon *ngIf="type === 'products'" [img]="productsIcon" class="w-16 h-16" />
        <lucide-icon *ngIf="type === 'insights'" [img]="alertIcon" class="w-16 h-16" />
      </div>

      <h3 class="empty-state__title">{{ title }}</h3>
      <p class="empty-state__message">{{ message }}</p>

      @if (actionLabel && actionUrl) {
        <a [href]="actionUrl" class="empty-state__action">{{ actionLabel }}</a>
      }
    </div>
  `,
  styleUrl: './empty-state.component.scss'
})
export class EmptyStateComponent {
  @Input() type: 'revenue' | 'orders' | 'customers' | 'products' | 'insights' = 'revenue';
  @Input() title = 'No data available';
  @Input() message = 'Start creating content to see analytics here.';
  @Input() actionLabel: string | null = null;
  @Input() actionUrl: string | null = null;

  readonly trendIcon = TrendingUp;
  readonly ordersIcon = ShoppingCart;
  readonly customersIcon = Users;
  readonly productsIcon = Package;
  readonly alertIcon = AlertCircle;
}
