import { Component, input, model } from '@angular/core';

@Component({
  selector: 'app-section-toggle',
  standalone: true,
  template: `
    <label class="pf-editor-toggle">
      <span>{{ label() }}</span>
      <input
        type="checkbox"
        [checked]="enabled()"
        (change)="enabled.set($any($event.target).checked)"
      />
    </label>
  `
})
export class SectionToggleComponent {
  readonly label = input('Show on portfolio');
  readonly enabled = model(true);
}
