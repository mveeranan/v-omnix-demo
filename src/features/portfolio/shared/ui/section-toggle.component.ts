import { Component, input, model } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-section-toggle',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <label class="pf-editor-toggle">
      <span>{{ label() }}</span>
      <div class="pf-toggle-switch" [class.active]="enabled()">
        <button
          type="button"
          class="pf-toggle-track"
          (click)="enabled.set(!enabled())"
          [attr.aria-label]="'Toggle ' + label()"
          [attr.aria-pressed]="enabled()"
        >
          <span class="pf-toggle-thumb"></span>
          <lucide-icon
            *ngIf="enabled()"
            name="check"
            class="pf-toggle-icon pf-toggle-icon--on"
          ></lucide-icon>
          <lucide-icon
            *ngIf="!enabled()"
            name="x"
            class="pf-toggle-icon pf-toggle-icon--off"
          ></lucide-icon>
        </button>
      </div>
    </label>
  `,
  styles: `
    .pf-editor-toggle {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.75rem;
      cursor: pointer;
      user-select: none;
    }

    .pf-editor-toggle span {
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--text-primary, #23232d);
    }

    .pf-toggle-switch {
      position: relative;
    }

    .pf-toggle-track {
      position: relative;
      width: 3.25rem;
      height: 1.75rem;
      background-color: #d1d5db;
      border: none;
      border-radius: 999px;
      cursor: pointer;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.3s ease;
      outline: none;
    }

    .pf-toggle-track:focus-visible {
      outline: 2px solid var(--accent, #fe4c50);
      outline-offset: 2px;
    }

    .pf-toggle-switch.active .pf-toggle-track {
      background-color: var(--accent, #fe4c50);
    }

    .pf-toggle-thumb {
      position: absolute;
      left: 0.25rem;
      width: 1.25rem;
      height: 1.25rem;
      background-color: white;
      border-radius: 50%;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .pf-toggle-switch.active .pf-toggle-thumb {
      left: calc(100% - 1.5rem);
    }

    .pf-toggle-icon {
      position: absolute;
      width: 1rem;
      height: 1rem;
      color: white;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .pf-toggle-icon--on {
      left: 0.4rem;
    }

    .pf-toggle-switch.active .pf-toggle-icon--on {
      opacity: 1;
    }

    .pf-toggle-icon--off {
      right: 0.4rem;
    }

    .pf-toggle-switch:not(.active) .pf-toggle-icon--off {
      opacity: 1;
    }
  `
})
export class SectionToggleComponent {
  readonly label = input('Show on portfolio');
  readonly enabled = model(true);
}
