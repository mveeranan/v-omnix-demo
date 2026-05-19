import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Briefcase, Plus, Trash2 } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { CollapsibleSectionCardComponent } from '../../shared/ui/collapsible-section-card.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { PortfolioServiceItem } from '../../models/portfolio.model';

@Component({
  selector: 'app-services-editor-section',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, CollapsibleSectionCardComponent],
  template: `
    <app-collapsible-section-card title="Services" [icon]="icon" [complete]="(draft()?.services?.length ?? 0) > 0">
      @if (draft(); as d) {
        <div class="pf-editor-fields">
          @for (service of d.services; track service.id) {
            <div class="pf-editor-item-card">
              <div class="pf-editor-item-card__actions">
                <button type="button" class="text-red-500" (click)="remove(service.id)" aria-label="Remove service">
                  <lucide-icon [img]="trashIcon" class="h-4 w-4" />
                </button>
              </div>
              <div class="pf-editor-fields-grid pf-editor-fields-grid--2">
                <div class="pf-editor-field">
                  <span class="pf-editor-label">Name</span>
                  <input class="pf-editor-input" [(ngModel)]="service.name" (ngModelChange)="sync()" />
                </div>
                <div class="pf-editor-field">
                  <span class="pf-editor-label">Category</span>
                  <input class="pf-editor-input" [(ngModel)]="service.category" (ngModelChange)="sync()" />
                </div>
                <div class="pf-editor-field">
                  <span class="pf-editor-label">Duration</span>
                  <input class="pf-editor-input" [(ngModel)]="service.duration" (ngModelChange)="sync()" />
                </div>
                <div class="pf-editor-field">
                  <span class="pf-editor-label">Price</span>
                  <input class="pf-editor-input" [(ngModel)]="service.price" (ngModelChange)="sync()" />
                </div>
              </div>
              <label class="pf-editor-checkbox">
                <input type="checkbox" [(ngModel)]="service.featured" (ngModelChange)="sync()" />
                <span>Featured</span>
              </label>
            </div>
          }
          <button type="button" class="pf-editor-add-btn" (click)="add()">
            <lucide-icon [img]="plusIcon" class="h-4 w-4" /> Add service
          </button>
        </div>
      }
    </app-collapsible-section-card>
  `
})
export class ServicesEditorSectionComponent {
  private readonly state = inject(PortfolioStateService);
  readonly draft = this.state.draft;
  readonly icon = Briefcase;
  readonly plusIcon = Plus;
  readonly trashIcon = Trash2;

  add(): void {
    const item: PortfolioServiceItem = {
      id: crypto.randomUUID(),
      name: '',
      duration: '',
      price: '',
      category: '',
      featured: false,
      enabled: true
    };
    this.state.patchDraft((p) => ({ ...p, services: [...p.services, item] }));
  }

  remove(id: string): void {
    this.state.patchDraft((p) => ({ ...p, services: p.services.filter((s) => s.id !== id) }));
  }

  sync(): void {
    this.state.patchDraft((p) => ({ ...p }));
  }
}
