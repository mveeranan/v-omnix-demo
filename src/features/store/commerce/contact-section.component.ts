import { Component, input } from '@angular/core';
import { ScrollRevealDirective } from '../../portfolio/shared/directives/scroll-reveal.directive';
import { Portfolio } from '../../portfolio/models/portfolio.model';
import { SocialLinksComponent } from '../../portfolio/shared/ui/social-links.component';

@Component({
  selector: 'app-store-contact-section',
  standalone: true,
  imports: [ScrollRevealDirective, SocialLinksComponent],
  template: `
    @if (portfolio().contactSupport.enabled) {
    <section class="pf-section" [class.pf-section-alt]="variant() === 'full'" [id]="variant() === 'compact' ? 'contact' : undefined">
      <div class="container mx-auto px-6">
        <div appScrollReveal class="text-center">
          <p class="pf-eyebrow">Contact</p>
          <h2 class="pf-display pf-heading mt-2 text-3xl font-semibold md:text-4xl">Get in touch</h2>
        </div>

        <div
          class="mt-10 grid gap-6"
          [class.md:grid-cols-2]="variant() === 'full'"
          [class.lg:grid-cols-3]="variant() === 'full'"
        >
          @if (contact().phone) {
            <div appScrollReveal="scale-in" class="pf-glass-card p-5 text-center">
              <p class="pf-eyebrow">Phone</p>
              <a class="pf-text mt-2 block text-sm" [href]="'tel:' + contact().phone">{{ contact().phone }}</a>
            </div>
          }
          @if (contact().email) {
            <div appScrollReveal="scale-in" [appScrollRevealDelay]="60" class="pf-glass-card p-5 text-center">
              <p class="pf-eyebrow">Email</p>
              <a class="pf-text mt-2 block text-sm" [href]="'mailto:' + contact().email">{{ contact().email }}</a>
            </div>
          }
          @if (supportHours()) {
            <div appScrollReveal="scale-in" [appScrollRevealDelay]="90" class="pf-glass-card p-5 text-center">
              <p class="pf-eyebrow">Support hours</p>
              <p class="pf-text mt-2 text-sm">{{ supportHours() }}</p>
            </div>
          }
          @if (whatsapp()) {
            <div appScrollReveal="scale-in" [appScrollRevealDelay]="120" class="pf-glass-card p-5 text-center">
              <p class="pf-eyebrow">WhatsApp</p>
              <a class="pf-text mt-2 block text-sm" [href]="whatsappLink()" target="_blank" rel="noopener noreferrer">
                {{ whatsapp() }}
              </a>
            </div>
          }
          @if (contact().address || contact().city) {
            <div
              appScrollReveal="scale-in"
              [appScrollRevealDelay]="180"
              class="pf-glass-card p-5 text-center"
              [class.md:col-span-2]="variant() === 'full'"
              [class.lg:col-span-3]="variant() === 'full'"
            >
              <p class="pf-eyebrow">Address</p>
              <p class="pf-text mt-2 text-sm">
                {{ contact().address }}@if (contact().city) {, {{ contact().city }} }@if (contact().country) {, {{ contact().country }} }
              </p>
            </div>
          }
        </div>

        <div appScrollReveal [appScrollRevealDelay]="200" class="mt-8 flex justify-center">
          <app-pf-social-links [social]="portfolio().social" variant="footer" />
        </div>

        @if (variant() === 'full' && mapsLink()) {
          <div appScrollReveal [appScrollRevealDelay]="240" class="mt-10 text-center">
            <a [href]="mapsLink()" target="_blank" rel="noopener noreferrer" class="pf-btn-secondary text-sm">
              Open in Google Maps
            </a>
          </div>
        }
      </div>
    </section>
    }
  `
})
export class ContactSectionComponent {
  readonly portfolio = input.required<Portfolio>();
  readonly variant = input<'compact' | 'full'>('full');

  contact() {
    const p = this.portfolio();
    const cs = p.contactSupport;
    return {
      ...p.contact,
      enabled: cs.enabled,
      email: cs.email || p.contact.email || '',
      phone: cs.phone || p.contact.phone || '',
      address: p.contact.address || '',
      city: p.contact.city || '',
      country: p.contact.country || ''
    };
  }

  supportHours(): string {
    return this.portfolio().contactSupport.supportHours?.trim() ?? '';
  }

  whatsapp(): string {
    return this.portfolio().contact.whatsapp?.trim() ?? '';
  }

  whatsappLink(): string {
    const phone = this.whatsapp().replace(/\D/g, '');
    return phone ? `https://wa.me/${phone}` : '#';
  }

  mapsLink(): string {
    const url = this.portfolio().contact.mapUrl?.trim();
    if (url) return url;
    const parts = [this.contact().address, this.contact().city, this.contact().country].filter(Boolean);
    if (!parts.length) return '';
    const q = encodeURIComponent(parts.join(', '));
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
  }
}
