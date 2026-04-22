import { Component, OnInit } from '@angular/core';
import { SignalRService } from '../../services/signal-r.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signal-r',
  standalone : true,
  imports: [CommonModule,FormsModule],
  templateUrl: './signal-r.component.html',
  styleUrl: './signal-r.component.scss'
})
export class SignalRComponent implements OnInit {

  messageList: { user: string, message: string }[] = [];
  user: string = '';
  message: string = '';
  constructor(private signalRService: SignalRService) { }

  ngOnInit(): void {
    this.signalRService.startConnection();
    this.signalRService.AddReceiveMessageListener((user, message) => {
      this.messageList.push({ user, message });
      console.log(`Received message from ${user}: ${message}`);
    });
  }
  sendMessage(user: string, message: string) {
    this.signalRService.SendMessage(user, message);
    this.message = '';
    this.user = '';
  }
}
