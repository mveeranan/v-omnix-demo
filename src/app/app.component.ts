import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSonnerToaster } from 'ngx-sonner';
import { DemoBannerComponent } from '@core/demo/demo-banner.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSonnerToaster, DemoBannerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'my-angular19-app';
}
