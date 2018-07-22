import { Component, OnInit, Input } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-colour-legend-button',
  template: `
  <button class='btn waves-effect z-depth-3'
    [ngStyle]='btnStyles'
    [style.top]="((height / 2) + navbarHeight - btnHeight) + 'px'"
    [style.left]="'5%'"
    (click)="handleClick()">
  <div class='grid-container'>
    <div class="sort-icon valign-wrapper">
      <mat-icon
      [style.transform]="(active ? 'rotate(-90deg)' : null)"
      >filter_list</mat-icon>
    </div>
    <div class="btn-text">
      <span>
      <p>Sort by</p>
      <p>Colours</p>
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
        grid-column: 2;
        grid-row: 1;
      }
      .btn-text {
        text-align: center;
        grid-column: 1;
        grid-row: 1;
      }
      mat-icon {
        transition: transform 0.2s;
      }
    `
  ]
})
export class ColourLegendButtonComponent implements OnInit {
  @Input() public buttonData;
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
  public active = false;
  constructor() {}

  ngOnInit() {
  }

  handleClick() {
    this.active = !this.active;
    const that = this;
    // split the clusters horizontally
    const forceXSeparate = d3
      .forceX(function(d) {
        if (d.id === 1) {
          console.log(that.width);
          console.log(window.innerWidth);
          console.log(that.nClusters);
          console.log(d);
          console.log(d.cluster);
        }
        return (
          // 40% (screen width / number of clusters)
          0.4 * ((that.width / that.nClusters) * d.cluster) -
          (0.4 * that.width) / 2
        );
      })
      .strength(0.3);
    // split the clusters vertically
    const forceYSeparate = d3
      .forceY(function(d) {
        if (d.cluster % 2 === 0) {
          // even clusters go up to 2/6 height
          return -that.height / 12;
        } else {
          // odd clusters go down to 4/6 height
          return that.height / 12;
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
