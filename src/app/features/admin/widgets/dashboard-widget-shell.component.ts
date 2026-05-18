import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LucideAngularModule, Inbox } from 'lucide-angular';

@Component({
  selector: 'app-dashboard-widget-shell',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dashboard-widget-shell.component.html',
  styleUrl: './dashboard-widget-shell.component.scss'
})
export class DashboardWidgetShellComponent {
  @Input({ required: true }) title = '';
  @Input() loading = false;
  @Input() empty = false;
  @Input() emptyMessage = 'No data available yet.';
  @Input() className = '';

  readonly emptyIcon = Inbox;
}
