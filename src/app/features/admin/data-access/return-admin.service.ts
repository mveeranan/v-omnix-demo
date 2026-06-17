import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { ReturnStatus } from '../../../shared/models/backend-enums';
import { returnStore } from './return.store';
import { ReturnDto } from '../models/return.model';

@Injectable({ providedIn: 'root' })
export class ReturnAdminService {
  list(): Observable<ReturnDto[]> {
    return of(returnStore.getAll()).pipe(delay(150));
  }

  getById(id: string): Observable<ReturnDto | null> {
    return of(returnStore.getById(id) ?? null).pipe(delay(100));
  }

  create(input: Omit<ReturnDto, 'id' | 'createdAt' | 'updatedAt'>): Observable<ReturnDto> {
    return of(returnStore.create(input)).pipe(delay(200));
  }

  update(id: string, patch: Partial<ReturnDto>): Observable<ReturnDto> {
    const updated = returnStore.update(id, patch);
    if (!updated) return throwError(() => new Error('NOT_FOUND'));
    return of(updated).pipe(delay(200));
  }

  updateStatus(id: string, status: ReturnStatus): Observable<ReturnDto> {
    const updated = returnStore.update(id, { status });
    if (!updated) return throwError(() => new Error('NOT_FOUND'));
    return of(updated).pipe(delay(200));
  }

  delete(id: string): Observable<void> {
    returnStore.delete(id);
    return of(undefined).pipe(delay(200));
  }
}
