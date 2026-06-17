import { Injectable } from '@angular/core';
import {
  BusinessProfileExtension,
  createEmptyBusinessProfileExtension
} from '../models/business-profile-extension.model';

const STORAGE_KEY = 'work-orbit.business-profile.ext';

@Injectable({ providedIn: 'root' })
export class BusinessProfileExtensionService {
  load(tenantId: string): BusinessProfileExtension {
    if (!tenantId) return createEmptyBusinessProfileExtension();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createEmptyBusinessProfileExtension();
      const map = JSON.parse(raw) as Record<string, BusinessProfileExtension>;
      return { ...createEmptyBusinessProfileExtension(), ...map[tenantId] };
    } catch {
      return createEmptyBusinessProfileExtension();
    }
  }

  save(tenantId: string, ext: BusinessProfileExtension): void {
    if (!tenantId) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const map: Record<string, BusinessProfileExtension> = raw ? JSON.parse(raw) : {};
      map[tenantId] = ext;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch {
      /* ignore quota errors */
    }
  }
}
