import { Component, OnInit, Input } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-size-legend-button',
  template: `
  <button class='sizeBtn btn waves-effect z-depth-3'
    [ngStyle]='btnStyles'
    [style.top]="((height / 2) + navbarHeight - btnHeight) + 'px'"
    [style.right]="'5%'"
    (click)="handleClick()">
  <div class='grid-container'>
    <div class="sort-icon valign-wrapper">
      <mat-icon
      [style.transform]="(active ? 'rotate(90deg)' : null)"
      >filter_list</mat-icon>
    </div>
    <div class="btn-text">
      <span>
      <p>Sort by</p>
      <p>sizes</p>
      </span>
    </div>
  </div>
  </button>
  `,
  styles: [
    `
      p {
        line-height: 0.5em;
      }
      button {
        border-radius: 4px;
        position: fixed;
        opacity: 1;
      }
      .grid-container {
        display: grid;
        grid-gap: 10px;
        grid-columns: auto auto;
      }
      .sort-icon {
        text-align: center;
        grid-column: 1;
        grid-row: 1;
      }
      .btn-text {
        text-align: center;
        grid-column: 2;
        grid-row: 1;
      }
      mat-icon {
        transition: transform 0.2s;
      }
    `
  ]
})
export class SizeLegendButtonComponent implements OnInit {
  @Input() public forceSimulation;
  @Input() public forceXCombine;
  @Input() public forceYCombine;
  @Input() public forceCluster;
  @Input() public nClusters;
  @Input() public width;
  @Input() public height;
  @Input() public navbarHeight;
  @Input() public radiusRange;
  public btnHeight = 70;
  public btnStyles = {
    height: this.btnHeight + 'px',
    width: '130px'
  };
  public data$ = [];
  public active = false;
  constructor() {}

  ngOnInit() {
    // transition height down by half button height
    // setTimeout(() => {
    // d3.select('.colourBtn')
    //   .transition()
    //   .duration(500)
    //   .style('top', ($('.colourBtn').position().top) - ($('.colourBtn').height() / 2) + 'px')
    //   .style('opacity', 1);
    // }, 2000);
  }

  handleClick() {
    this.active = !this.active;
    const that = this;
    // min and max radius
    console.log(that.radiusRange);
    // split the clusters horizontally by size
    const forceXSeparate = d3
      .forceX(function(d) {
        return (
          // 40% screen width
          0.3 *
          // split the width into the range (min, max radius)
          ((that.width / (that.radiusRange[1] - that.radiusRange[0])) * d.r -
            that.width / 2)
        );
      })
      .strength(0.3);

    if (this.active) {
      this.forceSimulation
        .force('x', forceXSeparate)
        // .force('y', that.forceYCombine)
        .force('cluster', null)
        .alpha(0.3)
        .alphaTarget(0.001)
        .restart();
    } else {
      this.forceSimulation
        .force('x', that.forceXCombine)
        .force('cluster', that.forceCluster)
        // .force('y', that.forceYCombine)
        .alpha(0.3)
        .alphaTarget(0.001)
        .restart();
    }
  }
}
