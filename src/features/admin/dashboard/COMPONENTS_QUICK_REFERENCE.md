# Premium Dashboard Components - Quick Reference Guide

## Component Directory Structure

```
src/features/admin/dashboard/
├── components/
│   ├── metric-card.component.ts          ← Reusable metric display card
│   ├── metric-card.component.scss
│   ├── dashboard-header.component.ts     ← Welcome & quick actions header
│   ├── dashboard-header.component.scss
│   ├── premium-dashboard.component.ts    ← Main dashboard layout
│   ├── premium-dashboard.component.scss
│   └── PHASE_2_PART1_STATUS.md          ← Detailed status report
├── COMPONENTS_QUICK_REFERENCE.md        ← This file
└── (Future) Chart & List components here
```

---

## Component Quick Reference

### 1. MetricCardComponent

**Purpose:** Display a single business metric with growth indicator

**Selector:** `<app-metric-card>`

**Usage:**
```typescript
<app-metric-card
  label="Today's Revenue"
  [value]="430"
  [comparison]="53.6"
  [footer]="'vs. yesterday'"
  [loading]="false"
  [showComparison]="true"
  format="currency">
</app-metric-card>
```

**@Input Properties:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `label` | string | '' | Metric label/title |
| `value` | number | 0 | Primary value to display |
| `comparison` | number \| null | null | Growth % (-100 to +999) |
| `footer` | string \| null | null | Context text below value |
| `icon` | string \| null | null | Icon HTML string |
| `loading` | boolean | false | Show skeleton state |
| `showComparison` | boolean | true | Display growth badge |
| `format` | 'currency' \| 'percent' \| 'number' | 'number' | Value format |

**Format Examples:**
- `format="currency"` → `$43,250`
- `format="percent"` → `87%`
- `format="number"` → `1,234`

**CSS Classes for Styling:**
```scss
.metric-card              // Container
.metric-card--loading     // Applied when loading=true
.metric-card__header      // Label + icon row
.metric-card__label       // Metric label text
.metric-card__icon        // Icon badge (2rem)
.metric-card__value       // Main metric number
.metric-card__comparison  // Growth badge
.metric-card__comparison--positive  // Green for growth
.metric-card__comparison--negative  // Red for decline
.metric-card__footer      // Context text
.skeleton                 // Skeleton placeholder
```

**Dependencies:**
- CommonModule
- LucideAngularModule (TrendingUp, TrendingDown icons)

**Performance:**
- ✅ OnPush change detection ready
- ✅ Pure presentation component (no side effects)
- ✅ Minimal re-renders

---

### 2. DashboardHeaderComponent

**Purpose:** Welcome section with greeting, date, and quick action buttons

**Selector:** `<app-dashboard-header>`

**Usage:**
```typescript
<app-dashboard-header
  [businessName]="'Acme Corp'"
  [planName]="'Pro'"
  [renewalDays]="14">
</app-dashboard-header>
```

**@Input Properties:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `businessName` | string \| null | null | Business/tenant name |
| `planName` | string | 'Free' | Current subscription plan |
| `renewalDays` | number \| null | null | Days until renewal |

**Computed Values:**

| Property | Type | Updates | Description |
|----------|------|---------|-------------|
| `greeting` | string | On component init | Time-based greeting |
| `dateLabel` | string | On component init | Formatted date |

**Features:**
- ✅ Time-aware greeting (Good morning/afternoon/evening)
- ✅ Current date display (e.g., "Monday, Jul 20")
- ✅ Two quick action buttons
  - Add Product (primary style, href="/admin/products/new")
  - Customize Website (secondary style, href="/admin/website")
- ✅ Subscription status badge with renewal countdown

**CSS Classes:**
```scss
.dashboard-header           // Main header container
.dashboard-header__welcome  // Greeting section
.dashboard-header__title    // Main greeting text
.dashboard-header__subtitle // Date subtitle
.dashboard-header__actions  // Actions container
.dashboard-header__quick-actions     // Button group
.dashboard-header__action-btn        // Base button style
.dashboard-header__action-btn--primary      // Primary action
.dashboard-header__action-btn--secondary    // Secondary action
.dashboard-header__status   // Plan badge section
.dashboard-header__plan-badge       // Plan name
.dashboard-header__renewal-text     // Renewal info
```

**Dependencies:**
- CommonModule
- RouterLink
- LucideAngularModule (Plus, ArrowRight icons)

**Responsive Behavior:**
- Desktop: Flex row (welcome on left, actions on right)
- Tablet/Mobile: Flex column (welcome above, actions below)

---

### 3. PremiumDashboardComponent

**Purpose:** Main dashboard layout orchestrating all metrics and sections

**Selector:** `<app-premium-dashboard>`

**Usage:**
```typescript
import { PremiumDashboardComponent } from './components/premium-dashboard.component';

@Component({
  imports: [PremiumDashboardComponent],
  template: '<app-premium-dashboard />'
})
export class AdminComponent {}
```

**Lifecycle:**
- `ngOnInit()` calls `dashboardService.refresh()`
- Component auto-loads all analytics data on init

**Displayed Metrics:**

**KPI Grid (4 columns):**
1. Today's Revenue
   - Value: Currency format
   - Comparison: vs. yesterday growth %
   - Data: `analytics()?.revenue?.current`

2. Total Orders
   - Value: Number format
   - Comparison: This month growth %
   - Data: `analytics()?.orders?.current`

3. Total Customers
   - Value: Number format
   - Comparison: New this month
   - Data: `analytics()?.customers?.current`

4. Active Products
   - Value: Number format
   - No comparison
   - Data: `analytics()?.products?.activeCount`

**Secondary Metrics Grid (4 columns):**
1. Average Order Value (Currency)
2. Pending Payments (Currency)
3. Return Customers (Percent)
4. Website Status (Published/Draft)

**Sections (Placeholders):**
- Charts: Revenue trend, Order status breakdown
- Recent Activity: Recent orders, New customers
- Insights: Business recommendations

**Computed Signals:**
```typescript
analytics              // Full dashboard data object
isLoading              // Data loading state
businessName           // From analytics.tenantName
planName               // From analytics.planName
renewalDays            // From analytics.subscriptionRenewalDays
websitePublished       // From analytics.websitePublished
revenueMetric          // Revenue metrics with growth
orderMetric            // Order metrics with growth
customerMetric         // Customer metrics with growth
productMetric          // Product metrics
averageOrderValue      // Calculated: total / order count
pendingPayments        // From analytics.revenue.pendingPayments
returnRate             // Calculated: returning / total * 100
```

**Grid Layouts:**
```scss
// KPI Grid (4-column → 2-column → 1-column)
@media (max-width: 1200px) → 2 columns
@media (max-width: 768px) → 1 column

// Secondary Grid (same breakpoints)
// Charts (2-column → 1-column)
@media (max-width: 1024px) → 1 column

// Recent Activity (2-column → 1-column)
@media (max-width: 1024px) → 1 column
```

**CSS Classes:**
```scss
.premium-dashboard          // Root container
.premium-dashboard__container // Max-width wrapper
.premium-dashboard__kpis    // 4-column KPI grid
.premium-dashboard__secondary-metrics  // Secondary grid
.premium-dashboard__charts  // Chart section
.premium-dashboard__chart-card         // Individual chart
.premium-dashboard__chart-title        // Chart heading
.premium-dashboard__recent-activity    // Recent items
.premium-dashboard__section            // Generic section
.premium-dashboard__section-title      // Section heading
.premium-dashboard__insights           // Insights section
.premium-dashboard__chart-placeholder  // Future component placeholder
```

**Dependencies:**
- CommonModule
- DashboardHeaderComponent
- MetricCardComponent
- AdminDashboardDataService (injected)

**Performance:**
- ✅ Computed signals (no manual subscriptions)
- ✅ Standalone component (no module declarations)
- ✅ Reactive state management via signals

---

## Integration Checklist

- [ ] Import `PremiumDashboardComponent` in admin routing
- [ ] Update admin dashboard route to use new component
- [ ] Verify `AdminDashboardDataService.premiumAnalytics` loads data
- [ ] Test metrics display in dev server
- [ ] Test responsive design (640px, 768px, 1024px, 1200px)
- [ ] Test dark mode (DevTools CSS override)
- [ ] Test loading state (add artificial delay in service)
- [ ] Verify metric calculations match backend expectations

---

## Common Tasks

### Display Custom Metric

```typescript
// In any component
private dashboardService = inject(AdminDashboardDataService);

customMetric = computed(() => {
  const analytics = this.dashboardService.premiumAnalytics();
  return analytics?.revenue?.averageOrderValue ?? 0;
});

// In template
<app-metric-card
  label="My Metric"
  [value]="customMetric()"
  format="currency">
</app-metric-card>
```

### Access Chart Data

```typescript
chartData = computed(() => {
  const analytics = this.dashboardService.premiumAnalytics();
  return analytics?.revenueChart ?? null;
});
```

### Handle Loading State

```typescript
isLoading = this.dashboardService.isLoading;

// In template
@if (isLoading()) {
  <p>Loading dashboard...</p>
} @else {
  <!-- Dashboard content -->
}
```

### Format Numbers Manually

```typescript
// In component
formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
}

// Or use the metric card's built-in formatting
<app-metric-card
  [value]="value"
  format="currency">
</app-metric-card>
```

---

## Responsive Design Guidelines

### Breakpoints Used

- **640px**: Mobile (phones)
- **768px**: Tablet (landscape phones, iPad mini)
- **1024px**: Small desktop (iPad Pro, small laptops)
- **1200px**: Large desktop (standard monitors)
- **1400px**: XL desktop (max content width)

### Component Adjustments by Breakpoint

| Breakpoint | Metric Card | Header | Dashboard |
|-----------|---|---|---|
| ≤ 640px | 1 column, 1.5rem font, padding-4 | Column layout | Full-width sections |
| 641-768px | 2 columns, 2rem font | Column layout | 2-column grids |
| 769-1024px | 2 columns | Row layout | Mixed grids |
| 1025-1200px | 4 columns | Row layout | Full layout |
| > 1200px | 4 columns, max 1400px | Row layout | Ideal layout |

---

## CSS Variable Dependencies

The components rely on these CSS variables being defined:

**Colors:**
- `--text-primary`, `--text-secondary`, `--text-muted`
- `--surface-0`, `--surface-1`, `--surface-2`
- `--border-subtle`, `--border-strong`
- `--accent`, `--accent-muted`, `--accent-dark`, `--accent-contrast`
- `--success`, `--danger`

**Typography:**
- `--font-size-caption`, `--font-size-body-sm`, `--font-size-body-lg`
- `--font-weight-semibold` (600), plus 700 for bold

**Spacing:**
- `--space-1` through `--space-8` (typically 4px increments)

**Borders:**
- `--radius-sm`, `--radius-md`, `--radius-lg`

**Animations:**
- `--transition-fast` (typically 150ms)

**Shadows:**
- `--shadow-sm`

These should be defined in your global SCSS or theme CSS file. The components won't display correctly without them.

---

## Testing Quick Start

### Test Basic Display
```bash
npm run dev
# Navigate to /admin/dashboard
# Should see 4 KPI cards with values
# Header should show greeting + date + buttons
```

### Test Responsive
```bash
# In DevTools → Device toolbar
# Test: Mobile (375px), Tablet (768px), Desktop (1280px)
# Verify grids reflow correctly
```

### Test Dark Mode
```bash
# In DevTools → CSS override
# Add: @media (prefers-color-scheme: dark) { ... }
# Verify readable contrast, no layout issues
```

### Test Loading State
```typescript
// In DashboardAnalyticsService, add delay:
forkJoin([
  timer(2000).pipe(switchMap(() => this.orderService.list(...))),
  // ...
]).subscribe(...)
```

---

## Next Steps (Phase 2 Part 2)

These components are ready for chart/list components:

1. **ChartComponents**
   - Revenue trend line chart
   - Order status pie chart
   - Customer growth chart

2. **ListComponents**
   - Recent orders table
   - New customers list
   - Top products list

3. **InsightsComponent**
   - Insight cards
   - Priority badges
   - Dismissable alerts

All placeholder sections in `premium-dashboard.component.ts` are ready for these implementations.

---

## Support & Documentation

- **Detailed Status:** See `PHASE_2_PART1_STATUS.md`
- **Data Models:** See `models/dashboard-analytics.model.ts`
- **Service Docs:** See `services/DASHBOARD_ANALYTICS_README.md`
- **Code Comments:** Inline comments in each component

---

**Last Updated:** 2026-07-20
**Phase:** 2 Part 1 (Complete)
**Next Phase Estimate:** 3-5 days for charts/lists + Polish

