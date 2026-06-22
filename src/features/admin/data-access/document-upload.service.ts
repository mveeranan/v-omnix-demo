import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap } from 'rxjs';
import { API_ENDPOINTS } from '@env/api.constants';
import { ApiResponse } from '@shared/models/api-response.model';
import { FileCategory } from '@shared/models/enums/file-category.enum';
import {
  documentIdFromUpload,
  UploadedDocumentDto
} from '@shared/models/dto/uploaded-document.dto';
import { AuthService } from '@core/auth/auth.service';
import { DocumentDto } from '@features/catalog/models/document.model';
import { requireTenantId, unwrapApiResponse } from '@features/catalog/data-access/catalog-api.util';

interface UploadDocumentFile {
  fileName: string;
  contentType: string;
  base64Content: string;
}

function mapDocumentDto(doc: DocumentDto | UploadedDocumentDto): UploadedDocumentDto {
  const id = 'id' in doc && doc.id ? doc.id : (doc as UploadedDocumentDto).documentId ?? '';
  return {
    id,
    documentId: id,
    fileName: doc.fileName ?? '',
    url: doc.url ?? '',
    contentType: doc.contentType,
    fileSizeInBytes: doc.fileSizeInBytes,
    fileType: doc.fileType,
    fileCategory: doc.fileCategory
  };
}

@Injectable({ providedIn: 'root' })
export class DocumentUploadService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  upload(file: File, category: FileCategory, tenantId?: string): Observable<UploadedDocumentDto> {
    return this.uploadMany([file], category, tenantId).pipe(map((docs) => docs[0]));
  }

  uploadMany(
    files: File[],
    category: FileCategory,
    tenantId?: string
  ): Observable<UploadedDocumentDto[]> {
    const tid = tenantId ?? requireTenantId(this.auth);
    return forkJoin(files.map((file) => this.readFileAsBase64(file))).pipe(
      switchMap((filePayloads) => {
        const body = {
          tenantId: tid,
          fileCategory: category,
          files: filePayloads
        };
        return this.http
          .post<ApiResponse<DocumentDto[] | DocumentDto>>(API_ENDPOINTS.documents.upload, body)
          .pipe(
            map((response) => {
              const data = unwrapApiResponse(response);
              const list = Array.isArray(data) ? data : [data];
              return list.map(mapDocumentDto);
            })
          );
      })
    );
  }

  delete(documentId: string): Observable<void> {
    const id = documentId.trim();
    if (!id) {
      throw new Error('Document id is required.');
    }
    return this.http
      .delete<ApiResponse<unknown>>(API_ENDPOINTS.documents.delete(id))
      .pipe(map(unwrapApiResponse))
      .pipe(map(() => undefined));
  }

  resolveDocumentId(doc: UploadedDocumentDto): string {
    return documentIdFromUpload(doc);
  }

  private readFileAsBase64(file: File): Observable<UploadDocumentFile> {
    return new Observable((subscriber) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64Content = result.includes(',') ? result.split(',')[1] : result;
        subscriber.next({
          fileName: file.name,
          contentType: file.type,
          base64Content
        });
        subscriber.complete();
      };
      reader.onerror = () => subscriber.error(reader.error);
      reader.readAsDataURL(file);
    });
  }
}
