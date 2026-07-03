import { Component, input } from '@angular/core';
import { Portfolio } from '../../portfolio/models/portfolio.model';

@Component({
  selector: 'app-announcement-bar-section',
  standalone: true,
  imports: [],
  template: `
    @if (portfolio().announcementBar.enabled && portfolio().announcementBar.text) {
      <div class="mox-announcement-bar">
        <span class="mox-announcement-bar__text">{{ portfolio().announcementBar.text }}</span>
        @if (portfolio().announcementBar.linkLabel && portfolio().announcementBar.linkUrl) {
          <a
            class="mox-announcement-bar__link"
            [href]="portfolio().announcementBar.linkUrl"
          >{{ portfolio().announcementBar.linkLabel }} →</a>
        }
      </div>
    }
  `
})
export class AnnouncementBarSectionComponent {
  readonly portfolio = input.required<Portfolio>();
}
