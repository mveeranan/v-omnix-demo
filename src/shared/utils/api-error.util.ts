import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse, getFirstApiError } from '@shared/models/api-response.model';

export const GENERIC_API_ERROR_MESSAGE = 'Something went wrong. Try again later!!';

export function getApiErrorMessage(
  error: unknown,
  fallback: string = GENERIC_API_ERROR_MESSAGE
): string {
  for (const candidate of collectErrorMessageCandidates(error)) {
    if (isUserFriendlyApiMessage(candidate)) {
      return candidate;
    }
  }

  return fallback;
}

function collectErrorMessageCandidates(error: unknown): string[] {
  const candidates: string[] = [];

  if (error instanceof HttpErrorResponse) {
    candidates.push(...extractMessagesFromHttpBody(error.error));

    if (typeof error.error === 'string' && error.error.trim()) {
      const parsed = tryParseJson(error.error);
      if (parsed) {
        candidates.push(...extractMessagesFromHttpBody(parsed));
      } else {
        candidates.push(error.error.trim());
      }
    }

    if (error.message?.trim()) {
      candidates.push(error.message.trim());
    }
  } else if (error instanceof Error && error.message?.trim()) {
    candidates.push(error.message.trim());
  } else if (typeof error === 'string' && error.trim()) {
    candidates.push(error.trim());
  } else if (error && typeof error === 'object') {
    candidates.push(...extractMessagesFromHttpBody(error));
  }

  return candidates;
}

function extractMessagesFromHttpBody(body: unknown): string[] {
  if (!body || typeof body !== 'object') {
    return [];
  }

  const record = body as Record<string, unknown>;
  const messages: string[] = [];
  const api = body as Partial<ApiResponse<unknown>>;

  if (typeof api.message === 'string' && api.message.trim()) {
    messages.push(api.message.trim());
  }

  const validationError = getFirstApiError(api.errors);
  if (validationError) {
    messages.push(validationError);
  }

  if (typeof record['title'] === 'string' && record['title'].trim()) {
    messages.push(record['title'].trim());
  }

  if (typeof record['detail'] === 'string' && record['detail'].trim()) {
    messages.push(record['detail'].trim());
  }

  if (Array.isArray(record['errors'])) {
    for (const item of record['errors']) {
      if (typeof item === 'string' && item.trim()) {
        messages.push(item.trim());
      }
    }
  }

  return messages;
}

function tryParseJson(value: string): unknown | null {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function isUserFriendlyApiMessage(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed) {
    return false;
  }

  const lower = trimmed.toLowerCase();

  if (lower.startsWith('http failure response')) {
    return false;
  }

  if (/https?:\/\//i.test(trimmed)) {
    return false;
  }

  if (trimmed.length > 220) {
    return false;
  }

  const technicalMarkers = [
    'exception',
    'stack trace',
    'entityframework',
    'microsoft.',
    'system.',
    'syntaxerror',
    'unexpected token',
    'nullreference',
    'object reference not set',
    'at line',
    'inner exception',
    'sql exception',
    'dbupdate',
    'traceback'
  ];

  return !technicalMarkers.some((marker) => lower.includes(marker));
}
