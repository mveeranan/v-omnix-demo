import { Component, computed, inject, OnInit } from '@angular/core';
import { AdminPageShellComponent } from '../shared/admin-page-shell.component';
import { AdminProfileStateService } from '../data-access/admin-profile-state.service';
import { BusinessProfileFormSectionComponent } from '../sections/business-profile-form-section.component';
import { pageFadeIn } from '../animations/admin.animations';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [AdminPageShellComponent, BusinessProfileFormSectionComponent],
  templateUrl: './admin-profile.component.html',
  styleUrl: './admin-profile.component.scss',
  animations: [pageFadeIn]
})
export class AdminProfileComponent implements OnInit {
  readonly profileState = inject(AdminProfileStateService);
  readonly loading = computed(() => !this.profileState.formsReady());

  ngOnInit(): void {
    this.profileState.load();
  }
}
