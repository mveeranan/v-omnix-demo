import { Component, input } from '@angular/core';
import { CreditCard, Smartphone, Banknote, Wallet } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { ScrollRevealDirective } from '../../portfolio/shared/directives/scroll-reveal.directive';
import { Portfolio } from '../../portfolio/models/portfolio.model';
import { StoreSectionHeaderComponent } from '@features/store/shared/ui/store-section-header.component';

@Component({
  selector: 'app-payment-methods-bar',
  standalone: true,
  imports: [LucideAngularModule, ScrollRevealDirective, StoreSectionHeaderComponent],
  template: `
    @if (portfolio().paymentMethods.enabled) {
      <section class="pf-section pf-section-alt" id="payments">
        <div class="container mx-auto px-6">
          <div appScrollReveal>
            <app-store-section-header eyebrow="Checkout" title="Payment methods" subtitle="We accept the following payment options" [icon]="creditIcon" />
          </div>
          <div class="mt-10 flex flex-wrap justify-center gap-4">
            @if (portfolio().paymentMethods.upi) {
              <div appScrollReveal="zoom-in" class="store-card flex items-center gap-2 px-5 py-3">
                <lucide-icon [img]="phoneIcon" class="h-5 w-5 text-[var(--pf-accent)]" /><span class="text-sm font-medium">UPI</span>
              </div>
            }
            @if (portfolio().paymentMethods.card) {
              <div appScrollReveal="zoom-in" [appScrollRevealDelay]="60" class="store-card flex items-center gap-2 px-5 py-3">
                <lucide-icon [img]="creditIcon" class="h-5 w-5 text-[var(--pf-accent)]" /><span class="text-sm font-medium">Card</span>
              </div>
            }
            @if (portfolio().paymentMethods.cod) {
              <div appScrollReveal="zoom-in" [appScrollRevealDelay]="120" class="store-card flex items-center gap-2 px-5 py-3">
                <lucide-icon [img]="cashIcon" class="h-5 w-5 text-[var(--pf-accent)]" /><span class="text-sm font-medium">Cash on delivery</span>
              </div>
            }
            @if (portfolio().paymentMethods.wallet) {
              <div appScrollReveal="zoom-in" [appScrollRevealDelay]="180" class="store-card flex items-center gap-2 px-5 py-3">
                <lucide-icon [img]="walletIcon" class="h-5 w-5 text-[var(--pf-accent)]" /><span class="text-sm font-medium">Wallet</span>
              </div>
            }
          </div>
        </div>
      </section>
    }
  `
})
export class PaymentMethodsBarComponent {
  readonly portfolio = input.required<Portfolio>();
  readonly creditIcon = CreditCard;
  readonly phoneIcon = Smartphone;
  readonly cashIcon = Banknote;
  readonly walletIcon = Wallet;
}
