import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { taxRuleStore } from './tax-rule.store';
import { TaxRule, createEmptyTaxRule } from '../models/tax-rule.model';

@Injectable({ providedIn: 'root' })
export class TaxRuleAdminService {
  list(): Observable<TaxRule[]> {
    return of(taxRuleStore.getAll()).pipe(delay(150));
  }

  getById(id: string): Observable<TaxRule | null> {
    return of(taxRuleStore.getById(id) ?? null).pipe(delay(100));
  }

  create(input: Omit<TaxRule, 'id'>): Observable<TaxRule> {
    return of(taxRuleStore.create(input)).pipe(delay(200));
  }

  update(id: string, patch: Partial<TaxRule>): Observable<TaxRule> {
    const updated = taxRuleStore.update(id, patch);
    if (!updated) return throwError(() => new Error('NOT_FOUND'));
    return of(updated).pipe(delay(200));
  }

  delete(id: string): Observable<void> {
    taxRuleStore.delete(id);
    return of(undefined).pipe(delay(200));
  }

  createEmpty(tenantId = 'default'): Omit<TaxRule, 'id'> {
    return createEmptyTaxRule(tenantId);
  }
}
