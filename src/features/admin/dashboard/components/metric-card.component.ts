import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, TrendingUp, TrendingDown } from 'lucide-angular';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="metric-card" [class.metric-card--loading]="loading">
      <!-- Loading skeleton -->
      @if (loading) {
        <div class="metric-card__skeleton">
          <div class="skeleton skeleton--text"></div>
          <div class="skeleton skeleton--number"></div>
          <div class="skeleton skeleton--badge"></div>
        </div>
      } @else {
        <!-- Content -->
        <div class="metric-card__header">
          <p class="metric-card__label">{{ label }}</p>
          @if (icon) {
            <div class="metric-card__icon">{{ icon }}</div>
          }
        </div>

        <div class="metric-card__value">
          {{ formatValue(value) }}
        </div>

        @if (showComparison && comparison !== null && comparison !== undefined) {
          <div class="metric-card__comparison" [class.metric-card__comparison--positive]="comparison > 0" [class.metric-card__comparison--negative]="comparison < 0">
            @if (comparison > 0) {
              <lucide-icon [img]="trendUpIcon" class="h-4 w-4" />
            } @else if (comparison < 0) {
              <lucide-icon [img]="trendDownIcon" class="h-4 w-4" />
            }
            <span>{{ comparison > 0 ? '+' : '' }}{{ comparison }}%</span>
          </div>
        }

        @if (footer) {
          <p class="metric-card__footer">{{ footer }}</p>
        }
      }
    </div>
  `,
  styleUrl: './metric-card.component.scss'
})
export class MetricCardComponent {
  @Input() label: string = '';
  @Input() value: number = 0;
  @Input() comparison: number | null = null;
  @Input() footer: string | null = null;
  @Input() icon: string | null = null;
  @Input() loading = false;
  @Input() showComparison = true;
  @Input() format: 'currency' | 'percent' | 'number' = 'number';

  readonly trendUpIcon = TrendingUp;
  readonly trendDownIcon = TrendingDown;

  formatValue(value: number): string {
    if (this.format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(value);
    }

    if (this.format === 'percent') {
      return `${value.toFixed(0)}%`;
    }

    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0
    }).format(value);
  }
}
