import { Component, computed, input, output } from '@angular/core';
import { LucideAngularModule, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-angular';

@Component({
  selector: 'app-admin-data-table-pagination',
  standalone: true,
  styleUrl: './admin-data-table-pagination.component.scss',
  imports: [LucideAngularModule],
  template: `
    @if (total() > 0) {
      <nav class="admin-data-table-pagination" aria-label="Pagination">
        <p class="admin-data-table-pagination__summary">{{ rangeLabel() }}</p>

        <div class="admin-data-table-pagination__controls">
          <button type="button" class="admin-data-table-page-btn" [disabled]="page() <= 1" (click)="pageChange.emit(1)" aria-label="First page">
            <lucide-icon [img]="firstIcon" [size]="16" [strokeWidth]="2" />
          </button>
          <button type="button" class="admin-data-table-page-btn" [disabled]="page() <= 1" (click)="pageChange.emit(page() - 1)" aria-label="Previous page">
            <lucide-icon [img]="prevIcon" [size]="16" [strokeWidth]="2" />
          </button>

          @for (p of visiblePages(); track p) {
            @if (p === -1) {
              <span class="px-1 text-sm text-[var(--text-muted)]">…</span>
            } @else {
              <button
                type="button"
                class="admin-data-table-page-btn"
                [class.admin-data-table-page-btn--active]="p === page()"
                (click)="pageChange.emit(p)"
              >
                {{ p }}
              </button>
            }
          }

          <button type="button" class="admin-data-table-page-btn" [disabled]="page() >= totalPages()" (click)="pageChange.emit(page() + 1)" aria-label="Next page">
            <lucide-icon [img]="nextIcon" [size]="16" [strokeWidth]="2" />
          </button>
          <button type="button" class="admin-data-table-page-btn" [disabled]="page() >= totalPages()" (click)="pageChange.emit(totalPages())" aria-label="Last page">
            <lucide-icon [img]="lastIcon" [size]="16" [strokeWidth]="2" />
          </button>
        </div>

        <label class="admin-data-table-pagination__goto">
          <span>Go to page</span>
          <input
            type="number"
            [value]="page()"
            min="1"
            [max]="totalPages()"
            (change)="onGoto($event)"
          />
        </label>
      </nav>
    }
  `
})
export class AdminDataTablePaginationComponent {
  readonly total = input.required<number>();
  readonly pageSize = input(25);
  readonly page = input(1);
  readonly itemLabel = input('items');
  readonly pageChange = output<number>();

  readonly firstIcon = ChevronsLeft;
  readonly prevIcon = ChevronLeft;
  readonly nextIcon = ChevronRight;
  readonly lastIcon = ChevronsRight;

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));

  readonly rangeStart = computed(() => {
    if (!this.total()) return 0;
    return (this.page() - 1) * this.pageSize() + 1;
  });

  readonly rangeEnd = computed(() => Math.min(this.page() * this.pageSize(), this.total()));

  readonly rangeLabel = computed(
    () => `Showing ${this.rangeStart()} to ${this.rangeEnd()} of ${this.total()} ${this.itemLabel()}`
  );

  readonly visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.page();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: number[] = [1];
    if (current > 3) pages.push(-1);
    for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
      pages.push(p);
    }
    if (current < total - 2) pages.push(-1);
    pages.push(total);
    return pages;
  });

  onGoto(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    if (value >= 1 && value <= this.totalPages()) {
      this.pageChange.emit(value);
    }
  }
}
