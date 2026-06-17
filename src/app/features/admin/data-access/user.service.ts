import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '../../../../environments/api.constants';
import { ApiResponse } from '../../../shared/models/api-response.model';
import { mapUserDto, UserApiDto, UserDto, UserUpdateRequest } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  update(payload: UserUpdateRequest): Observable<UserDto> {
    return this.http.put<ApiResponse<UserApiDto>>(API_ENDPOINTS.user.update, payload).pipe(
      map((response) => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to update user');
        }
        const mapped = mapUserDto(response.data);
        if (!mapped) {
          throw new Error('Invalid user response');
        }
        return mapped;
      })
    );
  }
}

