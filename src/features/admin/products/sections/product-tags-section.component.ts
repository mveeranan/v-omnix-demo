import { afterNextRender, Component, effect, inject, Injector, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Tags } from 'lucide-angular';
import { AdminFormSectionCardComponent } from '@features/admin/shared/admin-form-section-card.component';
import { NotificationService } from '@core/notifications/notification.service';
import { ProductAdminService } from '../data-access/product-admin.service';
import { ProductFormStateService } from '../data-access/product-form-state.service';

@Component({
  selector: 'app-product-tags-section',
  standalone: true,
  imports: [RouterLink, AdminFormSectionCardComponent],
  template: `
    <app-admin-form-section-card
      title="Tags"
      [icon]="sectionIcon"
      [disabled]="!state.sectionsEnabled()"
      [complete]="isComplete()"
      [(expanded)]="expanded"
      [editing]="editing()"
      [saving]="state.isSectionSaving('tags')"
      [canSave]="!!state.productId()"
      [lastSavedAt]="state.sectionLastSaved('tags')"
      (edit)="startEdit()"
      (save)="save()"
      (cancel)="cancelEdit()"
    >
      @if (!editing() && state.product()) {
        <div class="flex flex-wrap gap-2">
          @for (tag of selectedTags(); track tag.id) {
            <span class="rounded-lg border border-[var(--border)] px-2 py-1 text-sm">{{ tag.name }}</span>
          }
          @if (!selectedTags().length) {
            <p class="text-sm text-[var(--text-muted)]">No tags assigned.</p>
          }
        </div>
      } @else {
        <div class="flex flex-wrap gap-2">
          @for (tag of state.tags(); track tag.id) {
            <label class="flex items-center gap-1 rounded-lg border border-[var(--border)] px-2 py-1 text-sm">
              <input type="checkbox" [checked]="selectedTagIds().has(tag.id)" (change)="toggleTag(tag.id)" />
              {{ tag.name }}
            </label>
          }
          @if (!state.tags().length) {
            <p class="text-sm text-[var(--text-muted)]">
              No tags yet. <a routerLink="/admin/product-tags" class="underline">Create tags</a>
            </p>
          }
        </div>
      }
    </app-admin-form-section-card>
  `
})
export class ProductTagsSectionComponent {
  readonly state = inject(ProductFormStateService);
  private readonly api = inject(ProductAdminService);
  private readonly notifications = inject(NotificationService);
  private readonly injector = inject(Injector);

  readonly sectionIcon = Tags;
  readonly expanded = signal(false);
  readonly editing = signal(false);
  readonly selectedTagIds = signal(new Set<string>());

  constructor() {
    effect(() => {
      const p = this.state.product();
      this.state.tags();
      if (p && !this.editing()) {
        this.selectedTagIds.set(new Set(p.tagIds));
      }
    });
  }

  selectedTags() {
    const ids = this.state.product()?.tagIds ?? [];
    return this.state.tags().filter((t) => ids.includes(t.id));
  }

  isComplete(): boolean {
    return (this.state.product()?.tagIds.length ?? 0) > 0;
  }

  startEdit(): void {
    this.editing.set(true);
    afterNextRender(
      () => {
        const p = this.state.product();
        if (p) this.selectedTagIds.set(new Set(p.tagIds));
      },
      { injector: this.injector }
    );
  }

  cancelEdit(): void {
    const p = this.state.product();
    if (p) this.selectedTagIds.set(new Set(p.tagIds));
    this.editing.set(false);
  }

  toggleTag(id: string): void {
    const next = new Set(this.selectedTagIds());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.selectedTagIds.set(next);
  }

  save(): void {
    const productId = this.state.productId();
    if (!productId) return;

    this.state.setSectionSaving('tags', true);
    this.api.saveTags(productId, [...this.selectedTagIds()]).subscribe({
      next: (saved) => {
        this.state.setSectionSaving('tags', false);
        this.state.markSectionSaved('tags');
        this.state.mergeProduct(saved);
        this.editing.set(false);
        this.notifications.success('Tags saved');
      },
      error: (err) => {
        this.state.setSectionSaving('tags', false);
        this.notifications.errorFromApi(err, 'Could not save tags');
      }
    });
  }
}
