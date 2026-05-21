import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { LucideAngularModule, Upload, X } from 'lucide-angular';

@Component({
  selector: 'app-media-upload-zone',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="space-y-2">
      @if (displayUrl()) {
        <div class="pf-editor-upload-preview">
          <img [src]="displayUrl()" [alt]="label()" />
          <button
            type="button"
            class="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
            (click)="clearPreview()"
            [disabled]="disabled()"
            aria-label="Remove image"
          >
            <lucide-icon [img]="xIcon" class="h-4 w-4" />
          </button>
        </div>
        @if (singleSlot()) {
          <p class="pf-editor-hint">Remove the image above to upload a different one.</p>
        }
      } @else if (!disabled()) {
        <label
          class="pf-editor-upload-zone"
          [class.is-dragover]="isDragOver()"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
        >
          <lucide-icon [img]="uploadIcon" class="h-6 w-6 opacity-50" />
          <span>{{ label() }}</span>
          <span class="pf-editor-hint">Drag & drop or click to upload</span>
          <input #fileInput type="file" class="hidden" [accept]="accept()" (change)="onFileSelect($event)" />
        </label>
      } @else {
        <p class="pf-editor-hint">No image uploaded.</p>
      }
    </div>
  `
})
export class MediaUploadZoneComponent {
  readonly label = input('Upload image');
  readonly accept = input('image/*');
  readonly previewUrl = input<string>('');
  readonly singleSlot = input(true);
  readonly disabled = input(false);
  /** When true, preview is cleared after emit so the zone is ready for the next upload (e.g. gallery). */
  readonly clearAfterSelect = input(false);

  readonly fileSelected = output<{ file: File; dataUrl: string }>();
  readonly cleared = output<void>();

  readonly uploadIcon = Upload;
  readonly xIcon = X;
  readonly isDragOver = signal(false);
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');
  private readonly localPreview = signal('');

  readonly displayUrl = computed(() => this.localPreview() || this.previewUrl());

  clearPreview(): void {
    if (this.disabled()) return;
    this.localPreview.set('');
    this.resetFileInput();
    this.cleared.emit();
  }

  private resetFileInput(): void {
    const input = this.fileInput()?.nativeElement;
    if (input) input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    if (this.disabled()) return;
    const file = event.dataTransfer?.files?.[0];
    if (file) this.processFile(file);
  }

  onFileSelect(event: Event): void {
    if (this.disabled()) return;
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.processFile(file);
  }

  private processFile(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (!this.clearAfterSelect()) {
        this.localPreview.set(dataUrl);
      }
      this.fileSelected.emit({ file, dataUrl });
      if (this.clearAfterSelect()) {
        this.localPreview.set('');
        this.resetFileInput();
      }
    };
    reader.readAsDataURL(file);
  }
}
