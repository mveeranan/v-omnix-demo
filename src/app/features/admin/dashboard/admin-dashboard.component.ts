import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, Trash2 } from 'lucide-angular';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
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
  readonly trashIcon = Trash2;
  businessLogoPreview = '';
  businessLogoFile: File | null = null;
  isLogoDragOver = false;

  readonly setupForm = this.fb.nonNullable.group({
    businessName: ['', [Validators.required]],
    businessType: ['', [Validators.required]],
    workspaceDetails: ['', [Validators.required, Validators.minLength(10)]],
    businessLogo: [null as File | null]
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

  onBusinessLogoPicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    this.applyBusinessLogo(file);
  }

  onLogoDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isLogoDragOver = true;
  }

  onLogoDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isLogoDragOver = false;
  }

  onLogoDrop(event: DragEvent): void {
    event.preventDefault();
    this.isLogoDragOver = false;
    const file = event.dataTransfer?.files?.[0];
    if (!file) {
      return;
    }
    this.applyBusinessLogo(file);
  }

  clearBusinessLogo(fileInput?: HTMLInputElement | null): void {
    this.businessLogoFile = null;
    this.businessLogoPreview = '';
    this.setupForm.patchValue({ businessLogo: null });
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /** Display-only (not sent to the API). */
  formatFileSize(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes < 0) {
      return '';
    }
    if (bytes === 0) {
      return '0 B';
    }
    const units = ['B', 'KB', 'MB', 'GB'] as const;
    let n = bytes;
    let i = 0;
    while (n >= 1024 && i < units.length - 1) {
      n /= 1024;
      i++;
    }
    const decimals = i === 0 ? 0 : n >= 10 ? 1 : 2;
    return `${n.toFixed(decimals)} ${units[i]}`;
  }

  private applyBusinessLogo(file: File): void {
    if (!file.type.startsWith('image/')) {
      return;
    }

    this.businessLogoFile = file;
    this.setupForm.patchValue({ businessLogo: file });
    const reader = new FileReader();
    reader.onload = () => {
      this.businessLogoPreview = typeof reader.result === 'string' ? reader.result : '';
    };
    reader.readAsDataURL(file);
  }
}
