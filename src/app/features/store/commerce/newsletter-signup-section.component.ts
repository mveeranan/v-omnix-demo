import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../core/notifications/notification.service';
import { Portfolio } from '../../portfolio/models/portfolio.model';
import { newsletterSubscriberStore } from '../../admin/data-access/newsletter-subscriber.store';

@Component({
  selector: 'app-newsletter-signup-section',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (portfolio().newsletter.enabled) {
      <section class="mox-newsletter" id="newsletter">
        <div class="container mx-auto px-6">
          <h2 class="mox-newsletter__title">{{ portfolio().newsletter.heading }}</h2>
          <p class="mox-newsletter__subtitle">{{ portfolio().newsletter.subheading }}</p>
          <form class="mox-newsletter__form" (ngSubmit)="subscribe()">
            <input
              type="email"
              class="mox-newsletter__input"
              [placeholder]="portfolio().newsletter.placeholder"
              [(ngModel)]="email"
              name="email"
              required
            />
            <button type="submit" class="mox-newsletter__btn">{{ portfolio().newsletter.buttonLabel }}</button>
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
    newsletterSubscriberStore.subscribe(this.email.trim());
    this.submitted.set(true);
    this.notifications.success('Subscribed!', 'Thanks for joining our newsletter.');
    this.email = '';
  }
}
