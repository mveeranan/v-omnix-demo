import { Component, Input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Plus, ArrowRight } from 'lucide-angular';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    <div class="dashboard-header">
      <!-- Quick Action Buttons -->
      <div class="dashboard-header__quick-actions">
        <a
          href="/admin/products/new"
          class="dashboard-header__action-btn dashboard-header__action-btn--primary">
          <lucide-icon [img]="plusIcon" class="h-4 w-4" />
          <span>Add Product</span>
        </a>

        <a
          href="/admin/website"
          class="dashboard-header__action-btn dashboard-header__action-btn--secondary">
          <span>Customize Website</span>
          <lucide-icon [img]="arrowIcon" class="h-4 w-4" />
        </a>
      </div>

      <!-- Plan Badge - Prominent display -->
      @if (planName) {
        <div class="dashboard-header__plan-section">
          <div class="dashboard-header__plan-badge">
            <span class="dashboard-header__plan-label">Plan:</span>
            <span class="dashboard-header__plan-name">{{ planName }}</span>
          </div>
          @if (renewalDays !== null && renewalDays !== undefined) {
            <div class="dashboard-header__renewal-info">
              Renews in {{ renewalDays }} days
            </div>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './dashboard-header.component.scss'
})
export class DashboardHeaderComponent {
  @Input() businessName: string | null = null;
  @Input() planName: string = 'Free';
  @Input() renewalDays: number | null = null;

  readonly plusIcon = Plus;
  readonly arrowIcon = ArrowRight;

  greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  });

  dateLabel = computed(() => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
    return formatter.format(new Date());
  });
}
