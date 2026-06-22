import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import { BrandApiService } from '@features/catalog/data-access/brand-api.service';
import {
  BrandDto,
  SaveBrandRequest,
  createEmptyBrand
} from '@features/catalog/models/brand.model';
import { requireTenantId } from '@features/catalog/data-access/catalog-api.util';

@Injectable({ providedIn: 'root' })
export class BrandAdminService {
  private readonly api = inject(BrandApiService);
  private readonly auth = inject(AuthService);

  list(): Observable<BrandDto[]> {
    return this.api.list();
  }

  getById(id: string): Observable<BrandDto | null> {
    return new Observable((subscriber) => {
      this.api.list().subscribe({
        next: (items) => {
          subscriber.next(items.find((b) => b.id === id) ?? null);
          subscriber.complete();
        },
        error: (err) => subscriber.error(err)
      });
    });
  }

  create(input: SaveBrandRequest): Observable<BrandDto> {
    return this.api.create(input);
  }

  update(id: string, patch: SaveBrandRequest): Observable<BrandDto> {
    return this.api.update(id, patch);
  }

  delete(id: string): Observable<void> {
    return this.api.delete(id);
  }

  createEmpty(): SaveBrandRequest {
    return createEmptyBrand(requireTenantId(this.auth));
  }
}
