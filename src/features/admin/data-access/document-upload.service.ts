import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '@env/api.constants';
import { ApiResponse } from '@shared/models/api-response.model';
import { FileCategory } from '@shared/models/enums/file-category.enum';
import { UploadedDocumentDto } from '@shared/models/dto/uploaded-document.dto';

interface UploadDocumentFile {
  fileName: string;
  contentType: string;
  base64Content: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentUploadService {
  private readonly http = inject(HttpClient);

  upload(file: File, category: FileCategory): Observable<UploadedDocumentDto> {
    return new Observable((subscriber) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64Content = result.includes(',') ? result.split(',')[1] : result;
        const body = {
          files: [
            {
              fileName: file.name,
              contentType: file.type,
              base64Content
            }
          ],
          fileCategory: category
        };
        this.http
          .post<ApiResponse<UploadedDocumentDto | UploadedDocumentDto[]>>(
            API_ENDPOINTS.documents.upload,
            body
          )
          .pipe(
            map((response) => {
              if (!response.success) {
                throw new Error(response.message || 'Upload failed');
              }
              const data = response.data;
              if (Array.isArray(data)) {
                return data[0];
              }
              return data;
            })
          )
          .subscribe({
            next: (doc) => subscriber.next(doc),
            error: (err) => subscriber.error(err),
            complete: () => subscriber.complete()
          });
      };
      reader.onerror = () => subscriber.error(reader.error);
      reader.readAsDataURL(file);
    });
  }

  delete(documentId: string): Observable<void> {
    const id = documentId.trim();
    if (!id) {
      throw new Error('Document id is required.');
    }
    return this.http
      .delete<ApiResponse<unknown>>(API_ENDPOINTS.documents.delete(id))
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'Failed to delete document');
          }
        })
      );
  }
}
