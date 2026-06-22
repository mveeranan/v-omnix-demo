export interface UploadedDocumentDto {
  id: string;
  fileName: string;
  url: string;
  contentType?: string;
  fileSizeInBytes?: number;
  fileType?: string;
  fileCategory?: number;
  /** @deprecated use id */
  documentId?: string;
}

export function documentIdFromUpload(doc: UploadedDocumentDto): string {
  return doc.id || doc.documentId || '';
}
