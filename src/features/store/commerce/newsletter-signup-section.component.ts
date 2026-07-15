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
        <div class="mox-newsletter__container">
          <div class="mox-newsletter__content">
            <h2 class="mox-newsletter__title">{{ portfolio().newsletter.heading }}</h2>
            <p class="mox-newsletter__subtitle">{{ portfolio().newsletter.subheading }}</p>
          </div>
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
  `,
  styles: `
    .mox-newsletter {
      padding: 60px 20px;
      /* Fallback first: without color-mix() support the whole gradient would be
         rejected, leaving white text on a transparent section. */
      background: var(--mox-accent, #ff6f00);
      background: linear-gradient(135deg, var(--mox-accent, #ff6f00) 0%, color-mix(in srgb, var(--mox-accent, #ff6f00) 85%, #1a1a1a) 100%);
      width: 100%;
    }

    .mox-newsletter__container {
      max-width: 600px;
      margin: 0 auto;
      text-align: center;
    }

    .mox-newsletter__content {
      margin-bottom: 30px;
    }

    .mox-newsletter__title {
      font-size: 32px;
      font-weight: 700;
      /* Fixed dark: the section background is a fixed amber gradient in both
         light and dark modes, so foreground must not use theme vars (which
         flip to light in dark mode and become invisible on the amber). */
      color: #1a1a1a;
      margin: 0 0 10px 0;
    }

    .mox-newsletter__subtitle {
      font-size: 16px;
      color: rgba(26, 26, 26, 0.8);
      margin: 0;
      line-height: 1.6;
    }

    .mox-newsletter__form {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;

      @media (max-width: 768px) {
        flex-direction: column;
      }
    }

    .mox-newsletter__input {
      flex: 1;
      min-width: 200px;
      padding: 14px 20px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      background: white;
      color: #1a1a1a;

      &::placeholder {
        color: #999;
      }

      &:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(26, 26, 26, 0.1);
      }

      @media (max-width: 768px) {
        min-width: unset;
      }
    }

    .mox-newsletter__btn {
      padding: 14px 40px;
      /* Fixed dark button on the fixed amber gradient (theme-independent). */
      background: #1a1a1a;
      color: white;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;

      &:hover:not(:disabled) {
        background: white;
        color: #1a1a1a;
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      @media (max-width: 768px) {
        width: 100%;
      }
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
        error: (err) => {
          this.notifications.errorFromApi(err, 'Could not subscribe. Please try again.');
          this.submitting.set(false);
        }
      });
  }
}
