import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Image, Pin } from 'lucide-angular';
import { AdminDetailCardComponent } from '@features/admin/shared/admin-detail-card.component';
import { AdminDetailItemComponent } from '@features/admin/shared/admin-detail-item.component';
import { AdminDetailMediaComponent } from '@features/admin/shared/admin-detail-media.component';
import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';
import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { WebsiteSectionStateService } from '../../data-access/website-section-state.service';
import { PortfolioOfferBanner } from '../../models/portfolio.model';
import { ProductApiService } from '../../../store/data-access/product-api.service';
import { StoreProduct } from '../../../store/models/product.model';

@Component({
  selector: 'app-offer-banner-editor-section',
  standalone: true,
  imports: [CommonModule, FormsModule, WebsiteSectionShellComponent, SectionToggleComponent, AdminDetailCardComponent,
    AdminDetailItemComponent,
    AdminDetailMediaComponent],
  template: `
    <app-website-section-shell sectionId="offerBanner" title="Offer highlights" [icon]="icon" [complete]="pinnedCount() > 0">
      <div view class="admin-detail-view admin-detail-view--rich">
        <app-admin-detail-card [full]="true">
          <app-admin-detail-item [icon]="pinnedIcon" label="Pinned offers" [value]="pinnedCount() + ' of 2'" />
        </app-admin-detail-card>
        <p class="pf-editor-hint">Two large promo tiles on your company homepage.</p>
      </div>
      <div edit class="pf-editor-fields">
        @if (buffer(); as b) {
          <app-section-toggle label="Show offer tiles" [enabled]="b.enabled" (enabledChange)="patch({ enabled: $event })" />
          <p class="pf-editor-hint">Select up to 2 products for side-by-side offer banners.</p>
          @if (loading()) {
            <p class="pf-editor-muted">Loading products…</p>
          } @else {
            <div class="pf-product-pin-list">
              @for (product of catalog(); track product.id) {
                <label class="pf-product-pin-item">
                  <input
                    type="checkbox"
                    [checked]="isPinned(product.id)"
                    [disabled]="!isPinned(product.id) && pinnedCount() >= 2"
                    (change)="togglePin(product.id, $any($event.target).checked)"
                  />
                  <img [src]="product.imageUrl" alt="" class="pf-product-pin-item__img" />
                  <span class="pf-product-pin-item__name">{{ product.name }}</span>
                </label>
              }
            </div>
          }
        }
      </div>
    </app-website-section-shell>
  `,
  styles: `
    .pf-product-pin-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .pf-product-pin-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; border-radius: 0.5rem; border: 1px solid var(--border-subtle); cursor: pointer; }
    .pf-product-pin-item__img { width: 2.5rem; height: 2.5rem; object-fit: cover; border-radius: 0.25rem; }
    .pf-product-pin-item__name { flex: 1; font-size: 0.875rem; }
  `
})
export class OfferBannerEditorSectionComponent implements OnInit {
  private readonly state = inject(PortfolioStateService);
  private readonly sectionState = inject(WebsiteSectionStateService);
  private readonly productApi = inject(ProductApiService);
  readonly draft = this.state.draft;
  readonly icon = Image;
  readonly pinnedIcon = Pin;
  readonly buffer = computed(() => this.sectionState.buffer<PortfolioOfferBanner>('offerBanner'));
  readonly catalog = signal<StoreProduct[]>([]);
  readonly loading = signal(true);

  pinnedCount = computed(() => this.buffer()?.productIds?.length ?? 0);

  ngOnInit(): void {
    const slug = this.draft()?.slug;
    if (!slug) {
      this.loading.set(false);
      return;
    }
    this.productApi.listByStore(slug).subscribe({
      next: (r) => {
        this.catalog.set(r.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  isPinned(id: string): boolean {
    return this.buffer()?.productIds.includes(id) ?? false;
  }

  togglePin(id: string, checked: boolean): void {
    this.sectionState.patchBuffer<PortfolioOfferBanner>('offerBanner', (b) => {
      let ids = [...b.productIds];
      if (checked) {
        if (!ids.includes(id) && ids.length < 2) ids.push(id);
      } else {
        ids = ids.filter((x) => x !== id);
      }
      return { ...b, productIds: ids };
    });
  }

  patch(partial: Partial<PortfolioOfferBanner>): void {
    this.sectionState.patchBuffer<PortfolioOfferBanner>('offerBanner', (b) => ({ ...b, ...partial }));
  }
}
