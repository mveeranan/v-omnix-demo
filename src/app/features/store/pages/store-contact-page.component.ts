import { Component, inject } from '@angular/core';
import { StoreContextService } from '../data-access/store-context.service';
import { ContactSectionComponent } from '../commerce/contact-section.component';

@Component({
  selector: 'app-store-contact-page',
  standalone: true,
  imports: [ContactSectionComponent],
  template: `
    @if (ctx.portfolio(); as p) {
      <app-store-contact-section [portfolio]="p" variant="full" />
    }
  `
})
export class StoreContactPageComponent {
  readonly ctx = inject(StoreContextService);
}
