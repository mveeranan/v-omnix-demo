import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChevronDown, ChevronUp, Plus, Trash2, LucideAngularModule, ShieldCheck } from 'lucide-angular';
import { AdminDetailCardComponent } from '@features/admin/shared/admin-detail-card.component';
import { AdminDetailItemComponent } from '@features/admin/shared/admin-detail-item.component';
import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';
import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { WebsiteSectionStateService } from '../../data-access/website-section-state.service';
import { PortfolioTrustBadges, TrustBadgeItem } from '../../models/portfolio.model';
import { TRUST_BADGE_ICON_OPTIONS, resolveTrustBadgeIcon } from '../../models/trust-badges-icons';

@Component({
  selector: 'app-trust-badges-editor-section',
  standalone: true,
  imports: [
    FormsModule,
    LucideAngularModule,
    WebsiteSectionShellComponent,
    SectionToggleComponent,
    AdminDetailCardComponent,
    AdminDetailItemComponent
  ],
  template: `
    <app-website-section-shell sectionId="trustBadges" title="Trust bar" [icon]="icon" [complete]="activeCount() > 0">
      <div view class="admin-detail-view">
        <app-admin-detail-card [full]="true">
          <app-admin-detail-item [icon]="icon" label="Active badges" [value]="activeCount() + ' badge' + (activeCount() !== 1 ? 's' : '')" />
        </app-admin-detail-card>
        @if ((draft()?.trustBadges?.badges?.length ?? 0) > 0) {
          <div class="trust-badges-preview-grid">
            @for (badge of draft()?.trustBadges?.badges ?? []; track badge.id) {
              @if (badge.enabled) {
                <div class="trust-badge-preview-item">
                  <lucide-icon [img]="resolveIcon(badge.icon)" class="trust-badge-preview-icon" />
                  <span class="trust-badge-preview-text">{{ badge.title }}</span>
                </div>
              }
            }
          </div>
        }
      </div>
      <div edit class="pf-editor-fields">
        @if (buffer(); as b) {
          <app-section-toggle label="Show trust bar" [enabled]="b.enabled" (enabledChange)="patch({ enabled: $event })" />
          <p class="pf-editor-hint">The row of reassurance badges shown under your hero banner. Create custom badges to build trust with your customers.</p>

          @if (b.badges && b.badges.length > 0) {
            <div class="trust-badges-list">
              @for (badge of b.badges; track badge.id; let i = $index) {
                <div class="trust-badge-card">
                  <div class="trust-badge-card__header">
                    <div class="trust-badge-card__info">
                      <lucide-icon [img]="resolveIcon(badge.icon)" class="trust-badge-card__icon-display" />
                      <span class="trust-badge-card__title">Badge {{ i + 1 }}: {{ badge.title || '(no title)' }}</span>
                    </div>
                    <div class="trust-badge-card__actions">
                      <div class="trust-badge-card__sort" role="group" aria-label="Reorder badge">
                        <button
                          type="button"
                          class="trust-badge-card__sort-btn"
                          (click)="moveBadgeUp(badge.id)"
                          [disabled]="i === 0"
                          aria-label="Move badge up"
                        >
                          <lucide-icon [img]="upIcon" class="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          class="trust-badge-card__sort-btn"
                          (click)="moveBadgeDown(badge.id)"
                          [disabled]="i === (b.badges?.length ?? 0) - 1"
                          aria-label="Move badge down"
                        >
                          <lucide-icon [img]="downIcon" class="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        class="trust-badge-card__delete"
                        (click)="deleteBadge(badge.id)"
                        aria-label="Delete badge"
                      >
                        <lucide-icon [img]="deleteIcon" class="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div class="trust-badge-card__content">
                    <div class="pf-editor-field">
                      <span class="pf-editor-label">Title</span>
                      <input
                        class="pf-editor-input"
                        type="text"
                        [ngModel]="badge.title"
                        (ngModelChange)="updateBadge(badge.id, { title: $event })"
                        placeholder="e.g. Free Shipping"
                      />
                    </div>

                    <div class="pf-editor-field">
                      <span class="pf-editor-label">Icon</span>
                      <select class="pf-editor-input" [ngModel]="badge.icon" (ngModelChange)="updateBadge(badge.id, { icon: $event })">
                        @for (opt of iconOptions; track opt.id) {
                          <option [value]="opt.id">{{ opt.label }}</option>
                        }
                      </select>
                    </div>

                    <label class="trust-badge-toggle-label">
                      <input
                        type="checkbox"
                        class="trust-badge-toggle-input"
                        [ngModel]="badge.enabled"
                        (ngModelChange)="updateBadge(badge.id, { enabled: $event })"
                      />
                      <span class="trust-badge-toggle-text">Show on storefront</span>
                    </label>
                  </div>
                </div>
              }
            </div>

            <button type="button" class="pf-badge-add-btn" (click)="addBadge()">
              <lucide-icon [img]="plusIcon" class="h-4 w-4" />
              Add another badge
            </button>
          } @else {
            <div class="pf-empty-state">
              <p class="pf-empty-state__text">No badges yet. Create your first trust badge to display on your storefront.</p>
              <button type="button" class="pf-badge-add-btn pf-badge-add-btn--prominent" (click)="addBadge()">
                <lucide-icon [img]="plusIcon" class="h-5 w-5" />
                Add your first badge
              </button>
            </div>
          }
        }
      </div>
    </app-website-section-shell>
  `,
  styles: `
    .trust-badges-preview-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      padding: 0.75rem 0;
    }

    .trust-badge-preview-item {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      border-radius: 0.375rem;
      background: rgb(241 245 249);
      border: 1px solid rgb(226 232 240);
      font-size: 0.8125rem;
      color: rgb(51 65 85);
    }

    :host-context(.dark) .trust-badge-preview-item {
      background: rgb(39 39 42);
      border-color: rgb(63 63 70);
      color: rgb(212 212 216);
    }

    .trust-badge-preview-icon {
      height: 0.875rem;
      width: 0.875rem;
      flex-shrink: 0;
    }

    .trust-badge-preview-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .trust-badges-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 1rem;
    }

    .trust-badge-card {
      border: 1px solid rgb(226 232 240);
      border-radius: 0.625rem;
      background: rgb(255 255 255);
      overflow: hidden;
    }

    :host-context(.dark) .trust-badge-card {
      border-color: rgb(63 63 70);
      background: rgb(39 39 42);
    }

    .trust-badge-card__header {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      width: 100%;
      padding: 0.625rem 0.75rem;
      box-sizing: border-box;
      background: rgb(241 245 249);
      border-bottom: 1px solid rgb(226 232 240);
    }

    :host-context(.dark) .trust-badge-card__header {
      background: rgb(24 24 27);
      border-bottom-color: rgb(63 63 70);
    }

    .trust-badge-card__info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 1 1 auto;
      min-width: 0;
    }

    .trust-badge-card__icon-display {
      width: 1.25rem;
      height: 1.25rem;
      flex-shrink: 0;
      color: rgb(124 58 237);
    }

    :host-context(.dark) .trust-badge-card__icon-display {
      color: rgb(196 181 253);
    }

    .trust-badge-card__title {
      flex: 1 1 auto;
      min-width: 0;
      font-size: 0.8125rem;
      font-weight: 600;
      line-height: 1.75rem;
      color: rgb(51 65 85);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    :host-context(.dark) .trust-badge-card__title {
      color: rgb(212 212 216);
    }

    .trust-badge-card__actions {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      align-items: center;
      flex: 0 0 auto;
      margin-left: auto;
      gap: 0.75rem;
    }

    .trust-badge-card__content {
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .trust-badge-card__sort {
      display: inline-flex;
      flex-direction: row;
      flex-wrap: nowrap;
      align-items: center;
      flex-shrink: 0;
      gap: 0.375rem;
    }

    .trust-badge-card__sort-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      height: 1.75rem;
      width: 1.75rem;
      padding: 0;
      border-radius: 0.375rem;
      border: 1px solid rgb(203 213 225);
      background: rgb(226 232 240);
      color: rgb(71 85 105);
      cursor: pointer;
      transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
    }

    :host-context(.dark) .trust-badge-card__sort-btn {
      border-color: rgb(82 82 91);
      background: rgb(63 63 70);
      color: rgb(212 212 216);
    }

    .trust-badge-card__sort-btn:hover:not(:disabled) {
      background: rgb(255 255 255);
      border-color: rgb(203 213 225);
      color: rgb(15 23 42);
    }

    :host-context(.dark) .trust-badge-card__sort-btn:hover:not(:disabled) {
      background: rgb(39 39 42);
      border-color: rgb(113 113 122);
      color: rgb(250 250 250);
    }

    .trust-badge-card__sort-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .trust-badge-card__delete {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      height: 1.75rem;
      width: 1.75rem;
      padding: 0;
      border-radius: 0.375rem;
      border: 1px solid rgb(226 232 240);
      background: rgb(255 255 255);
      color: rgb(239 68 68);
      cursor: pointer;
      transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
    }

    :host-context(.dark) .trust-badge-card__delete {
      border-color: rgb(63 63 70);
      background: rgb(39 39 42);
      color: rgb(248 113 113);
    }

    .trust-badge-card__delete:hover {
      background: rgb(254 242 242);
      border-color: rgb(254 202 202);
      color: rgb(220 38 38);
    }

    :host-context(.dark) .trust-badge-card__delete:hover {
      background: rgb(63 29 29);
      border-color: rgb(127 29 29);
      color: rgb(252 165 165);
    }

    .pf-badge-add-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1rem;
      margin-top: 0.75rem;
      background: rgb(255 255 255);
      border: 1px solid rgb(226 232 240);
      border-radius: 0.375rem;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      color: rgb(51 65 85);
      transition: all 0.2s;
    }

    :host-context(.dark) .pf-badge-add-btn {
      background: rgb(39 39 42);
      border-color: rgb(63 63 70);
      color: rgb(212 212 216);
    }

    .pf-badge-add-btn:hover {
      background: rgb(248 250 252);
      border-color: rgb(124 58 237);
      color: rgb(124 58 237);
    }

    :host-context(.dark) .pf-badge-add-btn:hover {
      background: rgb(24 24 27);
      border-color: rgb(167 139 250);
      color: rgb(196 181 253);
    }

    .pf-badge-add-btn--prominent {
      width: 100%;
      justify-content: center;
      padding: 1rem 1.25rem;
      background: rgb(124 58 237);
      border-color: rgb(124 58 237);
      color: rgb(255 255 255);
      font-weight: 600;
    }

    .pf-badge-add-btn--prominent:hover {
      background: rgb(109 40 217);
      border-color: rgb(109 40 217);
    }

    :host-context(.dark) .pf-badge-add-btn--prominent {
      background: rgb(124 58 237);
      border-color: rgb(124 58 237);
    }

    :host-context(.dark) .pf-badge-add-btn--prominent:hover {
      background: rgb(139 92 246);
      border-color: rgb(139 92 246);
    }

    .pf-empty-state {
      text-align: center;
      padding: 2rem 1.5rem;
      background: rgb(248 250 252);
      border: 1px dashed rgb(203 213 225);
      border-radius: 0.625rem;
    }

    :host-context(.dark) .pf-empty-state {
      background: rgb(24 24 27);
      border-color: rgb(63 63 70);
    }

    .pf-empty-state__text {
      margin: 0 0 1.25rem;
      color: rgb(100 116 139);
      font-size: 0.95rem;
    }

    :host-context(.dark) .pf-empty-state__text {
      color: rgb(161 161 170);
    }

    .trust-badge-toggle-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      user-select: none;
    }

    .trust-badge-toggle-input {
      width: 1rem;
      height: 1rem;
      cursor: pointer;
      accent-color: rgb(124 58 237);
    }

    .trust-badge-toggle-text {
      font-size: 0.875rem;
      color: rgb(71 85 105);
    }

    :host-context(.dark) .trust-badge-toggle-text {
      color: rgb(212 212 216);
    }
  `
})
export class TrustBadgesEditorSectionComponent {
  private readonly state = inject(PortfolioStateService);
  private readonly sectionState = inject(WebsiteSectionStateService);

  readonly draft = this.state.draft;
  readonly icon = ShieldCheck;
  readonly buffer = computed(() => this.sectionState.buffer<PortfolioTrustBadges>('trustBadges'));
  readonly iconOptions = TRUST_BADGE_ICON_OPTIONS;

  readonly upIcon = ChevronUp;
  readonly downIcon = ChevronDown;
  readonly deleteIcon = Trash2;
  readonly plusIcon = Plus;

  /**
   * Resolve icon component from icon name
   */
  resolveIcon(iconName: string): any {
    return resolveTrustBadgeIcon(iconName);
  }

  /**
   * Count active (enabled) badges
   */
  activeCount(): number {
    const b = this.draft()?.trustBadges;
    if (!b?.badges?.length) return 0;
    return b.badges.filter((badge) => badge.enabled).length;
  }

  /**
   * Patch trust badges settings
   */
  patch(partial: Partial<PortfolioTrustBadges>): void {
    this.sectionState.patchBuffer<PortfolioTrustBadges>('trustBadges', (b) => ({ ...b, ...partial }));
  }

  /**
   * Add a new badge
   */
  addBadge(): void {
    this.sectionState.patchBuffer<PortfolioTrustBadges>('trustBadges', (b) => {
      const newId = crypto.randomUUID();
      const order = (b.badges?.length ?? 0);
      const newBadge: TrustBadgeItem = {
        id: newId,
        title: '',
        icon: 'Shield',
        enabled: true,
        order
      };
      return {
        ...b,
        badges: [...(b.badges ?? []), newBadge]
      };
    });
  }

  /**
   * Delete a badge by ID
   */
  deleteBadge(id: string): void {
    this.sectionState.patchBuffer<PortfolioTrustBadges>('trustBadges', (b) => ({
      ...b,
      badges: (b.badges ?? []).filter((badge) => badge.id !== id).map((badge, i) => ({ ...badge, order: i }))
    }));
  }

  /**
   * Update a badge by ID
   */
  updateBadge(id: string, updates: Partial<TrustBadgeItem>): void {
    this.sectionState.patchBuffer<PortfolioTrustBadges>('trustBadges', (b) => ({
      ...b,
      badges: (b.badges ?? []).map((badge) => (badge.id === id ? { ...badge, ...updates } : badge))
    }));
  }

  /**
   * Move badge up in order
   */
  moveBadgeUp(id: string): void {
    this.sectionState.patchBuffer<PortfolioTrustBadges>('trustBadges', (b) => {
      const badges = [...(b.badges ?? [])];
      const idx = badges.findIndex((badge) => badge.id === id);
      if (idx > 0) {
        const temp = badges[idx];
        badges[idx] = badges[idx - 1];
        badges[idx - 1] = temp;
        return {
          ...b,
          badges: badges.map((badge, i) => ({ ...badge, order: i }))
        };
      }
      return b;
    });
  }

  /**
   * Move badge down in order
   */
  moveBadgeDown(id: string): void {
    this.sectionState.patchBuffer<PortfolioTrustBadges>('trustBadges', (b) => {
      const badges = [...(b.badges ?? [])];
      const idx = badges.findIndex((badge) => badge.id === id);
      if (idx < badges.length - 1) {
        const temp = badges[idx];
        badges[idx] = badges[idx + 1];
        badges[idx + 1] = temp;
        return {
          ...b,
          badges: badges.map((badge, i) => ({ ...badge, order: i }))
        };
      }
      return b;
    });
  }
}
