import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <article [class]="cardClasses()">
      @if (title()) {
        <header class="app-card__header">
          <h2 class="m-0 text-sm font-semibold text-[var(--text-primary)]">{{ title() }}</h2>
        </header>
      }
      <div class="app-card__body"><ng-content /></div>
    </article>
  `
})
export class AppCardComponent {
  readonly title = input<string | undefined>();
  readonly legacyClass = input<string | undefined>();

  cardClasses(): string {
    const parts = ['app-card'];
    const legacy = this.legacyClass();
    if (legacy) parts.push(legacy);
    return parts.join(' ');
  }
}
