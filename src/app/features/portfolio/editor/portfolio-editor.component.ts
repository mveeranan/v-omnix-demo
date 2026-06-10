import { CommonModule, DOCUMENT } from '@angular/common';
import {
  Component,
  HostListener,
  inject,
  OnDestroy,
  PLATFORM_ID,
  signal
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LucideAngularModule, Eye, X } from 'lucide-angular';
import { AdminPageShellComponent } from '../../admin/shared/admin-page-shell.component';
import { pageFadeIn, backdropFade } from '../../admin/animations/admin.animations';
import { PortfolioStateService } from '../data-access/portfolio-state.service';
import { PublicPortfolioComponent } from '../public/public-portfolio.component';
import { BrandEditorSectionComponent } from './sections/brand-editor-section.component';
import { AboutEditorSectionComponent } from './sections/about-editor-section.component';
import { GalleryEditorSectionComponent } from './sections/gallery-editor-section.component';
import { ReviewsEditorSectionComponent } from './sections/reviews-editor-section.component';
import { SocialEditorSectionComponent } from './sections/social-editor-section.component';
import { TeamEditorSectionComponent } from './sections/team-editor-section.component';
import { ThemeEditorSectionComponent } from './sections/theme-editor-section.component';
import { PublishEditorPanelComponent } from './sections/publish-editor-panel.component';
import { HighlightsEditorSectionComponent } from './sections/highlights-editor-section.component';
import { ScrollRevealService } from '../shared/services/scroll-reveal.service';

type EditorTab = 'content' | 'theme' | 'publish';

@Component({
  selector: 'app-portfolio-editor',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    AdminPageShellComponent,
    PublicPortfolioComponent,
    BrandEditorSectionComponent,
    AboutEditorSectionComponent,
    GalleryEditorSectionComponent,
    ReviewsEditorSectionComponent,
    SocialEditorSectionComponent,
    TeamEditorSectionComponent,
    ThemeEditorSectionComponent,
    PublishEditorPanelComponent,
    HighlightsEditorSectionComponent
  ],
  templateUrl: './portfolio-editor.component.html',
  styleUrl: './portfolio-editor.component.scss',
  animations: [pageFadeIn, backdropFade],
  host: { class: 'pf-editor-host' }
})
export class PortfolioEditorComponent implements OnDestroy {
  readonly state = inject(PortfolioStateService);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly scrollReveal = inject(ScrollRevealService);

  readonly activeTab = signal<EditorTab>('content');
  readonly previewOpen = signal(false);

  readonly eyeIcon = Eye;
  readonly closeIcon = X;

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
    if (this.state.isSaving()) return 'Savingâ€¦';
    if (this.state.isDirty()) return 'Unsaved changes';
    return 'All changes saved';
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

