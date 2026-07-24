import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricCardComponent } from './metric-card.component';
import { RevenueChartComponent } from './revenue-chart.component';
import { OrderStatusChartComponent } from './order-status-chart.component';
import { RecentOrdersComponent } from './recent-orders.component';
import { NewCustomersComponent } from './new-customers.component';
import { BusinessInsightsComponent } from './business-insights.component';
import { AdminDashboardDataService } from '../../services/admin-dashboard-data.service';
import { PremiumDashboardData } from '../../models/dashboard-analytics.model';

@Component({
  selector: 'app-premium-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MetricCardComponent,
    RevenueChartComponent,
    OrderStatusChartComponent,
    RecentOrdersComponent,
    NewCustomersComponent,
    BusinessInsightsComponent
  ],
  template: `
    <div class="premium-dashboard">
      <!-- Main Content -->
      <div class="premium-dashboard__container">
        <!-- Top KPI Metrics -->
        <div class="premium-dashboard__kpis">
          <!-- Revenue Card -->
          <app-metric-card
            label="Today's Revenue"
            [value]="revenueMetric()?.current ?? 0"
            [comparison]="revenueMetric()?.growth ?? null"
            [footer]="'vs. yesterday'"
            [loading]="isLoading() ?? false"
            [showComparison]="true"
            format="currency">
          </app-metric-card>

          <!-- Total Orders Card -->
          <app-metric-card
            label="Total Orders"
            [value]="orderMetric()?.current ?? 0"
            [comparison]="orderMetric()?.growth ?? null"
            [footer]="'this month'"
            [loading]="isLoading() ?? false"
            [showComparison]="true"
            format="number">
          </app-metric-card>

          <!-- Customers Card -->
          <app-metric-card
            label="Total Customers"
            [value]="customerMetric()?.current ?? 0"
            [comparison]="customerMetric()?.growth ?? null"
            [footer]="'new this month'"
            [loading]="isLoading() ?? false"
            [showComparison]="true"
            format="number">
          </app-metric-card>

          <!-- Products Card -->
          <app-metric-card
            label="Active Products"
            [value]="productMetric()?.activeProducts ?? 0"
            [comparison]="null"
            [footer]="totalProductsLabel()"
            [loading]="isLoading() ?? false"
            [showComparison]="false"
            format="number">
          </app-metric-card>
        </div>

        <!-- Secondary Metrics Row -->
        <div class="premium-dashboard__secondary-metrics">
          <!-- Avg Order Value -->
          <app-metric-card
            label="Average Order Value"
            [value]="averageOrderValue()"
            [comparison]="null"
            [footer]="'per order'"
            [loading]="isLoading() ?? false"
            [showComparison]="false"
            format="currency">
          </app-metric-card>

          <!-- Pending Payments -->
          <app-metric-card
            label="Pending Payments"
            [value]="pendingPayments()"
            [comparison]="null"
            [footer]="'awaiting payment'"
            [loading]="isLoading() ?? false"
            [showComparison]="false"
            format="currency">
          </app-metric-card>

          <!-- Return Rate -->
          <app-metric-card
            label="Return Customers"
            [value]="returnRate()"
            [comparison]="null"
            [footer]="returningCustomersLabel()"
            [loading]="isLoading() ?? false"
            [showComparison]="false"
            format="percent">
          </app-metric-card>

          <!-- Website Status -->
          <app-metric-card
            label="Website Status"
            [value]="websitePublished() ? 1 : 0"
            [comparison]="null"
            [footer]="websitePublished() ? 'Published' : 'Draft'"
            [loading]="isLoading() ?? false"
            [showComparison]="false"
            format="number">
          </app-metric-card>
        </div>

        <!-- Charts Section -->
        <div class="premium-dashboard__charts">
          <app-revenue-chart [chartData]="revenueChart()"></app-revenue-chart>
          <app-order-status-chart [chartData]="orderStatusChart()"></app-order-status-chart>
        </div>

        <!-- Recent Activity Section -->
        <div class="premium-dashboard__recent-activity">
          <app-recent-orders [orders]="recentOrders()"></app-recent-orders>
          <app-new-customers [customers]="newCustomers()"></app-new-customers>
        </div>

        <!-- Business Insights -->
        <app-business-insights [insights]="businessInsights()"></app-business-insights>
      </div>
    </div>
  `,
  styleUrl: './premium-dashboard.component.scss'
})
export class PremiumDashboardComponent implements OnInit {
  private readonly dashboardDataService = inject(AdminDashboardDataService);

  readonly analytics = this.dashboardDataService.premiumAnalytics;
  readonly isLoading = this.dashboardDataService.isLoading;

  // Business Info
  websitePublished = computed(() => this.analytics()?.websitePublished ?? false);

  // Main Metrics
  revenueMetric = computed(() => this.analytics()?.revenue);
  orderMetric = computed(() => this.analytics()?.orders);
  customerMetric = computed(() => this.analytics()?.customers);
  productMetric = computed(() => this.analytics()?.products);

  // Secondary Metrics
  averageOrderValue = computed(() => this.analytics()?.revenue?.averageOrderValue ?? 0);
  pendingPayments = computed(() => this.analytics()?.revenue?.pendingPayments ?? 0);
  returnRate = computed(() => {
    const metric = this.analytics()?.customers;
    if (!metric) return 0;
    return metric.totalCustomers > 0 ? (metric.returningCustomers / metric.totalCustomers) * 100 : 0;
  });

  totalProductsLabel = computed(() => {
    const metric = this.analytics()?.products;
    if (!metric) return '';
    const total = metric.totalProducts;
    const active = metric.activeProducts;
    const draft = metric.draftProducts;
    return `${active} active, ${draft} draft`;
  });

  returningCustomersLabel = computed(() => {
    const metric = this.analytics()?.customers;
    if (!metric) return '';
    return `${metric.returningCustomers} out of ${metric.totalCustomers}`;
  });

  // Chart Data
  revenueChart = computed(() => this.analytics()?.revenueChart);
  orderStatusChart = computed(() => this.analytics()?.orderStatusChart);

  // List Data
  recentOrders = computed(() => this.analytics()?.recentOrders);
  newCustomers = computed(() => this.analytics()?.newCustomers);
  businessInsights = computed(() => this.analytics()?.insights);

  ngOnInit(): void {
    this.dashboardDataService.refreshFromStores();
  }
}
