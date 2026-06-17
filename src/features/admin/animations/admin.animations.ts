import {
  animate,
  query,
  stagger,
  style,
  transition,
  trigger
} from '@angular/animations';

export const widgetEnter = trigger('widgetEnter', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(12px)' }),
    animate(
      '320ms cubic-bezier(0.22, 1, 0.36, 1)',
      style({ opacity: 1, transform: 'translateY(0)' })
    )
  ])
]);

export const widgetsStagger = trigger('widgetsStagger', [
  transition('* => *', [
    query('@widgetEnter', stagger(80, animate('0ms')), { optional: true })
  ])
]);

export const pageFadeIn = trigger('pageFadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('400ms ease-out', style({ opacity: 1 }))
  ])
]);

export const drawerSlide = trigger('drawerSlide', [
  transition(':enter', [
    style({ transform: 'translateX(-100%)' }),
    animate('280ms cubic-bezier(0.22, 1, 0.36, 1)', style({ transform: 'translateX(0)' }))
  ]),
  transition(':leave', [
    animate('220ms ease-in', style({ transform: 'translateX(-100%)' }))
  ])
]);

export const backdropFade = trigger('backdropFade', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('200ms ease-out', style({ opacity: 1 }))
  ]),
  transition(':leave', [animate('180ms ease-in', style({ opacity: 0 }))])
]);
