import { Component } from '@angular/core';
import { LucideAngularModule, CircleX, User, Settings } from 'lucide-angular';

@Component({
  selector: 'app-home',
  standalone: true,
   imports: [LucideAngularModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  annual = false;
  readonly circleX = CircleX;
  readonly userIcon = User;
  readonly settingsIcon = Settings;
}
