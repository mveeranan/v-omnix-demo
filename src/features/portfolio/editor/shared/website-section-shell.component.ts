import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, model } from '@angular/core';
import { LucideIconData } from 'lucide-angular';
import { AdminFormSectionCardComponent } from '../../../admin/shared/admin-form-section-card.component';
import { WebsiteSectionId } from '../../models/website-section.ids';
import { WebsiteSectionStateService } from '../../data-access/website-section-state.service';

@Component({
  selector: 'app-website-section-shell',
  standalone: true,
  imports: [CommonModule, AdminFormSectionCardComponent],
  host: {
    class: 'wb-section-card',
    '[class.wb-section-card--dirty]': 'isDirty()'
  },
  template: `
    <app-admin-form-section-card
      [title]="title()"
      [subtitle]="subtitle()"
      [icon]="icon()"
      [complete]="complete()"
      [(expanded)]="expanded"
      [editing]="editing()"
      [saving]="saving()"
      [showClear]="editing()"
      [lastSavedAt]="lastSavedAt()"
      (edit)="onEdit()"
      (save)="onSave()"
      (cancel)="onCancel()"
      (clear)="onClear()"
    >
      @if (error()) {
        <p class="pf-editor-error" role="alert">{{ error() }}</p>
      }
      @if (editing()) {
        <ng-content select="[edit]" />
      } @else {
        <ng-content select="[view]" />
      }
    </app-admin-form-section-card>
  `,
  styles: `
    :host {
      display: block;
    }

    .pf-editor-error {
      margin: 0 0 0.75rem;
      padding: 0.5rem 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.8125rem;
      color: rgb(185 28 28);
      background: rgb(254 242 242);
      border: 1px solid rgb(254 202 202);
    }

    :host-context(.dark) .pf-editor-error {
      color: rgb(252 165 165);
      background: rgb(69 10 10);
      border-color: rgb(127 29 29);
    }
  `
})
export class WebsiteSectionShellComponent {
  readonly sectionState = inject(WebsiteSectionStateService);

  readonly sectionId = input.required<WebsiteSectionId>();
  readonly title = input.required<string>();
  readonly icon = input<LucideIconData | null>(null);
  readonly complete = input(false);
  readonly expanded = model(true);

  readonly isDirty = computed(() => this.sectionState.sectionMeta(this.sectionId()).dirty);
  readonly editing = computed(() => this.sectionState.isEditing(this.sectionId()));
  readonly saving = computed(() => this.sectionState.sectionMeta(this.sectionId()).saving);
  readonly lastSavedAt = computed(() => this.sectionState.sectionMeta(this.sectionId()).lastSavedAt);
  readonly error = computed(() => this.sectionState.sectionMeta(this.sectionId()).error);

  readonly subtitle = computed(() => {
    const meta = this.sectionState.sectionMeta(this.sectionId());
    if (meta.dirty) return 'Unsaved changes';
    if (meta.lastSavedAt) return '';
    return '';
  });

  onEdit(): void {
    this.sectionState.beginEdit(this.sectionId());
  }

  onSave(): void {
    this.sectionState.saveSection(this.sectionId());
  }

  onCancel(): void {
    this.sectionState.cancelSection(this.sectionId());
  }

  onClear(): void {
    this.sectionState.resetSection(this.sectionId());
  }
}
