import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <header class="admin-page__header">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="min-w-0">
          @if (eyebrow()) {
            <p class="admin-page__eyebrow m-0">{{ eyebrow() }}</p>
          }
          <h1 class="admin-page__title m-0 mt-1">{{ title() }}</h1>
          @if (description()) {
            <p class="admin-page__description m-0 mt-2">{{ description() }}</p>
          }
        </div>
        <div class="flex shrink-0 flex-wrap items-center gap-2">
          <ng-content select="[page-actions]" />
        </div>
      </div>
    </header>
  `
})
export class AppPageHeaderComponent {
  readonly eyebrow = input<string | undefined>();
  readonly title = input.required<string>();
  readonly description = input<string | undefined>();
}
