import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
  <div
    class="flex items-center justify-center"
    [class.min-h-[200px]]="variant() === 'full'"
    [class.py-8]="variant() === 'inline'"
    role="status"
    aria-label="Loading"
  >
    <div
      class="animate-spin rounded-full border-2 border-[var(--border-subtle)] border-t-[var(--accent)]"
      [class.h-10]="size() === 'lg'"
      [class.w-10]="size() === 'lg'"
      [class.h-6]="size() === 'sm'"
      [class.w-6]="size() === 'sm'"
    ></div>
    @if (label()) {
      <span class="ml-3 text-sm text-[var(--text-muted)]">{{ label() }}</span>
    }
  </div>
  `
})
export class LoadingSpinnerComponent {
  readonly variant = input<'full' | 'inline' | 'centered'>('inline');
  readonly size = input<'sm' | 'lg'>('lg');
  readonly label = input('');
}
