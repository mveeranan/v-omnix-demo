import { CurrencyPipe, NgClass } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ScrollRevealDirective } from '@features/portfolio/shared/directives/scroll-reveal.directive';
import { DealOfWeekBase } from './deal-of-week-layouts/deal-of-week-base';

/** Minishop "Deal of the Month": carousel with multiple deals, auto-rotation, navigation buttons, and swipe support (default "carousel" layout). */
@Component({
  selector: 'app-deal-of-week-section',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, NgClass, ScrollRevealDirective],
  template: `
    @if (deals().length) {
      <section class="msp-deal" [appScrollReveal]="'slide-up'">
        <div class="container mx-auto px-6 msp-deal__wrapper">
          <div class="msp-deal__carousel" (mousedown)="onDragStart($event)" (touchstart)="onDragStart($event)">
            <!-- Slides -->
            @for (deal of deals(); let idx = $index; track idx) {
              @if (deal.product) {
                <div class="msp-deal__slide" [ngClass]="{ 'msp-deal__slide--active': idx === currentSlideIndex() }">
                  <div class="msp-deal__grid">
                    <div class="msp-deal__media">
                      <img [src]="getPrimaryImage(deal.product)" [alt]="deal.product.name" loading="lazy" />
                    </div>
                    <div class="msp-deal__content">
                      <p class="msp-deal__eyebrow">{{ deal.badgeText || heading || 'Deal Of The Month' }}</p>
                      <h2 class="msp-deal__title">{{ deal.title || deal.product.name }}</h2>

                      <div class="msp-deal__countdown">
                        <div class="msp-deal__unit">
                          <span class="msp-deal__num">{{ getCountdown(deal).days }}</span>
                          <span class="msp-deal__label">Days</span>
                        </div>
                        <div class="msp-deal__unit">
                          <span class="msp-deal__num">{{ getCountdown(deal).hours }}</span>
                          <span class="msp-deal__label">Hours</span>
                        </div>
                        <div class="msp-deal__unit">
                          <span class="msp-deal__num">{{ getCountdown(deal).minutes }}</span>
                          <span class="msp-deal__label">Mins</span>
                        </div>
                        <div class="msp-deal__unit">
                          <span class="msp-deal__num">{{ getCountdown(deal).seconds }}</span>
                          <span class="msp-deal__label">Secs</span>
                        </div>
                      </div>

                      <a [routerLink]="getProductLink(deal)" class="msp-deal__product-link">{{ deal.product.name }}</a>
                      <div class="msp-deal__price-row">
                        @if (getDiscount(deal.product); as disc) {
                          <span class="msp-deal__compare">{{ deal.product.compareAtPrice | currency: 'USD' }}</span>
                          <span class="msp-deal__badge">{{ disc }}% Off</span>
                        }
                        <span class="msp-deal__price">{{ deal.product.price | currency: 'USD' }}</span>
                      </div>

                      <button type="button" class="msp-deal__cta" (click)="addToCart(deal)">Add to cart</button>
                    </div>
                  </div>
                </div>
              }
            }
          </div>

          <!-- Navigation Controls -->
          @if (deals().length > 1) {
            <div class="msp-deal__controls">
              <button type="button" class="msp-deal__nav-btn msp-deal__nav-btn--prev" (click)="previousSlide()" aria-label="Previous deal">
                <span class="msp-deal__nav-icon">❮</span>
              </button>
              <button type="button" class="msp-deal__nav-btn msp-deal__nav-btn--next" (click)="nextSlide()" aria-label="Next deal">
                <span class="msp-deal__nav-icon">❯</span>
              </button>
            </div>
          }
        </div>
      </section>
    }
  `,
  styles: `
    .msp-deal {
      padding: 7em 0;
      background: var(--mox-accent, #ff6f00);
    }
    .msp-deal__wrapper {
      position: relative;
    }
    .msp-deal__carousel {
      position: relative;
      overflow: hidden;
      user-select: none;
    }
    .msp-deal__slide {
      opacity: 0;
      position: absolute;
      width: 100%;
      transition: opacity 0.6s ease-in-out;
      pointer-events: none;
    }
    .msp-deal__slide--active {
      opacity: 1;
      position: relative;
      pointer-events: auto;
    }
    .msp-deal__grid {
      display: grid;
      grid-template-columns: 1fr;
      align-items: center;
      gap: 2.5rem;
      min-height: 400px;
    }
    @media (min-width: 992px) {
      .msp-deal__grid { grid-template-columns: 1fr 1fr; min-height: 500px; }
    }
    .msp-deal__media {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px;
    }
    .msp-deal__media img {
      max-width: 100%;
      max-height: 26rem;
      object-fit: contain;
      animation: msp-deal-float 4s ease-in-out infinite;
    }
    @keyframes msp-deal-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-14px); }
    }
    @media (prefers-reduced-motion: reduce) {
      .msp-deal__media img { animation: none; }
    }
    .msp-deal__eyebrow {
      margin: 0 0 0.75rem;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      color: #000;
    }
    .msp-deal__title {
      margin: 0 0 1.5rem;
      font-size: clamp(1.75rem, 4vw, 2.5rem);
      font-weight: 700;
      text-transform: uppercase;
      color: #000;
    }
    .msp-deal__countdown {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }
    .msp-deal__unit {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .msp-deal__num {
      font-size: 2.4rem;
      font-weight: 700;
      color: #fff;
    }
    .msp-deal__label {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(0, 0, 0, 0.6);
    }
    .msp-deal__product-link {
      display: inline-block;
      margin-bottom: 0.5rem;
      font-size: 1rem;
      font-weight: 800;
      text-transform: uppercase;
      color: #000;
      text-decoration: none;
    }
    .msp-deal__product-link:hover { text-decoration: underline; }
    .msp-deal__price-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.75rem;
      flex-wrap: wrap;
    }
    .msp-deal__compare {
      font-size: 0.95rem;
      text-decoration: line-through;
      color: #000;
    }
    .msp-deal__price {
      font-size: 1.5rem;
      font-weight: 800;
      color: #fff;
    }
    .msp-deal__badge {
      padding: 0.15rem 0.5rem;
      font-size: 0.72rem;
      font-weight: 700;
      background: #000;
      color: var(--mox-accent, #ff6f00);
      text-transform: uppercase;
    }
    .msp-deal__cta {
      padding: 0.85rem 2.2rem;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #fff;
      background: #000;
      border: none;
      border-radius: var(--mox-btn-radius, 999px);
      cursor: pointer;
      transition: opacity 0.2s ease;
    }
    .msp-deal__cta:hover { opacity: 0.85; }
    .msp-deal__controls {
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      transform: translateY(-50%);
      display: flex;
      justify-content: space-between;
      padding: 0 1rem;
      pointer-events: none;
      z-index: 10;
    }
    .msp-deal__nav-btn {
      pointer-events: auto;
      width: 2.5rem;
      height: 2.5rem;
      border: none;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.5);
      color: #fff;
      font-size: 1.2rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.3s ease;
    }
    .msp-deal__nav-btn:hover {
      background: rgba(0, 0, 0, 0.7);
    }
    .msp-deal__nav-icon {
      font-weight: bold;
    }
    @media (max-width: 768px) {
      .msp-deal__controls {
        padding: 0 0.5rem;
      }
      .msp-deal__nav-btn {
        width: 2rem;
        height: 2rem;
        font-size: 1rem;
      }
    }
  `
})
export class DealOfWeekSectionComponent extends DealOfWeekBase {
  readonly currentSlideIndex = signal(0);
  private autoRotateTimer?: ReturnType<typeof setInterval>;

  private dragStartX = 0;
  private dragStartY = 0;
  private isDragging = false;

  override ngOnInit(): void {
    super.ngOnInit();
    this.autoRotateTimer = setInterval(() => {
      if (this.deals().length > 1) this.nextSlide();
    }, 9000);
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.autoRotateTimer) clearInterval(this.autoRotateTimer);
  }

  nextSlide(): void {
    const len = this.deals().length;
    if (len) this.currentSlideIndex.update((i) => (i + 1) % len);
  }

  previousSlide(): void {
    const len = this.deals().length;
    if (len) this.currentSlideIndex.update((i) => (i - 1 + len) % len);
  }

  onDragStart(event: MouseEvent | TouchEvent): void {
    this.isDragging = true;
    this.dragStartX = event instanceof TouchEvent ? event.touches[0].clientX : event.clientX;
    this.dragStartY = event instanceof TouchEvent ? event.touches[0].clientY : event.clientY;

    const handleDragMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!this.isDragging) return;
      const currentX = moveEvent instanceof TouchEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const currentY = moveEvent instanceof TouchEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
      const diffX = currentX - this.dragStartX;
      const diffY = currentY - this.dragStartY;

      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        this.isDragging = false;
        if (diffX > 0) this.previousSlide();
        else this.nextSlide();
        document.removeEventListener('mousemove', handleDragMove as any);
        document.removeEventListener('touchmove', handleDragMove as any);
      }
    };

    const handleDragEnd = () => {
      this.isDragging = false;
      document.removeEventListener('mousemove', handleDragMove as any);
      document.removeEventListener('touchmove', handleDragMove as any);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchend', handleDragEnd);
    };

    document.addEventListener('mousemove', handleDragMove as any);
    document.addEventListener('touchmove', handleDragMove as any);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchend', handleDragEnd);
  }
}
