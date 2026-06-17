import { Injectable, inject } from '@angular/core';
import { Observable, switchMap, from, map, of } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { BusinessProfileService } from '../../admin/data-access/business-profile.service';
import { PortfolioTenantStateService } from './portfolio-tenant-state.service';
import {
  BusinessProfileDto,
  BusinessProfileUpsertRequest
} from '../../admin/models/business-profile.model';
import { FileCategory } from '../../../shared/files/file-category.enum';
import {
  buildAttachmentFromDataUrl,
  buildUploadDocumentRequest,
  isDataUrl,
  UploadDocumentRequest
} from '../../../shared/files/upload-document.model';
import { BrandSectionBuffer } from './website-section-state.service';

export interface BrandPendingUploads {
  logoFile: File | null;
  storyImageFile: File | null;
  logoDocumentId: string | null;
  coverDocumentId: string | null;
}

@Injectable({ providedIn: 'root' })
export class BrandBusinessProfileService {
  private readonly authService = inject(AuthService);
  private readonly businessProfileService = inject(BusinessProfileService);
  private readonly tenantState = inject(PortfolioTenantStateService);

  resolveTenantId(): string | null {
    return this.authService.resolveTenantId();
  }

  getExistingProfile(tenantId: string): Observable<BusinessProfileDto | null> {
    const cached = this.tenantState.businessProfile();
    if (cached) {
      return of(cached);
    }
    return this.tenantState.ensureLoaded$().pipe(map((result) => result.businessProfile));
  }

  upsertFromBrandBuffer(
    buffer: BrandSectionBuffer,
    pending: BrandPendingUploads,
    existing: BusinessProfileDto | null
  ): Observable<BusinessProfileDto> {
    const tenantId = this.resolveTenantId();
    if (!tenantId) {
      throw new Error('No tenant selected. Please log in again.');
    }

    const businessTypeId = existing?.businessTypeId?.trim() ?? '';
    if (!businessTypeId) {
      throw new Error('Set your business type under Admin → Profile before saving brand.');
    }

    const hasNewLogo = Boolean(pending.logoFile || isDataUrl(buffer.brand.logoUrl));
    const hasNewStoryImage = Boolean(
      pending.storyImageFile || isDataUrl(buffer.storeDescription.imageUrl)
    );

    return from(this.buildAttachments(buffer, pending)).pipe(
      switchMap((attachments) => {
        const body: BusinessProfileUpsertRequest = {
          tenantId,
          businessName: buffer.brand.businessName.trim(),
          businessTypeId,
          email: existing?.email ?? null,
          phone: existing?.phone ?? null,
          description: buffer.storeDescription.description.trim() || null,
          isActive: true,
          logoDocumentId: hasNewLogo ? null : pending.logoDocumentId,
          coverImageDocumentId: hasNewStoryImage ? null : pending.coverDocumentId,
          websiteUrl: existing?.websiteUrl ?? null,
          timeZone: existing?.timeZone ?? null,
          currency: existing?.currency ?? null,
          ...(attachments.length > 0 ? { attachments } : {})
        };
        return this.businessProfileService.upsert(body);
      })
    );
  }

  private async buildAttachments(
    buffer: BrandSectionBuffer,
    pending: BrandPendingUploads
  ): Promise<UploadDocumentRequest[]> {
    const attachments: UploadDocumentRequest[] = [];

    if (pending.logoFile) {
      attachments.push(
        await buildUploadDocumentRequest(pending.logoFile, FileCategory.BusinessLogo)
      );
    } else if (isDataUrl(buffer.brand.logoUrl)) {
      const attachment = buildAttachmentFromDataUrl(
        buffer.brand.logoUrl,
        'brand-logo.png',
        FileCategory.BusinessLogo
      );
      if (attachment) {
        attachments.push(attachment);
      }
    }

    if (pending.storyImageFile) {
      attachments.push(
        await buildUploadDocumentRequest(pending.storyImageFile, FileCategory.BannerImage)
      );
    } else if (isDataUrl(buffer.storeDescription.imageUrl)) {
      const attachment = buildAttachmentFromDataUrl(
        buffer.storeDescription.imageUrl,
        'brand-story.png',
        FileCategory.BannerImage
      );
      if (attachment) {
        attachments.push(attachment);
      }
    }

    return attachments;
  }
}
