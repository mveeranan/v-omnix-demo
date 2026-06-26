import { afterNextRender, Component, effect, inject, Injector, signal } from '@angular/core';
import { Image } from 'lucide-angular';
import { AdminFormSectionCardComponent } from '@features/admin/shared/admin-form-section-card.component';
import { NotificationService } from '@core/notifications/notification.service';
import { PendingImageUpload, SaveProductImageItem } from '@features/catalog/models/product-admin.model';
import { ProductAdminService } from '../data-access/product-admin.service';
import { ProductFormStateService } from '../data-access/product-form-state.service';

@Component({
  selector: 'app-product-images-section',
  standalone: true,
  imports: [AdminFormSectionCardComponent],
  template: `
    <app-admin-form-section-card
      title="Media"
      [icon]="sectionIcon"
      [disabled]="!state.sectionsEnabled()"
      [complete]="isComplete()"
      [(expanded)]="expanded"
      [editing]="editing()"
      [saving]="state.isSectionSaving('images')"
      [canSave]="!!state.productId()"
      [lastSavedAt]="state.sectionLastSaved('images')"
      (edit)="startEdit()"
      (save)="save()"
      (cancel)="cancelEdit()"
    >
      @if (!editing() && state.product()) {
        <div class="flex flex-wrap gap-3">
          @for (img of state.product()!.images; track img.id) {
            <div class="rounded-lg border border-[var(--border)] p-2">
              <img [src]="img.url" alt="" class="h-20 w-20 rounded object-cover" />
              @if (img.isPrimary) {
                <p class="mt-1 text-center text-xs text-[var(--text-muted)]">Primary</p>
              }
            </div>
          }
          @if (!state.product()!.images.length) {
            <p class="text-sm text-[var(--text-muted)]">No images yet.</p>
          }
        </div>
      } @else {
        <div class="space-y-4">
          <label class="block space-y-1">
            <span class="text-sm font-medium">Upload images</span>
            <input type="file" accept="image/*" multiple class="pf-editor-input w-full" (change)="onFilesSelected($event)" />
          </label>
          @if (existingImages().length) {
            <div class="space-y-2">
              <p class="text-sm font-medium">Existing images</p>
              @for (img of existingImages(); track img.id ?? img.documentId) {
                <div class="flex items-center gap-3 rounded-lg border border-[var(--border)] p-2">
                  <img [src]="img.url || ''" alt="" class="h-12 w-12 rounded object-cover" />
                  <span class="flex-1 text-sm">{{ img.altText || 'Image' }}</span>
                  <label class="text-xs">
                    <input type="radio" name="primary" [checked]="img.isPrimary" (change)="setPrimaryExisting(img)" /> Primary
                  </label>
                </div>
              }
            </div>
          }
          @if (pendingImages().length) {
            <div class="space-y-2">
              <p class="text-sm font-medium">Pending uploads</p>
              @for (img of pendingImages(); track $index) {
                <div class="flex items-center gap-3 rounded-lg border border-[var(--border)] p-2">
                  <span class="flex-1 truncate text-sm">{{ img.file.name }}</span>
                  <label class="text-xs">
                    <input type="radio" name="primaryPending" [checked]="img.isPrimary" (change)="setPrimaryPending($index)" /> Primary
                  </label>
                  <button type="button" class="text-xs text-rose-600" (click)="removePending($index)">Remove</button>
                </div>
              }
            </div>
          }
        </div>
      }
    </app-admin-form-section-card>
  `
})
export class ProductImagesSectionComponent {
  readonly state = inject(ProductFormStateService);
  private readonly api = inject(ProductAdminService);
  private readonly notifications = inject(NotificationService);
  private readonly injector = inject(Injector);

  readonly sectionIcon = Image;
  readonly expanded = signal(false);
  readonly editing = signal(false);
  readonly existingImages = signal<(SaveProductImageItem & { url?: string })[]>([]);
  readonly pendingImages = signal<PendingImageUpload[]>([]);

  constructor() {
    effect(() => {
      const p = this.state.product();
      if (p && !this.editing()) {
        this.patchFromProduct();
      }
    });
  }

  isComplete(): boolean {
    return (this.state.product()?.images.length ?? 0) > 0;
  }

  startEdit(): void {
    this.editing.set(true);
    afterNextRender(
      () => this.patchFromProduct(),
      { injector: this.injector }
    );
  }

  cancelEdit(): void {
    this.patchFromProduct();
    this.pendingImages.set([]);
    this.editing.set(false);
  }

  save(): void {
    const productId = this.state.productId();
    if (!productId) return;

    this.state.setSectionSaving('images', true);
    const existing = this.existingImages().map(({ id, documentId, altText, sortOrder, isPrimary }) => ({
      id,
      documentId,
      altText,
      sortOrder,
      isPrimary
    }));
    this.api.saveImages(productId, existing, this.pendingImages()).subscribe({
      next: (saved) => {
        this.state.setSectionSaving('images', false);
        this.state.markSectionSaved('images');
        this.pendingImages.set([]);
        if (saved) this.state.mergeProduct(saved);
        this.editing.set(false);
        this.notifications.success('Media saved');
      },
      error: (err) => {
        this.state.setSectionSaving('images', false);
        this.notifications.errorFromApi(err, 'Could not save media');
      }
    });
  }

  private patchFromProduct(): void {
    const p = this.state.product();
    if (!p) return;
    this.existingImages.set(
      p.images.map((img) => ({
        id: img.id,
        documentId: img.documentId,
        altText: img.altText,
        sortOrder: img.sortOrder,
        isPrimary: img.isPrimary,
        url: img.url
      }))
    );
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    const startOrder = this.existingImages().length + this.pendingImages().length;
    const newPending: PendingImageUpload[] = files.map((file, i) => ({
      file,
      altText: file.name,
      sortOrder: startOrder + i,
      isPrimary: this.existingImages().length === 0 && this.pendingImages().length === 0 && i === 0
    }));
    this.pendingImages.update((prev) => [...prev, ...newPending]);
    input.value = '';
  }

  setPrimaryExisting(img: SaveProductImageItem & { url?: string }): void {
    this.existingImages.update((items) =>
      items.map((i) => ({ ...i, isPrimary: i.documentId === img.documentId }))
    );
    this.pendingImages.update((items) => items.map((i) => ({ ...i, isPrimary: false })));
  }

  setPrimaryPending(index: number): void {
    this.pendingImages.update((items) =>
      items.map((i, idx) => ({ ...i, isPrimary: idx === index }))
    );
    this.existingImages.update((items) => items.map((i) => ({ ...i, isPrimary: false })));
  }

  removePending(index: number): void {
    this.pendingImages.update((items) => items.filter((_, i) => i !== index));
  }
}
