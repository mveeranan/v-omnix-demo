import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    @if (totalPages() > 1) {
      <nav class="flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
        <button
          type="button"
          class="admin-action-secondary rounded-lg px-3 py-1.5 text-sm"
          [disabled]="page() <= 1"
          (click)="pageChange.emit(page() - 1)"
        >
          Previous
        </button>
        @for (p of visiblePages(); track p) {
          @if (p === -1) {
            <span class="px-1 text-sm text-[var(--text-muted)]">…</span>
          } @else {
            <button
              type="button"
              class="rounded-lg px-3 py-1.5 text-sm"
              [class.admin-action-primary]="p === page()"
              [class.admin-action-secondary]="p !== page()"
              (click)="pageChange.emit(p)"
            >
              {{ p }}
            </button>
          }
        }
        <button
          type="button"
          class="admin-action-secondary rounded-lg px-3 py-1.5 text-sm"
          [disabled]="page() >= totalPages()"
          (click)="pageChange.emit(page() + 1)"
        >
          Next
        </button>
        @if (showGoto()) {
          <label class="ml-2 flex items-center gap-1 text-sm">
            <span class="text-[var(--text-muted)]">Go to</span>
            <input
              type="number"
              class="pf-editor-input w-14 px-2 py-1 text-center"
              [value]="page()"
              min="1"
              [max]="totalPages()"
              (change)="onGoto($event)"
            />
          </label>
        }
      </nav>
    }
  `
})
export class PaginationComponent {
  readonly total = input.required<number>();
  readonly pageSize = input(12);
  readonly page = input(1);
  readonly showGoto = input(false);
  readonly pageChange = output<number>();

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));

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
