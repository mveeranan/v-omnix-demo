import { Component } from '@angular/core';
import { environment } from '@env/environment';

@Component({
  selector: 'app-demo-banner',
  standalone: true,
  template: `
    @if (isDemo) {
      <div class="demo-banner">
        <span>🎭 Demo Mode — Using Sample Data. Changes are saved to this browser only.</span>
        <button type="button" (click)="resetData()">Reset demo data</button>
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
      justify-content: center;
      gap: 1rem;
      padding: 6px 12px;
      background: #7c3aed;
      color: #fff;
      font-size: 13px;
      font-weight: 500;
      text-align: center;
    }
    .demo-banner button {
      border: 1px solid rgba(255, 255, 255, 0.6);
      background: transparent;
      color: #fff;
      border-radius: 6px;
      padding: 2px 10px;
      font-size: 12px;
      cursor: pointer;
    }
    .demo-banner button:hover {
      background: rgba(255, 255, 255, 0.15);
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
