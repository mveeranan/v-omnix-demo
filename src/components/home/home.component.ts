import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  template: `<iframe class="pricing-frame" src="/pricing-selection.html" title="Pricing Selection"></iframe>`,
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
