import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '@core/notifications/notification.service';
import { StoreContextService } from '../data-access/store-context.service';
import { API_ENDPOINTS } from '@env/api.constants';
import { ApiResponse } from '@shared/models/api-response.model';
import { Portfolio } from '../../portfolio/models/portfolio.model';

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
            <button type="submit" class="mox-newsletter__btn" [disabled]="submitting()">
              {{ submitting() ? 'Subscribing…' : portfolio().newsletter.buttonLabel }}
            </button>
          </form>
        </div>
      </section>
    }
  `
})
export class NewsletterSignupSectionComponent {
  readonly portfolio = input.required<Portfolio>();
  private readonly http = inject(HttpClient);
  private readonly ctx = inject(StoreContextService);
  private readonly notifications = inject(NotificationService);

  email = '';
  readonly submitting = signal(false);

  subscribe(): void {
    const emailVal = this.email.trim();
    if (!emailVal) return;

    const slug = this.ctx.slug();
    this.submitting.set(true);

    this.http
      .post<ApiResponse<boolean>>(API_ENDPOINTS.catalog.newsletterSubscribe(slug), { email: emailVal })
      .subscribe({
        next: () => {
          this.notifications.success('Subscribed!', 'Thanks for joining our newsletter.');
          this.email = '';
          this.submitting.set(false);
        },
        error: () => {
          this.notifications.error('Could not subscribe. Please try again.');
          this.submitting.set(false);
        }
      });
  }
}
