import { Component, inject } from '@angular/core';
import { StoreContextService } from '../data-access/store-context.service';
import { AboutSectionComponent } from '../../portfolio/public/sections/about-section.component';

@Component({
  selector: 'app-store-about-page',
  standalone: true,
  imports: [AboutSectionComponent],
  template: `
    @if (ctx.portfolio(); as p) {
      <div class="store-page-header container mx-auto px-6 pb-4 pt-10">
        <p class="pf-eyebrow">About us</p>
        <h1 class="pf-display pf-heading text-3xl font-semibold md:text-4xl">{{ p.brand.businessName }}</h1>
      </div>
      <app-pf-about-section [portfolio]="p" mode="full" />
    }
  `
})
export class StoreAboutPageComponent {
  readonly ctx = inject(StoreContextService);
}
