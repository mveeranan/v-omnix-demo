export interface TaxRule {
  id: string;
  tenantId: string;
  name: string;
  country: string;
  region?: string;
  rate: number;
  taxType: 'GST' | 'VAT' | 'Sales Tax';
  isActive: boolean;
  applyToShipping: boolean;
}

export function createEmptyTaxRule(tenantId = 'default'): Omit<TaxRule, 'id'> {
  return {
    tenantId,
    name: '',
    country: '',
    region: '',
    rate: 0,
    taxType: 'GST',
    isActive: true,
    applyToShipping: false
  };
}
