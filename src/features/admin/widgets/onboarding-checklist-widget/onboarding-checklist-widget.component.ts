import { Component, inject, OnInit } from '@angular/core';
import { LucideAngularModule, Check, Circle } from 'lucide-angular';
import { OnboardingService } from '../../services/onboarding.service';

@Component({
  selector: 'app-onboarding-checklist-widget',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <article class="admin-glass-card h-full rounded-xl p-5">
      <header class="mb-4">
        <h3 class="text-sm font-semibold text-[var(--text-primary)]">Setup checklist</h3>
        <p class="text-xs text-[var(--text-secondary)]">{{ onboarding.completionPercent() }}% complete</p>
        <div class="mt-2 h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            class="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all"
            [style.width.%]="onboarding.completionPercent()"
          ></div>
        </div>
      </header>
      <ul class="space-y-2">
        @for (step of onboarding.steps(); track step.id) {
          <li>
            <button
              type="button"
              class="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              (click)="onboarding.navigate(step)"
            >
              @if (step.done) {
                <lucide-icon [img]="checkIcon" class="h-4 w-4 shrink-0 text-emerald-500" />
              } @else {
                <lucide-icon [img]="circleIcon" class="h-4 w-4 shrink-0 text-zinc-400" />
              }
              <span [class.line-through]="step.done" [class.text-[var(--text-secondary)]]="step.done">{{ step.label }}</span>
            </button>
          </li>
        }
      </ul>
    </article>
  `
})
export class OnboardingChecklistWidgetComponent implements OnInit {
  readonly onboarding = inject(OnboardingService);
  readonly checkIcon = Check;
  readonly circleIcon = Circle;

  ngOnInit(): void {
    this.onboarding.refresh();
  }
}
