import { Injectable } from '@angular/core';

const PREFIX = 'vomnix_demo_';

/**
 * Generic LocalStorage-backed "fake database" used only when environment.demoMode is true.
 * Each named collection is seeded once (from whatever the caller passes as `seed`) and then
 * persists across reloads. This is the only place that touches LocalStorage for demo data —
 * every domain handler in `src/core/demo/handlers/*` goes through here, so resetting/clearing
 * demo state is a single well-known operation.
 */
@Injectable({ providedIn: 'root' })
export class DemoDbService {
  private readonly cache = new Map<string, unknown>();

  /** Returns the collection (array), seeding it from `seed` on first access. */
  getAll<T>(collection: string, seed: readonly T[]): T[] {
    const cached = this.cache.get(collection);
    if (cached) return cached as T[];

    const raw = localStorage.getItem(PREFIX + collection);
    const data = raw ? (JSON.parse(raw) as T[]) : this.seedAndPersist(collection, seed);
    this.cache.set(collection, data);
    return data;
  }

  saveAll<T>(collection: string, items: T[]): void {
    this.cache.set(collection, items);
    localStorage.setItem(PREFIX + collection, JSON.stringify(items));
  }

  /** For singleton records (current tenant, business profile, ecommerce config, etc.). */
  getObject<T>(key: string, seed: T): T {
    const cached = this.cache.get(key);
    if (cached) return cached as T;

    const raw = localStorage.getItem(PREFIX + key);
    const data = raw ? (JSON.parse(raw) as T) : this.seedObjectAndPersist(key, seed);
    this.cache.set(key, data);
    return data;
  }

  saveObject<T>(key: string, value: T): void {
    this.cache.set(key, value);
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  }

  newId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `demo-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  /** Wipes every demo collection and re-seeds on next access. Used by the "Reset demo data" action. */
  resetAll(): void {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
    this.cache.clear();
  }

  private seedAndPersist<T>(collection: string, seed: readonly T[]): T[] {
    const copy = JSON.parse(JSON.stringify(seed)) as T[];
    localStorage.setItem(PREFIX + collection, JSON.stringify(copy));
    return copy;
  }

  private seedObjectAndPersist<T>(key: string, seed: T): T {
    const copy = JSON.parse(JSON.stringify(seed)) as T;
    localStorage.setItem(PREFIX + key, JSON.stringify(copy));
    return copy;
  }
}
