import { CommonModule } from '@angular/common';
import { Component, input, model, output } from '@angular/core';
import {
  LucideAngularModule,
  ChevronDown,
  Check,
  Pencil,
  Save,
  X,
  LucideIconData
} from 'lucide-angular';

@Component({
  selector: 'app-admin-form-section-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="pf-editor-card admin-form-section-card">
      <div class="pf-editor-card__header admin-form-section-card__header">
        <button
          type="button"
          class="admin-form-section-card__toggle"
          (click)="expanded.set(!expanded())"
          [attr.aria-expanded]="expanded()"
        >
          @if (icon()) {
            <lucide-icon [img]="icon()!" class="pf-editor-card__icon h-5 w-5 shrink-0" />
          }
          <span class="pf-editor-card__title">{{ title() }}</span>
          @if (subtitle()) {
            <span class="admin-form-section-card__subtitle">{{ subtitle() }}</span>
          }
          @if (complete()) {
            <lucide-icon [img]="checkIcon" class="h-4 w-4 shrink-0 text-emerald-500" />
          }
          <lucide-icon
            [img]="chevronIcon"
            class="h-5 w-5 shrink-0 opacity-50 transition-transform duration-200"
            [class.rotate-180]="expanded()"
          />
        </button>

        <div class="admin-form-section-card__actions" (click)="$event.stopPropagation()">
          @if (!editing()) {
            <button
              type="button"
              class="admin-form-section-card__action"
              (click)="onEdit()"
              [attr.aria-label]="'Edit ' + title()"
            >
              <lucide-icon [img]="editIcon" class="h-4 w-4" />
            </button>
          } @else {
            <button
              type="button"
              class="admin-form-section-card__action admin-form-section-card__action--save"
              (click)="save.emit()"
              [disabled]="saving() || !canSave()"
              [attr.aria-label]="'Save ' + title()"
            >
              <lucide-icon [img]="saveIcon" class="h-4 w-4" />
            </button>
            <button
              type="button"
              class="admin-form-section-card__action"
              (click)="cancel.emit()"
              [disabled]="saving()"
              aria-label="Cancel editing"
            >
              <lucide-icon [img]="cancelIcon" class="h-4 w-4" />
            </button>
          }
        </div>
      </div>

      @if (expanded()) {
        <div class="pf-editor-card__body">
          @if (lastSavedAt()) {
            <p class="admin-form-section-card__hint pf-editor-hint">
              Last saved {{ lastSavedAt() | date: 'short' }}
            </p>
          }
          <ng-content />
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .admin-form-section-card__header {
      display: flex;
      align-items: stretch;
      gap: 0;
      padding: 0;
    }

    .admin-form-section-card__toggle {
      display: flex;
      flex: 1;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 0.5rem 0.75rem 1rem;
      text-align: left;
      color: inherit;
      background: transparent;
      border: none;
      cursor: pointer;
      min-width: 0;
    }

    .admin-form-section-card__toggle:hover {
      background: rgb(248 250 252);
    }

    :host-context(.dark) .admin-form-section-card__toggle:hover {
      background: rgb(39 39 42);
    }

    .admin-form-section-card__subtitle {
      font-size: 0.75rem;
      font-weight: 400;
      color: rgb(100 116 139);
      margin-left: auto;
      margin-right: 0.25rem;
    }

    :host-context(.dark) .admin-form-section-card__subtitle {
      color: rgb(161 161 170);
    }

    .admin-form-section-card__actions {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.5rem 0.75rem 0.5rem 0;
    }

    .admin-form-section-card__action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 2rem;
      width: 2rem;
      border-radius: 0.5rem;
      border: 1px solid rgb(226 232 240);
      background: rgb(255 255 255);
      color: rgb(79 70 229);
      cursor: pointer;
      transition: background 0.15s ease, border-color 0.15s ease;
    }

    :host-context(.dark) .admin-form-section-card__action {
      border-color: rgb(63 63 70);
      background: rgb(39 39 42);
      color: rgb(165 180 252);
    }

    .admin-form-section-card__action:hover:not(:disabled) {
      background: rgb(238 242 255);
      border-color: rgb(199 210 254);
    }

    :host-context(.dark) .admin-form-section-card__action:hover:not(:disabled) {
      background: rgb(46 16 101);
      border-color: rgb(99 102 241);
    }

    .admin-form-section-card__action:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .admin-form-section-card__action--save {
      background: linear-gradient(135deg, rgb(99 102 241), rgb(139 92 246));
      border-color: transparent;
      color: white;
    }

    .admin-form-section-card__action--save:hover:not(:disabled) {
      filter: brightness(1.05);
    }

    .admin-form-section-card__hint {
      margin-bottom: 0.75rem;
    }
  `
})
export class AdminFormSectionCardComponent {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly icon = input<LucideIconData | null>(null);
  readonly complete = input(false);
  readonly expanded = model(true);
  readonly editing = input(false);
  readonly saving = input(false);
  readonly canSave = input(true);
  readonly lastSavedAt = input<Date | null>(null);

  readonly save = output<void>();
  readonly cancel = output<void>();
  readonly edit = output<void>();

  readonly chevronIcon = ChevronDown;
  readonly checkIcon = Check;
  readonly editIcon = Pencil;
  readonly saveIcon = Save;
  readonly cancelIcon = X;

  onEdit(): void {
    this.expanded.set(true);
    this.edit.emit();
  }
}
