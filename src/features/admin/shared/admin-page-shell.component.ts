import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { pageFadeIn } from '../animations/admin.animations';

@Component({
  selector: 'app-admin-page-shell',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './admin-page-shell.component.html',
  styleUrl: './admin-page-shell.component.scss',
  animations: [pageFadeIn]
})
export class AdminPageShellComponent {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
