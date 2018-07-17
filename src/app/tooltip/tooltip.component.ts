import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-tooltip',
  template: `
    <div class="tooltip"
    >
      tooltip works!
    </div>
  `,
  styles: [
    `
      .tooltip {
        position: absolute;
        text-align: center;
        width: 150px;
        /*height: 28px;         */
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

  constructor() {  }

  ngOnInit() {
    // tooltipInit(d, d3.event);
    this.tooltipInit(
      this.tooltipData.d,
      this.tooltipData.x,
      this.tooltipData.y
    );
  }

  ngOnDestroy(): void {  }

  tooltipInit(d, x, y) {
    d3.select('.tooltip')
      .html(
        'The major ' +
          d.r +
          '<br/>In the category ' +
          d.r +
          '<br/>Total: ' +
          d.r +
          '; Radius:' +
          d.r
      )
      .style('left', x + 'px')
      .style('top', y - 28 + 'px');
  }
}
