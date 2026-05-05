import { Injectable, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { AuthService } from '../auth/auth.service';
import { LoggerService } from '../logging/logger.service';
import { API_ENDPOINTS } from '../../../environments/api.constants';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private readonly authService = inject(AuthService);
  private readonly logger = inject(LoggerService);
  private hubConnection?: signalR.HubConnection;

  startConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(API_ENDPOINTS.signalR.hub, {
        accessTokenFactory: () => this.authService.getAccessToken() ?? ''
      })
      .build();

    this.hubConnection
      .start()
      .then(() => this.logger.info('SignalR connection started.'))
      .catch((error) => this.logger.error('Error while starting SignalR connection.', error));
  }

  sendMessage(user: string, message: string): void {
    if (!this.hubConnection) {
      return;
    }

    this.hubConnection.invoke('SendMessage', user, message).catch((error) => this.logger.error('Send message failed.', error));
  }

  addReceiveMessageListener(callback: (user: string, message: string) => void): void {
    if (!this.hubConnection) {
      return;
    }

    this.hubConnection.on('ReceiveAll', callback);
  }
}
