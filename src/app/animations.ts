import {
  state,
  trigger,
  style,
  transition,
  animate,
  query,
  animateChild
} from '@angular/animations';
import CONFIG from './app.config';
export {
  ngIfAnimation,
  easeInOut,
  slideInFromRight,
  slideHorizontal,
  circlePop,
  circleWidth
};

const ngIfAnimation = trigger('ngIfAnimation', [
  transition(':enter, :leave', [query('@*', animateChild())])
]);

const easeInOut = trigger('easeInOut', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('200ms ease-in-out', style({ opacity: 1 }))
  ])
  // TODO: transition-out bug opens tooltip before deleting
  // transition(':leave', [
  //   style({ opacity: '*' }),
  //   animate('400ms ease-in-out', style({ opacity: 0 }))
  // ])
]);
const slideInFromRight = trigger('slideInFromRight', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translate(100px,0)' }),
    animate('200ms ease-in-out')
  ]),
  transition(':leave', [
    // style({ transform: 'translate(0,0)' }),
    animate('200ms ease-in-out', style({ transform: 'translate(150px,0)' }))
  ])
]);

const slideHorizontal = trigger('slideHorizontal', [
  transition('* => *', [animate('200ms ease-in-out')])
]);

const circleWidth = d => {
  const canvas = document.querySelector('#canvas');
  const canvasWidth = parseInt(window.getComputedStyle(canvas).width, 10);
  if (canvasWidth > CONFIG.DEFAULTS.MOBILE_BREAKPOINT) {
    return d.r + 'vmin';
  } else {
    return d.r * 1.5 + 'vmin';
  }
};

const circlePop = d => {
  const canvas = document.querySelector('#canvas');
  const canvasWidth = parseInt(window.getComputedStyle(canvas).width, 10);
  if (canvasWidth > CONFIG.DEFAULTS.MOBILE_BREAKPOINT) {
    return d.r * 2 + 'vmin';
  } else {
    return d.r * 6 + 'vmin';
  }
};
