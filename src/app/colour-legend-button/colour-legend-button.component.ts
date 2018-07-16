import { Component, OnInit, Input } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-colour-legend-button',
  template: `
  <button class='colourBtn btn waves-effect z-depth-3'
    [ngStyle]='btnStyles'
    [style.top]="((vizHeight / 2) + navbarHeight - btnHeight) + 'px'"
    [style.left]="'5%'"
    (click)="handleClick()">
    <p>Colour</p>
    <p>Legend</p>
  </button>
  `,
  styles: [
    `
      p {
        line-height: 0.5em;
      }
      button {
        width: 100px;
        border-radius: 4px;
        position: fixed;
        opacity: 1;
      }
    `
  ]
})
export class ColourLegendButtonComponent implements OnInit {
  @Input() public forceSimulation;
  @Input() public forceXCombine;
  @Input() public forceYCombine;
  @Input() public nClusters: number;
  @Input() public vizWidth: number;
  @Input() public vizHeight: number;
  @Input() public navbarHeight: number;
  public btnHeight = 70;
  public btnStyles = {
    height: this.btnHeight + 'px'
  };
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
    // split the clusters horizontally
    const forceXSeparate = d3
      .forceX(function(d) {
        return (
          // 70% (screen width / number of clusters)
          0.7 *
          ((that.vizWidth / that.nClusters) * d.cluster -
            that.vizWidth / 2 / 0.7)
        );
      })
      .strength(0.3);
    // split the clusters vertically
    const forceYSeparate = d3
      .forceY(function(d) {
        if (d.cluster % 2 === 0) {
          // even clusters go up to 2/6 height
          return -(that.vizHeight / 6) - that.navbarHeight / 2;
        } else {
          // odd clusters go down to 4/6 height
          return that.vizHeight / 6 - that.navbarHeight / 2;
        }
      })
      .strength(0.3);

    if (this.active) {
      this.forceSimulation
        .force('x', forceXSeparate)
        .force('y', forceYSeparate)
        .alpha(0.3)
        .alphaTarget(0.001)
        .restart();
    } else {
      this.forceSimulation
        .force('x', that.forceXCombine)
        .force('y', that.forceYCombine)
        .alpha(0.3)
        .alphaTarget(0.001)
        .restart();
    }
  }
}
