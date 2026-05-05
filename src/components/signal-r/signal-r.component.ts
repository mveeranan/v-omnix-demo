import { Component, OnInit } from '@angular/core';
import { SignalRService } from '../../app/core/realtime/signal-r.service';
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
  user = '';
  message = '';
  constructor(private signalRService: SignalRService) { }

  ngOnInit(): void {
    this.signalRService.startConnection();
    this.signalRService.addReceiveMessageListener((user, message) => {
      this.messageList.push({ user, message });
    });
  }
  sendMessage(user: string, message: string) {
    this.signalRService.sendMessage(user, message);
    this.message = '';
    this.user = '';
  }
}
