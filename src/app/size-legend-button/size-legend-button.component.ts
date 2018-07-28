import { Component, OnInit, Input, AfterContentInit } from '@angular/core';
import * as d3 from 'd3';
import { AppStatusService } from '../app-status.service';

@Component({
  selector: 'app-size-legend-button',
  template: `
  <button class='sizeBtn btn waves-effect z-depth-3'
    [disabled]="radiusSelector === 'none'"
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
export class SizeLegendButtonComponent implements OnInit, AfterContentInit {
  constructor(private _statusService: AppStatusService) {}
  // static inputs
  @Input() public forceXCombine;
  @Input() public forceYCombine;
  @Input() public nClusters;
  @Input() public width;
  @Input() public height;
  @Input() public navbarHeight;
  // subscriptions
  public radiusRange;
  public radiusSelector;
  public forceSimulation;
  public forceCluster;

  public btnHeight = 70;
  public btnStyles = {
    height: this.btnHeight + 'px',
    width: '130px'
  };
  // public data$ = [];
  public active = false;


  ngOnInit() {
    this._statusService.currentRadiusSelector.subscribe(v => (this.radiusSelector = v));
    this._statusService.currentForceSimulation.subscribe(v => (this.forceSimulation = v));
    this._statusService.currentForceCluster.subscribe(v => (this.forceCluster = v));
    this._statusService.currentRadiusRange.subscribe(v => (this.radiusRange = v));
  }
  ngAfterContentInit() {
  }

  handleClick() {

    this.active = !this.active;
    const that = this;
    // split the clusters horizontally by size

    this._statusService.changeForceSimulation(
      this.forceSimulation
      .force('x', !this.active
        ? that.forceXCombine
        : d3
          .forceX(function (d) {
            return (
              // % screen width
              0.4 *
              // split the width into the range (min, max radius)
              ((that.width / (that.radiusRange[1] - that.radiusRange[0])) // width / radius range
                * d3.select('#circle_' + d.id).attr('r') - // x circle radius
                (that.width / 2)) // - half width (move to center)
            );
            }).strength(0.3)
      )
      // .force('y', that.forceYCombine)
      .force('cluster', this.active ? null : that.forceCluster)
      .alpha(this.active ? 0.4 : 0.3)
      .alphaTarget(this.active ? 0.1 : 0.001)
      .restart()
    );
  }
}
