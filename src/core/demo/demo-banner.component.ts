import { Component } from '@angular/core';
import { environment } from '@env/environment';

@Component({
  selector: 'app-demo-banner',
  standalone: true,
  template: `
    @if (isDemo) {
      <div class="demo-banner">
        <button type="button" (click)="resetData()">Reset data</button>
      </div>
    }
  `,
  styles: [`
    .demo-banner {
      position: sticky;
      top: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 6px clamp(12px, 3vw, 24px);
      background: #7c3aed;
    }
    .demo-banner button {
      border: 1px solid rgba(255, 255, 255, 0.6);
      background: transparent;
      color: #fff;
      border-radius: 6px;
      padding: 4px 12px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
    }
    .demo-banner button:hover {
      background: rgba(255, 255, 255, 0.15);
    }
    @media (max-width: 480px) {
      .demo-banner {
        padding: 6px 12px;
      }
      .demo-banner button {
        font-size: 11px;
        padding: 3px 10px;
      }
    }
  `]
})
export class DemoBannerComponent {
  readonly isDemo = environment.demoMode;

  resetData(): void {
    // A full page reload happens immediately after, so clearing localStorage directly (which
    // wipes both the demo "database" and the logged-in session) is simpler and more thorough
    // than reaching into DemoDbService's in-memory cache, which is about to be discarded anyway.
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/home';
  }
}
