import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-brand-logo',
  standalone: true,
  template: `
    <span class="logo-mark" [class.logo-mark--sm]="size === 'sm'">
      <svg class="brand-logo-svg" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <defs>
          <linearGradient [id]="gradientId" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#22d3ee" />
            <stop offset="0.55" stop-color="#3b82f6" />
            <stop offset="1" stop-color="#8b5cf6" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="23" [attr.stroke]="'url(#' + gradientId + ')'" stroke-width="3.5" opacity="0.6" />
        <path
          d="M15 20L28 46C29.5 49 34.5 49 36 46L50 20"
          [attr.stroke]="'url(#' + gradientId + ')'"
          stroke-width="5"
          stroke-linecap="round" />
        <path d="M20 31C25 27.8 39 27.8 44 31" stroke="#67e8f9" stroke-opacity="0.9" stroke-width="2.2" stroke-linecap="round" />
        <circle cx="15" cy="20" r="3" fill="#22d3ee" />
        <circle cx="50" cy="20" r="3" fill="#3b82f6" />
        <circle cx="32" cy="48" r="3" fill="#8b5cf6" />
      </svg>
    </span>
  `
})
export class BrandLogoComponent {
  @Input() gradientId = 'vOmnixMark';
  @Input() size: 'sm' | 'md' = 'md';
}
