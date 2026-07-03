import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { Portfolio } from '../../models/portfolio.model';

interface StatDisplay {
  label: string;
  value: number;
}

@Component({
  selector: 'app-pf-stats-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-section.component.html'
})
export class StatsSectionComponent {
  readonly portfolio = input.required<Portfolio>();

  readonly stats = computed((): StatDisplay[] => {
    const p = this.portfolio();
    if (!p.stats.enabled) return [];

    const s = p.stats;
    return [
      { label: 'Total products',   value: s.totalProducts },
      { label: 'Orders completed', value: s.totalOrders },
      { label: 'Happy customers',  value: s.totalCustomers || s.happyCustomers },
      { label: 'Years in business', value: s.yearsExperience }
    ];
  });
}
