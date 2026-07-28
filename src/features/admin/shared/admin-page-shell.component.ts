import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowLeft } from 'lucide-angular';
import { pageFadeIn } from '../animations/admin.animations';

@Component({
  selector: 'app-admin-page-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './admin-page-shell.component.html',
  styleUrl: './admin-page-shell.component.scss',
  animations: [pageFadeIn]
})
export class AdminPageShellComponent {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  /** Only detail/edit pages set this — list pages leave it unset and show no back link. */
  readonly backLink = input<string | string[] | null>(null);
  readonly backLabel = input('Back');

  readonly backIcon = ArrowLeft;
}
