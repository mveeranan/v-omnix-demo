import { parseDataUrl } from '../../../shared/files/upload-document.model';

export interface UserProfileImagePayload {
  fileName: string;
  contentType: string;
  base64Content: string;
}

export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  profileImageDocumentId?: string | null;
  profileImageUrl?: string | null;
}

export interface UserUpdateRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  profileImage?: UserProfileImagePayload | null;
}

export interface UserApiDto {
  id?: string;
  Id?: string;
  firstName?: string;
  FirstName?: string;
  lastName?: string;
  LastName?: string;
  email?: string;
  Email?: string;
  mobileNumber?: string;
  MobileNumber?: string;
  mobile?: string;
  Mobile?: string;
  profileImageDocumentId?: string | null;
  ProfileImageDocumentId?: string | null;
  profileImageUrl?: string | null;
  ProfileImageUrl?: string | null;
}

function pickString(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) {
      return trimmed;
    }
  }
  return '';
}

function pickNullable(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    if (value === null) {
      return null;
    }
    const trimmed = value?.trim();
    if (trimmed) {
      return trimmed;
    }
  }
  return null;
}

export function mapUserDto(dto: UserApiDto | null | undefined): UserDto | null {
  if (!dto) {
    return null;
  }
  const id = pickString(dto.id, dto.Id);
  if (!id) {
    return null;
  }
  return {
    id,
    firstName: pickString(dto.firstName, dto.FirstName),
    lastName: pickString(dto.lastName, dto.LastName),
    email: pickString(dto.email, dto.Email),
    mobileNumber: pickString(dto.mobileNumber, dto.MobileNumber, dto.mobile, dto.Mobile),
    profileImageDocumentId: pickNullable(dto.profileImageDocumentId, dto.ProfileImageDocumentId),
    profileImageUrl: pickNullable(dto.profileImageUrl, dto.ProfileImageUrl)
  };
}

export function getUserProfileImageUrl(user: UserDto | null | undefined): string {
  return user?.profileImageUrl?.trim() ?? '';
}

export async function buildProfileImagePayload(file: File): Promise<UserProfileImagePayload> {
  const base64Content = await fileToBase64(file);
  return {
    fileName: file.name,
    contentType: file.type || 'application/octet-stream',
    base64Content
  };
}

export function buildProfileImagePayloadFromDataUrl(
  dataUrl: string,
  fileName = 'profile-image.png'
): UserProfileImagePayload | null {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) {
    return null;
  }
  return {
    fileName,
    contentType: parsed.contentType,
    base64Content: parsed.base64Content
  };
}

function fileToBase64(file: File): Promise<string> {
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
