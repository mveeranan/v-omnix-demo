import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly selectedPlanId = this.route.snapshot.queryParamMap.get('planId') ?? 'starter';
  readonly showOnboarding = signal(this.route.snapshot.queryParamMap.get('setupIncomplete') === '1');
  readonly onboardingStep = signal(1);
  readonly totalSteps = 4;
  readonly progress = computed(() => Math.round((this.onboardingStep() / this.totalSteps) * 100));

  readonly setupForm = this.fb.nonNullable.group({
    businessName: ['', [Validators.required]],
    businessType: ['', [Validators.required]],
    workspaceDetails: ['', [Validators.required, Validators.minLength(10)]]
  });

  nextStep(): void {
    if (this.onboardingStep() === 1 && this.setupForm.controls.businessName.invalid) {
      this.setupForm.controls.businessName.markAsTouched();
      return;
    }
    if (this.onboardingStep() === 2 && this.setupForm.controls.businessType.invalid) {
      this.setupForm.controls.businessType.markAsTouched();
      return;
    }
    if (this.onboardingStep() === 3 && this.setupForm.controls.workspaceDetails.invalid) {
      this.setupForm.controls.workspaceDetails.markAsTouched();
      return;
    }
    this.onboardingStep.update((value) => Math.min(value + 1, this.totalSteps));
  }

  previousStep(): void {
    this.onboardingStep.update((value) => Math.max(value - 1, 1));
  }

  completeSetup(): void {
    this.showOnboarding.set(false);
    this.router.navigate([], {
      queryParams: { setupIncomplete: null },
      queryParamsHandling: 'merge'
    });
  }

  skipForNow(): void {
    this.showOnboarding.set(false);
  }
}
