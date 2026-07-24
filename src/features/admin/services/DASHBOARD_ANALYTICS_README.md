# Phase 1: Premium SaaS Dashboard Analytics Service

## Overview

This document describes the Phase 1 implementation of the premium SaaS dashboard data service. The new service provides real-time business analytics and insights for small business owners.

## Architecture

### Services

#### 1. **DashboardAnalyticsService** (New)
The core analytics engine that calculates comprehensive business metrics.

**Location:** `src/features/admin/services/dashboard-analytics.service.ts`

**Responsibilities:**
- Fetch complete order and product data from APIs
- Calculate revenue metrics by period (today, week, month)
- Aggregate customer metrics and insights
- Generate top products, low stock alerts
- Create business recommendations
- Build chart data for visualizations

**Key Methods:**

```typescript
loadDashboardData(): Observable<PremiumDashboardData>
// Main entry point - fetches and aggregates all dashboard data
// Returns: Complete dashboard analytics object

// Internal calculation methods:
- calculateRevenueMetrics(todayOrders, yesterdayOrders, monthOrders)
- calculateOrderMetrics(todayOrders, yesterdayOrders, allOrders)
- calculateCustomerMetrics(allOrders, monthOrders)
- calculateProductMetrics(products)
- buildRevenueChart(orders, period)
- buildOrderStatusChart(orders)
- buildPaymentMethodBreakdown(orders)
- getTopProducts(orders, limit)
- getRecentOrders(orders, limit)
- getNewCustomers(orders, limit)
- generateBusinessInsights(orders, products, monthOrders)
```

#### 2. **AdminDashboardDataService** (Enhanced)
Legacy service updated to use new analytics service while maintaining backwards compatibility.

**Location:** `src/features/admin/services/admin-dashboard-data.service.ts`

**Changes:**
- Injected `DashboardAnalyticsService`
- Added `analyticsData` signal for premium analytics data
- Updated `refreshFromStores()` to load both legacy and new analytics data
- New computed property: `premiumAnalytics` (read-only)

**Usage:**
```typescript
// Get legacy dashboard data (backwards compatible)
const data = dashboardDataService.dashboardData();

// Get new premium analytics data
const analytics = dashboardDataService.premiumAnalytics();
```

## Data Models

### PremiumDashboardData Interface
The complete dashboard analytics object containing all metrics and visualizations.

**Key Properties:**

```typescript
{
  // Metadata
  generatedAt: string;  // ISO timestamp for cache invalidation

  // Core Metrics (with growth comparison)
  revenue: RevenueMetrics;      // Revenue + growth %
  orders: OrderMetrics;          // Orders by status + growth %
  customers: CustomerMetrics;    // Customer counts + growth %
  products: ProductMetrics;      // Product inventory status

  // Period Comparisons
  revenueComparison: {
    today: PeriodComparison;
    week: PeriodComparison;
    month: PeriodComparison;
  };

  // Chart Data
  revenueChart: RevenueChart;        // Line chart data (7d/30d/90d)
  orderStatusChart: OrderStatusChart; // Status distribution
  paymentMethodBreakdown: [];         // Payment method breakdown

  // Business Data
  topProducts: TopProduct[];          // Top 5 selling products
  lowStockProducts: LowStockProduct[]; // Inventory alerts
  recentOrders: RecentOrderItem[];    // Last 5 orders
  newCustomers: NewCustomerItem[];    // Last 5 new customers

  // Insights
  insights: BusinessInsight[];        // Actionable recommendations

  // Tenant Info
  tenantName: string;
  planName: string;
  subscriptionRenewalDays?: number;
  websitePublished: boolean;
  profileCompletionPercent: number;
}
```

## Calculated Metrics

### Revenue Metrics
- **Current**: Today's revenue (paid orders only)
- **Previous**: Yesterday's revenue for comparison
- **Growth**: Percentage change vs yesterday
- **Average Order Value**: Mean order amount today
- **Order Count**: Number of orders today
- **Pending Payments**: Revenue from orders with pending payment status

### Order Metrics
- **Status Breakdown**: Count by order status (pending, confirmed, processing, shipped, delivered, cancelled)
- **Payment Status**: Count by payment status (paid, pending, failed, refunded)
- **Growth Comparison**: Today vs yesterday order count

### Customer Metrics
- **Total Customers**: All-time unique customers
- **New This Month**: Customers with first order this month
- **Returning Customers**: Customers with 2+ orders
- **Return Rate**: Percentage of repeat customers
- **Average Lifetime Value**: Mean revenue per customer

### Product Metrics
- **Total/Active/Draft**: Product counts by status
- **Missing Images/Descriptions**: Quality metrics
- **Low Stock**: Products below threshold

## Data Calculations

### Revenue Aggregation

Orders are filtered by `paymentStatus === 'paid'` for revenue calculations.

**Time Periods:**
- **Today**: Orders with `createdAt` date = today at midnight
- **Yesterday**: Orders from yesterday at midnight to today at midnight
- **This Week**: Last 7 days
- **This Month**: Last 30 days

Example:
```
Today's Revenue = $430 (3 paid orders: $150 + $200 + $80)
Yesterday's Revenue = $280
Growth = ((430 - 280) / 280) * 100 = 53.6%
```

### Customer Calculation

Customers are identified by unique `customerEmail`.

**Calculation:**
```
All Orders: [
  {customerEmail: "john@example.com", createdAt: "2026-07-15"},
  {customerEmail: "jane@example.com", createdAt: "2026-07-18"},
  {customerEmail: "john@example.com", createdAt: "2026-07-20"} // Repeat
]

Total Customers = 2 (unique emails)
New This Month (July) = 2
Returning Customers = 1 (john@example.com has 2 orders)
Return Rate = 50%
Avg Lifetime Value = ($150 + $200 + $300) / 2 = $325
```

### Product Performance

Products ranked by units sold across all orders.

```
Order Items: [
  {productId: "prod-1", quantity: 2},
  {productId: "prod-1", quantity: 3},
  {productId: "prod-2", quantity: 1}
]

Product 1: 5 units sold (top seller)
Product 2: 1 unit sold
```

### Business Insights Generation

Automatic recommendations based on data:

1. **Low Revenue**: If monthly revenue < $500 → "Boost Your Sales"
2. **Missing Images**: If products > 0 without images → List count
3. **Few Products**: If total products < 5 → "Expand Your Catalog"
4. **No Orders**: If total orders === 0 → "Launch Your Store"

## Usage in Components

### Example: Display Revenue Metric

```typescript
// In a component
private readonly analyticsService = inject(DashboardAnalyticsService);

revenue = this.analyticsService.data().revenue;

// In template
<div>
  <p>Today's Revenue: ${{ revenue.current | currency }}</p>
  <p>Growth: {{ revenue.growth }}% 
    {{ revenue.growthDirection === 'up' ? '↑' : revenue.growthDirection === 'down' ? '↓' : '→' }}
  </p>
</div>
```

### Example: Use Analytics in Signals

```typescript
// Get read-only signal
analytics$ = this.dashboardDataService.premiumAnalytics;

// Subscribe to changes
this.dashboardDataService.data().subscribe(...);
```

## Caching & Performance

### Current Implementation
- Data loaded on-demand via `loadDashboardData()`
- No built-in caching (can be added in Phase 2)
- Full order history fetched for analytics (max 1000 orders)

### Future Optimizations
1. Backend-calculated aggregates (daily revenue summaries)
2. Indexed database queries for faster filtering
3. Client-side caching with expiration
4. Incremental updates for real-time dashboards
5. Background refresh every 5 minutes

## Testing Strategy

### Unit Tests Needed
- Revenue calculation accuracy
- Customer deduplication logic
- Growth percentage calculations
- Chart data aggregation
- Insight generation logic
- Date filtering logic

### Example Test
```typescript
it('should calculate revenue growth correctly', () => {
  const todayOrders = [{total: 100}, {total: 200}];
  const yesterdayOrders = [{total: 150}];

  const metrics = service.calculateRevenueMetrics(
    todayOrders, yesterdayOrders, []
  );

  expect(metrics.current).toBe(300);
  expect(metrics.previous).toBe(150);
  expect(metrics.growth).toBe(100); // 100% growth
  expect(metrics.growthDirection).toBe('up');
});
```

## Limitations & TODOs

### Currently Available ✅
- Order data with dates and amounts
- Product inventory and status
- Customer email deduplication
- Revenue aggregation by period
- Order status breakdown
- Payment method distribution
- Top products ranking
- Recent orders/customers lists

### Not Yet Implemented ⚠️
- Page views / store traffic
- Conversion rates
- Booking data (if applicable)
- Customer retention cohorts
- Refund/return rates
- Email campaign metrics
- Inventory low-stock threshold calculations (needs inventory service)

### Future Enhancements
1. **Real-time Updates**: WebSocket for live order notifications
2. **Custom Date Ranges**: User-selected date pickers
3. **Export**: CSV/PDF exports of analytics
4. **Trends**: Weekly/monthly trend visualization
5. **Forecasting**: Predictive analytics
6. **Alerts**: Email notifications for key metrics
7. **Comparison**: Year-over-year, month-over-month comparisons

## Migration Path

### Phase 1 (Current)
✅ New analytics service and models
✅ Data calculation and aggregation
✅ Integration with existing data service

### Phase 2 (UI Components)
- Build metric card components
- Create chart components
- Build recent items lists
- Build insights display
- Add period selector

### Phase 3 (Polish)
- Loading skeletons
- Empty states
- Responsive design
- Dark/light mode audit
- Animations

### Phase 4 (Launch)
- Performance testing
- Accessibility audit
- Browser compatibility
- Production deployment

## Files

```
src/features/admin/
├── models/
│   ├── dashboard-analytics.model.ts   (NEW - analytics data models)
│   ├── dashboard-view.model.ts        (legacy - keep for backwards compatibility)
│   └── dashboard-stats.model.ts       (legacy)
├── services/
│   ├── dashboard-analytics.service.ts (NEW - core analytics engine)
│   ├── admin-dashboard-data.service.ts (UPDATED - backwards compatible wrapper)
│   └── DASHBOARD_ANALYTICS_README.md   (this file)
└── dashboard/
    └── admin-dashboard.component.ts   (uses AdminDashboardDataService)
```

## API Contracts

### OrderService.list()
```typescript
list(filters: OrderListFilters): Observable<OrderListResult>
// Returns: items[], total, page, pageSize, revenueThisMonth, ordersThisMonth
```

### ProductAdminService.list()
```typescript
list(filters: ProductListFilters): Observable<ProductListResponse>
// Returns: items[], totalCount, page, pageSize
// Item fields: id, name, price, status, primaryImageUrl, etc.
```

## Next Steps

1. ✅ Create analytics service and models (DONE)
2. ⏳ Build dashboard UI components (Phase 2)
3. ⏳ Add responsive design (Phase 2)
4. ⏳ Dark/light mode verification (Phase 3)
5. ⏳ Performance optimization (Phase 3)
6. ⏳ Testing (Phase 3-4)

---

**Last Updated:** 2026-07-20
**Phase:** 1 - Data Services
**Status:** Complete ✅
