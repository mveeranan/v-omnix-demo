import { CommonModule, DOCUMENT } from '@angular/common';

import {

  Component,

  HostListener,

  inject,

  OnDestroy,

  OnInit,

  PLATFORM_ID,

  signal

} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';

import { LucideAngularModule, Eye, X } from 'lucide-angular';

import { AdminPageShellComponent } from '../../admin/shared/admin-page-shell.component';

import { pageFadeIn, backdropFade } from '../../admin/animations/admin.animations';

import { PortfolioStateService } from '../data-access/portfolio-state.service';

import { WebsiteSectionStateService } from '../data-access/website-section-state.service';

import { StorePreviewComponent } from '../../store/layout/store-preview.component';

import { BrandSectionComponent } from './sections/brand-section.component';

import { HeroEditorSectionComponent } from './sections/hero-editor-section.component';

import { CategoryShowcaseEditorSectionComponent } from './sections/category-showcase-editor-section.component';

import { FeaturedProductsEditorSectionComponent } from './sections/featured-products-section.component';

import { OfferBannerEditorSectionComponent } from './sections/offer-banner-editor-section.component';

import { SaleCollectionEditorSectionComponent } from './sections/sale-collection-editor-section.component';

import { ReviewsSectionComponent } from './sections/reviews-section.component';

import { StatsEditorSectionComponent } from './sections/stats-editor-section.component';

import { WhyChooseUsSectionComponent } from './sections/why-choose-us-section.component';

import { ContactSupportSectionComponent } from './sections/contact-support-section.component';

import { NewsletterEditorSectionComponent } from './sections/newsletter-editor-section.component';

import { SocialSectionComponent } from './sections/social-section.component';

import { PublishEditorPanelComponent } from './sections/publish-editor-panel.component';

import { ScrollRevealService } from '@features/portfolio/shared/services/scroll-reveal.service';

type EditorTab = 'content' | 'publish';



@Component({

  selector: 'app-portfolio-editor',

  standalone: true,

  imports: [

    CommonModule,

    LucideAngularModule,

    AdminPageShellComponent,

    StorePreviewComponent,

    BrandSectionComponent,

    HeroEditorSectionComponent,

    CategoryShowcaseEditorSectionComponent,

    FeaturedProductsEditorSectionComponent,

    OfferBannerEditorSectionComponent,

    SaleCollectionEditorSectionComponent,

    ReviewsSectionComponent,

    StatsEditorSectionComponent,

    WhyChooseUsSectionComponent,

    ContactSupportSectionComponent,

    NewsletterEditorSectionComponent,

    SocialSectionComponent,

    PublishEditorPanelComponent

  ],

  templateUrl: './portfolio-editor.component.html',

  styleUrl: './portfolio-editor.component.scss',

  animations: [pageFadeIn, backdropFade],

  host: { class: 'pf-editor-host' }

})

export class PortfolioEditorComponent implements OnInit, OnDestroy {

  readonly state = inject(PortfolioStateService);

  readonly sectionState = inject(WebsiteSectionStateService);

  private readonly document = inject(DOCUMENT);

  private readonly platformId = inject(PLATFORM_ID);

  private readonly scrollReveal = inject(ScrollRevealService);



  readonly activeTab = signal<EditorTab>('content');

  readonly previewOpen = signal(false);



  readonly eyeIcon = Eye;

  readonly closeIcon = X;



  ngOnInit(): void {
    this.state.loadDraft();
  }



  ngOnDestroy(): void {

    this.unlockBodyScroll();

  }



  setTab(tab: EditorTab): void {

    this.activeTab.set(tab);

    const workspace = this.document.querySelector('.pf-editor-workspace');

    workspace?.scrollTo({ top: 0, behavior: 'smooth' });

  }



  openPreview(): void {

    this.previewOpen.set(true);

    this.lockBodyScroll();

    if (isPlatformBrowser(this.platformId)) {

      requestAnimationFrame(() => {

        requestAnimationFrame(() => this.scrollReveal.refresh());

      });

    }

  }



  closePreview(): void {

    this.previewOpen.set(false);

    this.unlockBodyScroll();

  }



  @HostListener('document:keydown.escape')

  onEscape(): void {

    if (this.previewOpen()) {

      this.closePreview();

    }

  }



  savingLabel(): string {

    if (this.state.isSaving()) return 'Saving…';

    const dirty = this.sectionState.dirtyCount();

    if (dirty > 0) return `${dirty} section${dirty === 1 ? '' : 's'} with unsaved changes`;

    if (this.state.lastSavedAt()) return `All changes saved at ${this.formatTime(this.state.lastSavedAt()!)}`;

    return 'All sections saved';

  }



  private formatTime(date: Date): string {

    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  }



  private lockBodyScroll(): void {

    if (!isPlatformBrowser(this.platformId)) return;

    this.document.body.style.overflow = 'hidden';

  }



  private unlockBodyScroll(): void {

    if (!isPlatformBrowser(this.platformId)) return;

    this.document.body.style.overflow = '';

  }

}


