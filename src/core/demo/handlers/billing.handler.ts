import { HttpResponse } from '@angular/common/http';
import { DemoDbService } from '../demo-db.service';
import { DemoRequestContext, fail, ok } from '../generic-crud';
import plansSeed from '@mock-data/plans.json';

interface PlanPrice {
  planPriceId: string;
  billingCycle: string;
  amount: number;
  currency: string;
  stripePriceId: string;
}
interface PlanApiDto {
  planId: string;
  name: string;
  prices: PlanPrice[];
  features: Array<{ id: string; name: string }>;
}

const PLANS_COLLECTION = 'plans';
const BUSINESS_TYPES = [
  { id: 'bt-general', name: 'General / Kirana Store' },
  { id: 'bt-clothing', name: 'Clothing & Apparel' },
  { id: 'bt-electronics', name: 'Electronics & Mobiles' },
  { id: 'bt-footwear', name: 'Footwear' },
  { id: 'bt-cosmetics', name: 'Cosmetics & Perfumes' },
  { id: 'bt-other', name: 'Other Retail' }
];

/** Plans, Stripe checkout (mocked), and the small supporting lookup lists used on registration. */
export function handleBilling(db: DemoDbService, ctx: DemoRequestContext): HttpResponse<unknown> | null {
  if (ctx.method === 'GET' && ctx.path === '/plans') {
    return ok(db.getAll<PlanApiDto>(PLANS_COLLECTION, plansSeed as PlanApiDto[]));
  }

  if (ctx.method === 'GET' && ctx.path === '/business-types') {
    return ok(BUSINESS_TYPES);
  }

  if (ctx.method === 'GET' && ctx.path === '/theme-presets') {
    // ThemePresetsService already has a rich local fallback it uses until this resolves —
    // an empty list here is enough for the storefront theme picker to work in demo mode.
    return ok([]);
  }

  if (ctx.method === 'GET' && ctx.path === '/countries') {
    return ok([
      { id: 'country-in', name: 'India', isoCode: 'IN', dialCode: '+91', flagEmoji: 'IN' }
    ]);
  }

  if (ctx.method === 'POST' && ctx.path === '/Stripe/ChcekOut') {
    const body = (ctx.body ?? {}) as { planPriceId?: string; tenantId?: string };
    const plans = db.getAll<PlanApiDto>(PLANS_COLLECTION, plansSeed as PlanApiDto[]);
    let match: { plan: PlanApiDto; price: PlanPrice } | null = null;
    for (const plan of plans) {
      const price = plan.prices.find((p) => p.planPriceId === body.planPriceId);
      if (price) { match = { plan, price }; break; }
    }
    if (!match || !body.tenantId) {
      return fail('Unable to create checkout session. Please try again.', 400);
    }

    const params = new URLSearchParams({
      tenantId: body.tenantId,
      planPriceId: match.price.planPriceId,
      planName: match.plan.name,
      amount: String(match.price.amount),
      currency: match.price.currency,
      cycle: match.price.billingCycle
    });
    // In demo mode this points back into the Angular app itself (a mock checkout screen)
    // instead of Stripe's real hosted checkout, which requires a live backend to create
    // a session (the secret key can never live in the browser).
    return ok({ checkoutUrl: `/mock-checkout?${params.toString()}` });
  }

  return null;
}
