import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderStatusChart } from '../../models/dashboard-analytics.model';

interface PieSlice {
  label: string;
  value: number;
  percentage: number;
  color: string;
  startAngle: number;
  endAngle: number;
}

@Component({
  selector: 'app-order-status-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="order-status-chart">
      <div class="order-status-chart__header">
        <h3 class="order-status-chart__title">Order Status Distribution</h3>
      </div>

      <div class="order-status-chart__container">
        @if (slices().length > 0) {
          <div class="order-status-chart__pie">
            <svg
              class="order-status-chart__svg"
              viewBox="0 0 200 200"
              preserveAspectRatio="xMidYMid meet">
              <!-- Pie slices -->
              <g transform="translate(100,100)">
                <path
                  *ngFor="let slice of slices()"
                  [attr.d]="getPiePath(slice)"
                  [attr.fill]="slice.color"
                  class="order-status-chart__slice" />
              </g>
            </svg>
          </div>

          <!-- Legend -->
          <div class="order-status-chart__legend">
            <div *ngFor="let slice of slices()" class="order-status-chart__legend-item">
              <div
                class="order-status-chart__legend-color"
                [style.backgroundColor]="slice.color"></div>
              <div class="order-status-chart__legend-content">
                <span class="order-status-chart__legend-label">{{ slice.label }}</span>
                <span class="order-status-chart__legend-value">
                  {{ slice.value }} ({{ slice.percentage }}%)
                </span>
              </div>
            </div>
          </div>
        } @else {
          <div class="order-status-chart__empty">
            <p>No order data available</p>
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './order-status-chart.component.scss'
})
export class OrderStatusChartComponent {
  readonly chartData = input<OrderStatusChart | undefined | null>(null);

  readonly statusColors: Record<string, string> = {
    'Pending': 'var(--warning)',
    'Confirmed': 'var(--info)',
    'Processing': 'var(--primary)',
    'Shipped': 'var(--accent)',
    'Delivered': 'var(--success)',
    'Cancelled': 'var(--danger)'
  };

  slices = computed(() => {
    const data = this.chartData();
    if (!data || !data.labels || data.labels.length === 0) {
      return [];
    }

    const total = data.data.reduce((sum, val) => sum + val, 0);
    let currentAngle = 0;

    return data.labels.map((label, index) => {
      const value = data.data[index];
      const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
      const sliceAngle = (percentage / 100) * 360;

      const slice: PieSlice = {
        label,
        value,
        percentage,
        color: data.colors?.[index] || this.statusColors[label] || 'var(--accent-muted)',
        startAngle: currentAngle,
        endAngle: currentAngle + sliceAngle
      };

      currentAngle += sliceAngle;
      return slice;
    });
  });

  getPiePath(slice: PieSlice): string {
    const radius = 80;
    const startAngle = (slice.startAngle * Math.PI) / 180;
    const endAngle = (slice.endAngle * Math.PI) / 180;

    const x1 = radius * Math.cos(startAngle);
    const y1 = radius * Math.sin(startAngle);
    const x2 = radius * Math.cos(endAngle);
    const y2 = radius * Math.sin(endAngle);

    const largeArc = slice.endAngle - slice.startAngle > 180 ? 1 : 0;

    return `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }
}
