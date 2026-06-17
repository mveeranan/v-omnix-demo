import { TaxRule } from '../models/tax-rule.model';

const STORAGE_KEY = 'work-orbit.admin.tax-rules';

const SEED: TaxRule[] = [
  {
    id: 'tax-gst-1',
    tenantId: 'default',
    name: 'GST (India)',
    country: 'IN',
    region: 'All regions',
    rate: 18,
    taxType: 'GST',
    isActive: true,
    applyToShipping: false
  }
];

class TaxRuleStore {
  private rules: TaxRule[] = this.load();

  getAll(): TaxRule[] {
    return [...this.rules].sort((a, b) => a.name.localeCompare(b.name));
  }

  getById(id: string): TaxRule | undefined {
    return this.rules.find((r) => r.id === id);
  }

  create(input: Omit<TaxRule, 'id'>): TaxRule {
    const item: TaxRule = {
      ...input,
      id: `tax-${crypto.randomUUID().slice(0, 8)}`
    };
    this.rules.push(item);
    this.persist();
    return item;
  }

  update(id: string, patch: Partial<TaxRule>): TaxRule | null {
    const idx = this.rules.findIndex((r) => r.id === id);
    if (idx < 0) return null;
    this.rules[idx] = { ...this.rules[idx], ...patch };
    this.persist();
    return this.rules[idx];
  }

  delete(id: string): boolean {
    const before = this.rules.length;
    this.rules = this.rules.filter((r) => r.id !== id);
    if (this.rules.length < before) {
      this.persist();
      return true;
    }
    return false;
  }

  replaceAll(items: TaxRule[]): void {
    this.rules = structuredClone(items);
    this.persist();
  }

  private load(): TaxRule[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(SEED);
      const parsed = JSON.parse(raw) as TaxRule[];
      return parsed.length ? parsed : structuredClone(SEED);
    } catch {
      return structuredClone(SEED);
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.rules));
    } catch {
      /* ignore */
    }
  }
}

export const taxRuleStore = new TaxRuleStore();
