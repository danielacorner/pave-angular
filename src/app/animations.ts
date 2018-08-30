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
import * as d3 from 'd3';
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
    style({ opacity: 0, transform: 'translateX(100px)' }),
    animate('200ms ease-in')
  ]),
  transition(':leave', [
    // style({ transform: 'translate(0,0)' }),
    animate(
      '200ms ease-out',
      style({ opacity: 0, transform: 'translateX(150px)' })
    )
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

function clone(selector) {
  const node = d3.select(selector).node();
  return d3.select(
    node.parentNode.insertBefore(node.cloneNode(true), node.nextSibling)
  );
}

const circlePop = nodes => {
  const canvas = document.querySelector('#canvas');
  const canvasWidth = parseInt(window.getComputedStyle(canvas).width, 10);

  nodes.exit().each(d => {
    // if it doesn't already exist, append temporary translucent placeholder 'clone' to display after pop
    if (!document.querySelector(`#circleClone_${d.id}`)) {
      clone(`#circle_${d.id}`)
        .style('opacity', 0.15)
        .attr('class', 'filteredClone')
        .attr('id', `circleClone_${d.id}`);
    }
  });

  nodes
    .exit()
    .transition()
    .duration(500)
    // exit "pop" transition: enlarge radius & fade out
    .attr('r', d => {
      if (canvasWidth > CONFIG.DEFAULTS.MOBILE_BREAKPOINT) {
        return d.r * 2 + 'vmin';
      } else {
        return d.r * 6 + 'vmin';
      }
    })
    .styleTween('opacity', d => {
      const i = d3.interpolate(1, 0);
      return t => i(t);
    })
    .remove();
};
