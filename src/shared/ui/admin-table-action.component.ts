import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Copy, Eye, Pencil, Trash2 } from 'lucide-angular';

export type AdminTableActionVariant = 'edit' | 'duplicate' | 'delete' | 'view';

@Component({
  selector: 'app-admin-table-action',
  standalone: true,
  styleUrl: './admin-table-action.component.scss',
  imports: [RouterLink, LucideAngularModule],
  template: `
    @if (routerLink(); as link) {
      <a [routerLink]="link" class="admin-table-action" [class]="actionClass()">
        <lucide-icon [img]="icon()" [size]="14" [strokeWidth]="2" />
        <span class="admin-table-action__label">{{ label() }}</span>
      </a>
    } @else {
      <button type="button" class="admin-table-action" [class]="actionClass()" (click)="action.emit()">
        <lucide-icon [img]="icon()" [size]="14" [strokeWidth]="2" />
        <span class="admin-table-action__label">{{ label() }}</span>
      </button>
    }
  `
})
export class AdminTableActionComponent {
  readonly label = input.required<string>();
  readonly variant = input<AdminTableActionVariant>('edit');
  readonly routerLink = input<string | string[] | null>(null);
  readonly action = output<void>();

  readonly editIcon = Pencil;
  readonly duplicateIcon = Copy;
  readonly deleteIcon = Trash2;
  readonly viewIcon = Eye;

  icon(): typeof Pencil {
    switch (this.variant()) {
      case 'duplicate':
        return this.duplicateIcon;
      case 'delete':
        return this.deleteIcon;
      case 'view':
        return this.viewIcon;
      default:
        return this.editIcon;
    }
  }

  actionClass(): string {
    return `admin-table-action--${this.variant()}`;
  }
}
