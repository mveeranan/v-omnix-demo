import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { brandStore } from './brand.store';
import { BrandDto, createEmptyBrand } from '../models/brand.model';

@Injectable({ providedIn: 'root' })
export class BrandAdminService {
  list(): Observable<BrandDto[]> {
    return of(brandStore.getAll()).pipe(delay(150));
  }

  getById(id: string): Observable<BrandDto | null> {
    return of(brandStore.getById(id) ?? null).pipe(delay(100));
  }

  create(input: Omit<BrandDto, 'id'>): Observable<BrandDto> {
    return of(brandStore.create(input)).pipe(delay(200));
  }

  update(id: string, patch: Partial<BrandDto>): Observable<BrandDto> {
    const updated = brandStore.update(id, patch);
    if (!updated) return throwError(() => new Error('NOT_FOUND'));
    return of(updated).pipe(delay(200));
  }

  delete(id: string): Observable<void> {
    brandStore.delete(id);
    return of(undefined).pipe(delay(200));
  }

  createEmpty(tenantId = 'default'): Omit<BrandDto, 'id'> {
    return createEmptyBrand(tenantId);
  }
}
