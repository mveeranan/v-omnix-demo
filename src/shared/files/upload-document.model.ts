import { FileCategory } from './file-category.enum';

export interface UploadDocumentFile {
  fileName: string;
  contentType: string;
  base64Content: string;
}

export interface UploadDocumentRequest {
  files: UploadDocumentFile[];
  fileCategory: FileCategory;
  tenantId?: string;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.includes(',') ? result.split(',')[1] : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function buildUploadDocumentRequest(
  file: File,
  fileCategory: FileCategory,
  tenantId?: string
): Promise<UploadDocumentRequest> {
  const base64Content = await fileToBase64(file);
  return buildAttachmentPayload(file.name, file.type || 'application/octet-stream', base64Content, fileCategory, tenantId);
}

/** Build attachment object matching PUT /business-profiles contract. */
export function buildAttachmentPayload(
  fileName: string,
  contentType: string,
  base64Content: string,
  fileCategory: FileCategory,
  tenantId?: string
): UploadDocumentRequest {
  return {
    fileCategory,
    files: [
      {
        fileName,
        contentType,
        base64Content
      }
    ],
    ...(tenantId ? { tenantId } : {})
  };
}

export function parseDataUrl(dataUrl: string): { contentType: string; base64Content: string } | null {
  const trimmed = dataUrl.trim();
  if (!trimmed.startsWith('data:')) {
    return null;
  }
  const comma = trimmed.indexOf(',');
  if (comma < 0) {
    return null;
  }
  const meta = trimmed.slice(0, comma);
  const base64Content = trimmed.slice(comma + 1).trim();
  if (!base64Content) {
    return null;
  }
  const contentTypeMatch = /^data:([^;]+)/.exec(meta);
  const contentType = contentTypeMatch?.[1]?.trim() || 'application/octet-stream';
  return { contentType, base64Content };
}

export function buildAttachmentFromDataUrl(
  dataUrl: string,
  fileName: string,
  fileCategory: FileCategory
): UploadDocumentRequest | null {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) {
    return null;
  }
  return buildAttachmentPayload(fileName, parsed.contentType, parsed.base64Content, fileCategory);
}

export function isDataUrl(value: string | null | undefined): boolean {
  return Boolean(value?.trim().startsWith('data:'));
}
