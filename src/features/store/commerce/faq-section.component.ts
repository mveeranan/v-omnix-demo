import { Component, input, signal } from '@angular/core';
import { Portfolio } from '../../portfolio/models/portfolio.model';

@Component({
  selector: 'app-faq-section',
  standalone: true,
  imports: [],
  template: `
    @if (portfolio().faq.enabled && portfolio().faq.items.length) {
      <section class="mox-section mox-faq" id="faq">
        <div class="container mx-auto px-6 max-w-3xl">
          <header class="mb-10 text-center">
            <h2 class="mox-sale-section__title">{{ portfolio().faq.title }}</h2>
          </header>
          <div class="mox-faq__list">
            @for (item of portfolio().faq.items; track item.id) {
              <div class="mox-faq__item" [class.mox-faq__item--open]="openId() === item.id">
                <button
                  type="button"
                  class="mox-faq__question"
                  (click)="toggle(item.id)"
                  [attr.aria-expanded]="openId() === item.id"
                >
                  <span>{{ item.question }}</span>
                  <svg class="mox-faq__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>
                @if (openId() === item.id) {
                  <div class="mox-faq__answer">
                    <p>{{ item.answer }}</p>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </section>
    }
  `
})
export class FaqSectionComponent {
  readonly portfolio = input.required<Portfolio>();
  readonly openId = signal<string | null>(null);

  toggle(id: string): void {
    this.openId.update((current) => (current === id ? null : id));
  }
}
