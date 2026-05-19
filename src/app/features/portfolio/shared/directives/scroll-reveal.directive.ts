import {
  Directive,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ScrollRevealService } from '../services/scroll-reveal.service';

export type ScrollRevealAnimation = 'fade-up' | 'slide-left' | 'slide-right' | 'scale-in';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly revealService = inject(ScrollRevealService);
  private refreshSub?: Subscription;

  readonly delay = input(0, { alias: 'appScrollRevealDelay' });
  readonly animation = input('fade-up', {
    alias: 'appScrollReveal',
    transform: (value: string | boolean): ScrollRevealAnimation => {
      if (value === true || value === '' || value === 'true') return 'fade-up';
      return value as ScrollRevealAnimation;
    }
  });

  private observer?: IntersectionObserver;

  ngOnInit(): void {
    const element = this.el.nativeElement;
    const anim = this.animation();
    element.classList.add('pf-reveal-hidden', `pf-reveal-${anim}`);

    const delayMs = this.delay();
    if (delayMs) {
      element.style.setProperty('--pf-delay', `${delayMs}ms`);
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.reveal(element);
      return;
    }

    this.refreshSub = this.revealService.refresh$.subscribe(() => this.revealIfInView());

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.reveal(entry.target as HTMLElement);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    this.observer.observe(element);

    requestAnimationFrame(() => this.revealIfInView());
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.refreshSub?.unsubscribe();
  }

  private revealIfInView(): void {
    const element = this.el.nativeElement;
    if (element.classList.contains('pf-reveal-visible')) return;

    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const inView = rect.top < viewportHeight * 0.92 && rect.bottom > viewportHeight * 0.08;

    if (inView) {
      this.reveal(element);
    }
  }

  private reveal(element: HTMLElement): void {
    element.classList.remove('pf-reveal-hidden');
    element.classList.add('pf-reveal-visible');
    this.observer?.unobserve(element);
  }
}
