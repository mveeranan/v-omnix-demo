import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  private hubConnection: signalR.HubConnection | undefined;

  constructor() { }

  public startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7084/hubs/connect', {
        accessTokenFactory: () => localStorage.getItem('access_token') ?? ''
      })
      .build();

    this.hubConnection.start()
      .then(() => console.log('Connection started'))
      .catch(err => console.log('Error while starting connection: ' + err));
  }


  public SendMessage(user: string, message: string) {
    if (this.hubConnection) {
      this.hubConnection.invoke('SendMessage', user, message)
        .catch(err => console.error(err));
    }

  }

  AddReceiveMessageListener(callback: (user: string, message: string) => void) {
    if (this.hubConnection) {
      this.hubConnection.on('ReceiveAll', callback);
    }
  }


}
