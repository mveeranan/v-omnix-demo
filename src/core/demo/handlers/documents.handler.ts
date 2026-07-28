import { HttpResponse } from '@angular/common/http';
import { DemoDbService } from '../demo-db.service';
import { DemoRequestContext, fail, ok } from '../generic-crud';

interface DocumentDto {
  id: string;
  fileName: string;
  url: string;
  contentType: string;
  fileSizeInBytes: number;
  fileType: string;
  fileCategory: number;
}

interface FileUploadPayload { fileName: string; contentType: string; base64Content: string }

const COLLECTION = 'documents';
const memoryCache = new Map<string, DocumentDto>();

/** Registers a base64 upload as a document (data: URI + record in the 'documents' collection).
 * With client-side image compression in DocumentUploadService, all images compress to ~20-50KB,
 * so LocalStorage quota is no longer an issue. Memory cache still provides instant lookups. */
export function registerDemoDocument(db: DemoDbService, file: FileUploadPayload, fileCategory = 0): DocumentDto {
  const doc: DocumentDto = {
    id: db.newId(),
    fileName: file.fileName,
    url: `data:${file.contentType};base64,${file.base64Content}`,
    contentType: file.contentType,
    fileSizeInBytes: Math.round((file.base64Content.length * 3) / 4),
    fileType: file.contentType.split('/')[0] ?? 'image',
    fileCategory
  };

  memoryCache.set(doc.id, doc);

  try {
    const existing = db.getAll<DocumentDto>(COLLECTION, []);
    db.saveAll(COLLECTION, [...existing, doc]);
  } catch (e) {
    console.warn('LocalStorage save failed for document; using memory cache only', e);
  }
  return doc;
}

export function handleDocuments(db: DemoDbService, ctx: DemoRequestContext): HttpResponse<unknown> | null {
  if (ctx.method === 'POST' && ctx.path === '/documents/upload') {
    const body = (ctx.body ?? {}) as { fileCategory?: number; files?: FileUploadPayload[] };
    const docs = (body.files ?? []).map((f) => registerDemoDocument(db, f, body.fileCategory ?? 0));
    return ok(docs);
  }

  if (ctx.method === 'DELETE' && ctx.path.startsWith('/documents/')) {
    return ok(null, 'Deleted');
  }

  return null;
}

/** Looks up a previously-uploaded document's URL by id.
 * Checks in-memory cache first (instant), then LocalStorage. */
export function resolveDocumentUrl(db: DemoDbService, documentId: string): string | null {
  const cached = memoryCache.get(documentId);
  if (cached) return cached.url;

  const local = db.getAll<DocumentDto>(COLLECTION, []).find((d) => d.id === documentId);
  return local?.url ?? null;
}
