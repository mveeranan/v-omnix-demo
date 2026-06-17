import { Component, input } from '@angular/core';
import { LucideAngularModule, Plus, type LucideIconData } from 'lucide-angular';
import { AppButtonComponent } from '@shared/ui/app-button.component';
import { AppCardComponent } from '@shared/ui/app-card.component';
import { AppEmptyStateComponent } from '@shared/ui/app-empty-state.component';

@Component({
  selector: 'app-admin-section-placeholder',
  standalone: true,
  imports: [LucideAngularModule, AppCardComponent, AppEmptyStateComponent, AppButtonComponent],
  templateUrl: './admin-section-placeholder.component.html'
})
export class AdminSectionPlaceholderComponent {
  readonly icon = input.required<LucideIconData>();
  readonly actionLabel = input('Create new');
  readonly hint = input('This section is ready for your data. Connect your API or start adding records.');

  readonly plusIcon = Plus;
}
