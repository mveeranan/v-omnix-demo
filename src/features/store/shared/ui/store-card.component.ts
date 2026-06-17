import { Component, input } from '@angular/core';

@Component({
  selector: 'app-store-card',
  standalone: true,
  template: `
    <article
      class="store-card"
      [class.store-card--interactive]="interactive()"
      [class.store-card--accent-left]="accentLeft()"
    >
      <ng-content />
    </article>
  `,
  styles: `:host { display: block; }`
})
export class StoreCardComponent {
  readonly interactive = input(true);
  readonly accentLeft = input(false);
}
