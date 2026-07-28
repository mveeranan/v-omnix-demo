import { HttpResponse } from '@angular/common/http';
import { DemoDbService } from '../demo-db.service';
import { BUSINESS_PROFILE_COLLECTION, collectionForTenant, DemoRequestContext, fail, ok } from '../generic-crud';
import { SubscriptionStatus } from '@shared/models/enums/subscription-status.enum';
import { findCustomerByEmailAcrossTenants } from './customers.handler';
import usersSeed from '@mock-data/users.json';
import plansSeed from '@mock-data/plans.json';

export interface DemoUserRecord {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  mobile: string;
  tenantId: string;
  tenantName: string;
  businessLogoUrl: string | null;
  roleName: string;
  planName: string;
  multiBranch: boolean;
  lastPlanId: string;
  subscriptionStatus: SubscriptionStatus;
  profileImageUrl: string | null;
}

const COLLECTION = 'users';

function toLoginData(user: DemoUserRecord) {
  return {
    token: `demo-token-${user.id}-${Date.now()}`,
    refreshToken: `demo-refresh-${user.id}`,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
    userId: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    mobile: user.mobile,
    email: user.email,
    profileImageDocumentId: null,
    profileImageUrl: user.profileImageUrl,
    tenantId: user.tenantId,
    tenantName: user.tenantName,
    businessLogoUrl: user.businessLogoUrl,
    roleName: user.roleName,
    planName: user.planName,
    multiBranch: user.multiBranch,
    lastPlanId: user.lastPlanId,
    subscriptionStatus: user.subscriptionStatus
  };
}

export function handleAuth(db: DemoDbService, ctx: DemoRequestContext): HttpResponse<unknown> | null {
  const users = () => db.getAll<DemoUserRecord>(COLLECTION, usersSeed as DemoUserRecord[]);

  if (ctx.method === 'POST' && ctx.path === '/Auth/login') {
    const body = (ctx.body ?? {}) as { email?: string; password?: string };
    const email = (body.email ?? '').trim().toLowerCase();
    const user = users().find((u) => u.email.toLowerCase() === email);

    if (user) {
      if (user.password !== body.password) {
        return fail('Invalid email or password. Demo login: demo@vomnix.com / demo1234', 401);
      }
      return ok(toLoginData(user), 'Login successful');
    }

    // Not a tenant admin — check whether this is a storefront customer (created at checkout).
    // The real /Auth/login endpoint is shared between admins and customers, and the customer
    // login request carries no tenant context, so we search every tenant's customer collection.
    const customer = findCustomerByEmailAcrossTenants(email);
    if (customer && customer.password && customer.password === body.password) {
      const [firstName, ...rest] = customer.name.split(' ');
      return ok({
        token: `demo-customer-token-${customer.id}-${Date.now()}`,
        refreshToken: `demo-customer-refresh-${customer.id}`,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
        userId: customer.id,
        firstName: firstName ?? customer.name,
        lastName: rest.join(' '),
        mobile: customer.phone,
        email: customer.email,
        profileImageDocumentId: null,
        profileImageUrl: null
      }, 'Login successful');
    }

    return fail('Invalid email or password. Demo login: demo@vomnix.com / demo1234', 401);
  }

  if (ctx.method === 'POST' && ctx.path === '/Auth/refresh') {
    // Demo tokens never really expire; just hand back a freshly "rotated" one.
    return ok({ token: `demo-token-refreshed-${Date.now()}` }, 'Token refreshed');
  }

  if (ctx.method === 'POST' && ctx.path === '/Auth/register-admin') {
    const body = (ctx.body ?? {}) as Record<string, unknown>;
    const email = String(body['email'] ?? '').trim().toLowerCase();
    const list = users();

    if (list.some((u) => u.email.toLowerCase() === email)) {
      return fail('An account with this email already exists.', 409);
    }

    const tenantId = db.newId();
    const lastPlanId = String(body['lastPlanId'] ?? body['planId'] ?? '');
    const plans = plansSeed as Array<{ planId: string; name: string }>;
    const matchedPlan = plans.find((p) => p.planId === lastPlanId);
    const newUser: DemoUserRecord = {
      id: db.newId(),
      email,
      password: String(body['password'] ?? ''),
      firstName: String(body['firstName'] ?? ''),
      lastName: String(body['lastName'] ?? ''),
      mobile: String(body['mobileNumber'] ?? ''),
      tenantId,
      tenantName: String(body['businessName'] ?? 'My Store'),
      businessLogoUrl: null,
      roleName: 'Admin',
      planName: matchedPlan?.name ?? String(body['planName'] ?? 'Starter'),
      multiBranch: false,
      lastPlanId,
      // Mirrors the real flow: the account exists but billing isn't active until the
      // (mock) Stripe checkout confirms — see demo-checkout-page.component.ts.
      subscriptionStatus: 'Pending',
      profileImageUrl: null
    };

    list.push(newUser);
    db.saveAll(COLLECTION, list);

    // Seed a matching business profile immediately from what was captured at signup, so the new
    // tenant's admin Profile page shows real data right away instead of "Could not load business
    // profile" (that check fails on a genuinely null/empty profile, which an untouched new tenant
    // would otherwise have until they separately visited and saved the Profile page).
    db.saveObject(collectionForTenant(BUSINESS_PROFILE_COLLECTION, tenantId), {
      tenantId,
      businessName: newUser.tenantName,
      businessTypeId: String(body['businessTypeId'] ?? ''),
      email, phone: newUser.mobile,
      tagline: null, description: (body['description'] as string) ?? null,
      registrationNumber: null, taxId: null,
      street: null, city: null, state: null, zipCode: null, countryIsoCode: null, countryName: null,
      logoDocumentId: null, logoDocumentUrl: null, coverImageDocumentId: null, coverImageDocumentUrl: null,
      websiteUrl: null, presetId: null
    });

    return ok({ tenantId, lastPlanId: newUser.lastPlanId }, 'Account created successfully.');
  }

  return null;
}

/** Used by the mock checkout page to activate a tenant's subscription after "payment". */
export function activateTenantSubscription(db: DemoDbService, tenantId: string): DemoUserRecord | null {
  const list = db.getAll<DemoUserRecord>(COLLECTION, usersSeed as DemoUserRecord[]);
  const idx = list.findIndex((u) => u.tenantId === tenantId);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], subscriptionStatus: 'Active' };
  db.saveAll(COLLECTION, list);
  return list[idx];
}

export function findUserByTenant(db: DemoDbService, tenantId: string): DemoUserRecord | null {
  const list = db.getAll<DemoUserRecord>(COLLECTION, usersSeed as DemoUserRecord[]);
  return list.find((u) => u.tenantId === tenantId) ?? null;
}

export { toLoginData };
