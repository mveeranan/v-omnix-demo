import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../core/notifications/notification.service';
import { Portfolio } from '../../portfolio/models/portfolio.model';

@Component({
  selector: 'app-newsletter-signup-section',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (portfolio().newsletter.enabled) {
      <section class="mk-newsletter" id="newsletter">
        <div class="container mx-auto px-6">
          <h2 class="mk-newsletter__title">{{ portfolio().newsletter.heading }}</h2>
          <p class="mk-newsletter__subtitle">{{ portfolio().newsletter.subheading }}</p>
          <form class="mk-newsletter__form" (ngSubmit)="subscribe()">
            <input
              type="email"
              class="mk-newsletter__input"
              [placeholder]="portfolio().newsletter.placeholder"
              [(ngModel)]="email"
              name="email"
              required
            />
            <button type="submit" class="mk-newsletter__btn">{{ portfolio().newsletter.buttonLabel }}</button>
          </form>
        </div>
      </section>
    }
  `
})
export class NewsletterSignupSectionComponent {
  readonly portfolio = input.required<Portfolio>();
  private readonly notifications = inject(NotificationService);
  email = '';
  readonly submitted = signal(false);

  subscribe(): void {
    if (!this.email.trim()) return;
    this.submitted.set(true);
    this.notifications.success('Subscribed!', 'Thanks for joining our newsletter.');
    this.email = '';
  }
}
