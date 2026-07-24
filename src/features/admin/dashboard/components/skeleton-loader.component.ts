import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="'skeleton-loader skeleton-loader--' + type">
      @switch (type) {
        @case ('card') {
          <div class="skeleton-loader__card">
            <div class="skeleton-loader__line skeleton-loader__line--short"></div>
            <div class="skeleton-loader__line skeleton-loader__line--long"></div>
            <div class="skeleton-loader__line skeleton-loader__line--medium"></div>
          </div>
        }
        @case ('metric') {
          <div class="skeleton-loader__metric">
            <div class="skeleton-loader__line skeleton-loader__line--short"></div>
            <div class="skeleton-loader__value"></div>
            <div class="skeleton-loader__line skeleton-loader__line--short"></div>
          </div>
        }
        @case ('chart') {
          <div class="skeleton-loader__chart">
            <div class="skeleton-loader__line skeleton-loader__line--short"></div>
            <div class="skeleton-loader__bars">
              <div class="skeleton-loader__bar" style="height: 60%"></div>
              <div class="skeleton-loader__bar" style="height: 40%"></div>
              <div class="skeleton-loader__bar" style="height: 70%"></div>
              <div class="skeleton-loader__bar" style="height: 50%"></div>
            </div>
          </div>
        }
        @case ('table') {
          <div class="skeleton-loader__table">
            <div class="skeleton-loader__row">
              <div class="skeleton-loader__cell skeleton-loader__cell--wide"></div>
              <div class="skeleton-loader__cell"></div>
              <div class="skeleton-loader__cell"></div>
            </div>
            <div class="skeleton-loader__row">
              <div class="skeleton-loader__cell skeleton-loader__cell--wide"></div>
              <div class="skeleton-loader__cell"></div>
              <div class="skeleton-loader__cell"></div>
            </div>
            <div class="skeleton-loader__row">
              <div class="skeleton-loader__cell skeleton-loader__cell--wide"></div>
              <div class="skeleton-loader__cell"></div>
              <div class="skeleton-loader__cell"></div>
            </div>
          </div>
        }
        @case ('list') {
          <div class="skeleton-loader__list">
            <div class="skeleton-loader__list-item">
              <div class="skeleton-loader__avatar"></div>
              <div class="skeleton-loader__list-content">
                <div class="skeleton-loader__line skeleton-loader__line--medium"></div>
                <div class="skeleton-loader__line skeleton-loader__line--short"></div>
              </div>
            </div>
            <div class="skeleton-loader__list-item">
              <div class="skeleton-loader__avatar"></div>
              <div class="skeleton-loader__list-content">
                <div class="skeleton-loader__line skeleton-loader__line--medium"></div>
                <div class="skeleton-loader__line skeleton-loader__line--short"></div>
              </div>
            </div>
          </div>
        }
      }
    </div>
  `,
  styleUrl: './skeleton-loader.component.scss'
})
export class SkeletonLoaderComponent {
  @Input() type: 'card' | 'metric' | 'chart' | 'table' | 'list' = 'card';
}
