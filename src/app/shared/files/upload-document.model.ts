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
  return {
    files: [
      {
        fileName: file.name,
        contentType: file.type,
        base64Content
      }
    ],
    fileCategory,
    ...(tenantId ? { tenantId } : {})
  };
}
