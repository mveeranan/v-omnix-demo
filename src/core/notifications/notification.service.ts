import { Injectable } from '@angular/core';
import { toast } from 'ngx-sonner';
import { GENERIC_API_ERROR_MESSAGE, getApiErrorMessage } from '@shared/utils/api-error.util';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  success(message: string, description?: string): void {
    toast.success(message, { description });
  }

  info(message: string, description?: string): void {
    toast.info(message, { description });
  }

  warning(message: string, description?: string): void {
    toast.warning(message, { description });
  }

  error(message: string, description?: string): void {
    toast.error(message, { description });
  }

  errorFromApi(error: unknown, fallback: string = GENERIC_API_ERROR_MESSAGE): void {
    this.error(getApiErrorMessage(error, fallback));
  }
}
