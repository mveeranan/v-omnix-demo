import { Component, inject, OnInit } from '@angular/core';
import { AdminPageShellComponent } from '../shared/admin-page-shell.component';
import { AdminProfileStateService } from '../data-access/admin-profile-state.service';
import { BusinessProfileFormSectionComponent } from '../sections/business-profile-form-section.component';
import { BusinessProfileExtensionSectionComponent } from '../sections/business-profile-extension-section.component';
import { pageFadeIn } from '../animations/admin.animations';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [
    AdminPageShellComponent,
    BusinessProfileFormSectionComponent,
    BusinessProfileExtensionSectionComponent
  ],
  templateUrl: './admin-profile.component.html',
  styleUrl: './admin-profile.component.scss',
  animations: [pageFadeIn]
})
export class AdminProfileComponent implements OnInit {
  readonly profileState = inject(AdminProfileStateService);

  ngOnInit(): void {
    this.profileState.load();
  }
}
