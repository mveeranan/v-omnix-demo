import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevenueChart } from '../../models/dashboard-analytics.model';

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="revenue-chart">
      <div class="revenue-chart__header">
        <h3 class="revenue-chart__title">Revenue Trend</h3>
        <div class="revenue-chart__period-selector">
          <button
            *ngFor="let period of periods"
            [class.revenue-chart__period-btn--active]="selectedPeriod === period"
            class="revenue-chart__period-btn"
            (click)="selectedPeriod = period">
            {{ period }}
          </button>
        </div>
      </div>

      <div class="revenue-chart__stats">
        <div class="revenue-chart__stat">
          <span class="revenue-chart__stat-label">Total</span>
          <span class="revenue-chart__stat-value">{{ data?.total | currency }}</span>
        </div>
        <div class="revenue-chart__stat">
          <span class="revenue-chart__stat-label">Average</span>
          <span class="revenue-chart__stat-value">{{ data?.average | currency }}</span>
        </div>
        <div class="revenue-chart__stat">
          <span class="revenue-chart__stat-label">Peak</span>
          <span class="revenue-chart__stat-value">{{ data?.max | currency }}</span>
        </div>
      </div>

      <div class="revenue-chart__container">
        @if (data?.data && data?.data!.length > 0) {
          <svg
            class="revenue-chart__svg"
            [attr.viewBox]="'0 0 ' + svgWidth + ' ' + svgHeight"
            preserveAspectRatio="none">
            <!-- Grid lines -->
            <line x1="40" y1="10" x2="40" y2="310" class="revenue-chart__axis" />
            <line x1="40" y1="310" x2="580" y2="310" class="revenue-chart__axis" />

            <!-- Y-axis labels -->
            <text x="35" y="315" class="revenue-chart__label">$0</text>
            <text x="10" y="160" class="revenue-chart__label">{{ data?.max | currency }}</text>

            <!-- Data points and line -->
            <polyline
              [attr.points]="dataPoints()"
              class="revenue-chart__line"
              fill="none"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round" />

            <!-- Data point circles -->
            <circle
              *ngFor="let point of scaledPoints()"
              [attr.cx]="point.x"
              [attr.cy]="point.y"
              r="3"
              class="revenue-chart__point" />

            <!-- X-axis labels -->
            <text
              *ngFor="let label of xAxisLabels(); let i = index"
              [attr.x]="40 + (i * (520 / (data?.data?.length || 1 - 1)))"
              y="330"
              class="revenue-chart__label"
              text-anchor="middle">
              {{ label }}
            </text>
          </svg>
        } @else {
          <div class="revenue-chart__empty">
            <p>No data available</p>
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './revenue-chart.component.scss'
})
export class RevenueChartComponent {
  readonly chartData = input<RevenueChart | undefined | null>(null);

  get data(): RevenueChart | undefined {
    return this.chartData() ?? undefined;
  }

  readonly svgWidth = 620;
  readonly svgHeight = 350;

  periods = ['7d', '30d', '90d'] as const;
  selectedPeriod: '7d' | '30d' | '90d' = '30d';

  scaledPoints = computed(() => {
    const data = this.data;
    if (!data || !data.data || data.data.length === 0) {
      return [];
    }

    const maxValue = data.max;
    const minValue = 0;
    const range = maxValue - minValue;

    const chartWidth = this.svgWidth - 80;
    const chartHeight = 300;
    const padding = 40;

    return data.data.map((point, index) => ({
      x: padding + (index / (data.data.length - 1)) * chartWidth,
      y: chartHeight - ((point.value - minValue) / range) * chartHeight + 10,
      value: point.value
    }));
  });

  dataPoints = computed(() => {
    const points = this.scaledPoints();
    return points.map((p) => `${p.x},${p.y}`).join(' ');
  });

  xAxisLabels = computed(() => {
    const data = this.data;
    if (!data || !data.data) return [];

    // Show every 3rd or 4th label to avoid crowding
    const interval = Math.ceil(data.data.length / 4);
    return data.data
      .map((d: any, i: number) => (i % interval === 0 ? d.label.substring(5) : null))
      .filter((l: any) => l !== null);
  });
}
