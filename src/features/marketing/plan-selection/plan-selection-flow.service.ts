import { Injectable } from '@angular/core';
import { PhoneNumberValue } from '@shared/models/phone-number.model';

export interface PendingRegistration {
  firstName: string;
  lastName: string;
  phone: PhoneNumberValue;
  email: string;
  password: string;
  businessName: string;
  businessTypeId: string;
  description: string;
  acceptTerms: boolean;
  logoPreviewUrl: string | null;
}

@Injectable({ providedIn: 'root' })
export class PlanSelectionFlowService {
  private pendingRegistration: PendingRegistration | null = null;
  private businessLogoFile: File | null = null;
  private preselectedPlanId = '';

  setPendingRegistration(data: PendingRegistration, logoFile: File | null): void {
    this.pendingRegistration = data;
    this.businessLogoFile = logoFile;
  }

  getPendingRegistration(): PendingRegistration | null {
    return this.pendingRegistration;
  }

  getBusinessLogoFile(): File | null {
    return this.businessLogoFile;
  }

  hasPendingRegistration(): boolean {
    return this.pendingRegistration !== null;
  }

  clearPendingRegistration(): void {
    if (this.pendingRegistration?.logoPreviewUrl) {
      URL.revokeObjectURL(this.pendingRegistration.logoPreviewUrl);
    }
    this.pendingRegistration = null;
    this.businessLogoFile = null;
  }

  setPreselectedPlanId(planId: string): void {
    this.preselectedPlanId = planId.trim();
  }

  getPreselectedPlanId(): string {
    return this.preselectedPlanId;
  }

  clearPreselectedPlanId(): void {
    this.preselectedPlanId = '';
  }
}
