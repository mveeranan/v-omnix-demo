import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusinessInsight } from '../../models/dashboard-analytics.model';
import { LucideAngularModule, AlertCircle, CheckCircle, Info, Lightbulb } from 'lucide-angular';

@Component({
  selector: 'app-business-insights',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="business-insights">
      <div class="business-insights__header">
        <h3 class="business-insights__title">Business Insights</h3>
      </div>

      @if (insights && insights.length > 0) {
        <div class="business-insights__list">
          <div
            *ngFor="let insight of insights"
            [class]="'business-insights__card business-insights__card--' + insight.type"
            [class.business-insights__card--high]="insight.priority === 'high'">
            <div class="business-insights__icon">
              <lucide-icon
                *ngIf="insight.type === 'success'"
                [img]="checkIcon"
                class="w-5 h-5" />
              <lucide-icon
                *ngIf="insight.type === 'warning'"
                [img]="alertIcon"
                class="w-5 h-5" />
              <lucide-icon *ngIf="insight.type === 'info'" [img]="infoIcon" class="w-5 h-5" />
              <lucide-icon
                *ngIf="insight.type === 'action'"
                [img]="lightbulbIcon"
                class="w-5 h-5" />
            </div>

            <div class="business-insights__content">
              <h4 class="business-insights__insight-title">{{ insight.title }}</h4>
              <p class="business-insights__message">{{ insight.message }}</p>

              @if (insight.actionLabel && insight.actionUrl) {
                <a [href]="insight.actionUrl" class="business-insights__action">
                  {{ insight.actionLabel }} →
                </a>
              }
            </div>

            @if (insight.priority === 'high') {
              <div class="business-insights__priority-badge">High Priority</div>
            }
          </div>
        </div>
      } @else {
        <div class="business-insights__empty">
          <p>No insights available</p>
        </div>
      }
    </div>
  `,
  styleUrl: './business-insights.component.scss'
})
export class BusinessInsightsComponent {
  @Input() insights: BusinessInsight[] | undefined | null = null;

  readonly checkIcon = CheckCircle;
  readonly alertIcon = AlertCircle;
  readonly infoIcon = Info;
  readonly lightbulbIcon = Lightbulb;
}
