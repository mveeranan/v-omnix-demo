import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ReturnStatus } from '@shared/models/backend-enums';
import { Return, CreateReturnRequest } from '../models/return.model';
import { ReturnApiService } from './return-api.service';

@Injectable({ providedIn: 'root' })
export class ReturnAdminService {
  private readonly api = inject(ReturnApiService);

  list(page: number = 1, pageSize: number = 20): Observable<{ items: Return[]; total: number }> {
    return this.api.list(page, pageSize);
  }

  getById(id: string): Observable<Return> {
    return this.api.get(id);
  }

  create(input: CreateReturnRequest): Observable<Return> {
    return this.api.create(input);
  }

  approve(id: string, adminNotes?: string): Observable<Return> {
    return this.api.approve(id, adminNotes);
  }

  reject(id: string, adminNotes?: string): Observable<Return> {
    return this.api.reject(id, adminNotes);
  }

  markAsShipped(id: string): Observable<Return> {
    return this.api.markAsShipped(id);
  }

  markAsReceived(id: string): Observable<Return> {
    return this.api.markAsReceived(id);
  }

  complete(id: string, adminNotes?: string): Observable<Return> {
    return this.api.complete(id, adminNotes);
  }

  updateStatus(id: string, status: ReturnStatus): Observable<Return> {
    return this.api.approve(id);
  }

  update(id: string, patch: { status: ReturnStatus; adminNotes?: string }): Observable<Return> {
    const notes = patch.adminNotes || undefined;
    switch (patch.status) {
      case 'Approved':  return this.api.approve(id, notes);
      case 'Rejected':  return this.api.reject(id, notes);
      case 'Shipped':   return this.api.markAsShipped(id);
      case 'Received':  return this.api.markAsReceived(id);
      case 'Completed': return this.api.complete(id, notes);
      default:          return this.api.approve(id);
    }
  }

  delete(id: string): Observable<void> {
    throw new Error('Delete not supported for returns');
  }
}
