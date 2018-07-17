import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-tooltip',
  template: `
    <div class="tooltip z-depth-3"
    >
      tooltip works!
    </div>
  `,
  styles: [
    `
      .tooltip {
        position: absolute;
        text-align: center;
        width: 360px;
        height: auto;
        padding: 2px;
        font: 12px sans - serif;
        background: lightgrey;
        border: 0px;
        border-radius: 8px;
        pointer-events: none;
      }
    `
  ],
})
export class TooltipComponent implements OnInit, OnDestroy {
  @Input() public tooltipData;
  public tooltipHeight;

  constructor() {}

  ngOnInit() {
    this.tooltipInit( this.tooltipData.d, this.tooltipData.x, this.tooltipData.y );
  }

  ngOnDestroy(): void {  }

  tooltipInit(d, x, y) {
    // set tooltip content
    d3.select('.tooltip')
      .html(
        'The major ' +
          d.r +
          '<br/>In the category ' +
          d.r +
          '<br/>Total: ' +
          '<br/>Total: ' +
          '<br/>Total: ' +
          '<br/>Total: ' +
          '<br/>Total: ' +
          '<br/>Total: ' +
          '<br/>Total: ' +
          '<br/>Total: ' +
          '<br/>Total: ' +
          '<br/>Total: ' +
          '<br/>Total: ' +
          '<br/>Total: ' +
          '<br/>Total: ' +
          '<br/>Total: ' +
          '<br/>Total: ' +
          '<br/>Total: ' +
          d.r +
          '; Radius:' +
          d.r
      );
    // get tooltip height
    this.tooltipHeight = document.getElementsByClassName('tooltip')[0].getBoundingClientRect().height;
    console.log('tth:');
    console.log(this.tooltipHeight);
    // position based on height
    // TODO: check top, if > ( window.height - this.height ), top = window.height - this.height
    d3.select('.tooltip')
      .style('top',
        // set max-top to prevent content bleeding below page height
        ( 1.3 * y * window.innerHeight / (y + window.innerHeight) ) < ( window.innerHeight - this.tooltipHeight ) ?
        ( 1.3 * y * window.innerHeight / (y + window.innerHeight) ) + 'px' :
        ( window.innerHeight - this.tooltipHeight - 20 ) + 'px' )
      .style('left', x > window.innerWidth * 0.5 ?
        // right side
        x - 360 - d.r + 'px' :
        // left side
        x + d.r + 'px');
    }
  }
}
