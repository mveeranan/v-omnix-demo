import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Users, Plus, Trash2 } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { CollapsibleSectionCardComponent } from '../../shared/ui/collapsible-section-card.component';
import { SectionToggleComponent } from '../../shared/ui/section-toggle.component';
import { MediaUploadZoneComponent } from '../../shared/ui/media-upload-zone.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { PortfolioTeamMember } from '../../models/portfolio.model';

@Component({
  selector: 'app-team-editor-section',
  standalone: true,
  imports: [
    FormsModule,
    LucideAngularModule,
    CollapsibleSectionCardComponent,
    SectionToggleComponent,
    MediaUploadZoneComponent
  ],
  template: `
    <app-collapsible-section-card title="Team" [icon]="icon">
      @if (draft(); as d) {
        <div class="pf-editor-fields">
          <app-section-toggle label="Show team section" [enabled]="d.team.enabled" (enabledChange)="setTeamEnabled($event)" />
          @for (member of d.team.members; track member.id) {
            <div class="pf-editor-item-card">
              <div class="pf-editor-item-card__actions">
                <button type="button" class="text-red-500" (click)="remove(member.id)" aria-label="Remove member">
                  <lucide-icon [img]="trashIcon" class="h-4 w-4" />
                </button>
              </div>
              <div class="pf-editor-fields">
                <app-media-upload-zone
                  label="Photo"
                  [singleSlot]="true"
                  [previewUrl]="member.imageUrl"
                  (fileSelected)="setPhoto(member.id, $event.dataUrl)"
                  (cleared)="setPhoto(member.id, '')"
                />
                <div class="pf-editor-field">
                  <span class="pf-editor-label">Name</span>
                  <input class="pf-editor-input" [(ngModel)]="member.name" (ngModelChange)="sync()" />
                </div>
                <div class="pf-editor-field">
                  <span class="pf-editor-label">Role</span>
                  <input class="pf-editor-input" [(ngModel)]="member.role" (ngModelChange)="sync()" />
                </div>
                <div class="pf-editor-field">
                  <span class="pf-editor-label">Specialization</span>
                  <input class="pf-editor-input" [(ngModel)]="member.specialization" (ngModelChange)="sync()" />
                </div>
              </div>
            </div>
          }
          <button type="button" class="pf-editor-add-btn" (click)="add()">
            <lucide-icon [img]="plusIcon" class="h-4 w-4" /> Add team member
          </button>
        </div>
      }
    </app-collapsible-section-card>
  `
})
export class TeamEditorSectionComponent {
  private readonly state = inject(PortfolioStateService);
  readonly draft = this.state.draft;
  readonly icon = Users;
  readonly plusIcon = Plus;
  readonly trashIcon = Trash2;

  add(): void {
    const member: PortfolioTeamMember = {
      id: crypto.randomUUID(),
      imageUrl: '',
      name: '',
      role: '',
      specialization: '',
      instagram: ''
    };
    this.state.patchDraft((p) => ({
      ...p,
      team: { ...p.team, members: [...p.team.members, member] }
    }));
  }

  remove(id: string): void {
    this.state.patchDraft((p) => ({
      ...p,
      team: { ...p.team, members: p.team.members.filter((m) => m.id !== id) }
    }));
  }

  setPhoto(id: string, url: string): void {
    this.state.patchDraft((p) => ({
      ...p,
      team: {
        ...p.team,
        members: p.team.members.map((m) => (m.id === id ? { ...m, imageUrl: url } : m))
      }
    }));
  }

  setTeamEnabled(enabled: boolean): void {
    this.state.patchDraft((p) => ({ ...p, team: { ...p.team, enabled } }));
  }

  sync(): void {
    this.state.patchDraft((p) => ({ ...p }));
  }
}
