import { Component, input } from '@angular/core';
import { LucideAngularModule, Plus, type LucideIconData } from 'lucide-angular';

@Component({
  selector: 'app-admin-section-placeholder',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './admin-section-placeholder.component.html'
})
export class AdminSectionPlaceholderComponent {
  readonly icon = input.required<LucideIconData>();
  readonly actionLabel = input('Create new');
  readonly hint = input('This section is ready for your data. Connect your API or start adding records.');

  readonly plusIcon = Plus;
}
