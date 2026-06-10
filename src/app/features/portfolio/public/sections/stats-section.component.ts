import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  signal
} from '@angular/core';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import { Portfolio } from '../../models/portfolio.model';

interface StatDisplay {
  label: string;
  value: number;
  display: number;
}

@Component({
  selector: 'app-pf-stats-section',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './stats-section.component.html'
})
export class StatsSectionComponent implements AfterViewInit, OnDestroy {
  readonly portfolio = input.required<Portfolio>();
  private readonly el = inject(ElementRef);
  readonly stats = signal<StatDisplay[]>([]);
  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    const p = this.portfolio();
    if (!p.stats.enabled) return;

    this.stats.set([
      { label: 'Orders completed', value: p.stats.bookingsCompleted, display: 0 },
      { label: 'Years experience', value: p.stats.yearsExperience, display: 0 },
      { label: 'Happy customers', value: p.stats.happyCustomers, display: 0 }
    ]);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.stats.update((items) => items.map((s) => ({ ...s, display: s.value })));
      return;
    }

    const section = this.el.nativeElement.querySelector('.pf-stats-grid');
    if (!section) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          this.animateCounters();
          this.observer?.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    this.observer.observe(section);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private animateCounters(): void {
    const duration = 1200;
    const start = performance.now();
    const targets = this.stats();

    const tick = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.stats.set(
        targets.map((s) => ({ ...s, display: Math.floor(s.value * eased) }))
      );
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}

