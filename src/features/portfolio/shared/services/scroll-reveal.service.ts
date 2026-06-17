import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/** Re-triggers in-view checks for scroll-reveal elements (e.g. after preview modal opens). */
@Injectable({ providedIn: 'root' })
export class ScrollRevealService {
  private readonly refreshSubject = new Subject<void>();
  readonly refresh$ = this.refreshSubject.asObservable();

  refresh(): void {
    this.refreshSubject.next();
  }
}
