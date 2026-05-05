import { Injectable } from '@angular/core';
import { Mapper } from '../../../shared/mappers/mapper';
import { AuthTokens } from '../models/auth.model';

export interface AuthTokenDto {
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthTokenMapper implements Mapper<AuthTokenDto, AuthTokens> {
  map(source: AuthTokenDto): AuthTokens {
    return {
      accessToken: source.accessToken,
      refreshToken: source.refreshToken
    };
  }
}
