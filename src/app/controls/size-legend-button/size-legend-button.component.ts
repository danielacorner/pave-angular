import { Component, OnInit, Input, AfterContentInit } from '@angular/core';
import * as d3 from 'd3';
import { AppStatusService } from '../../app-status.service';

@Component({
  selector: 'app-size-legend-button',
  template: `
  <button class='sizeBtn btn waves-effect z-depth-3 white green-text'
    [class.green]="active"
    [disabled]="radiusSelector === 'none'"
    [ngStyle]='btnStyles'
    (click)="handleClick()">
  <div class='grid-container'>
    <div class="btn-text">
      <span>
      <p>Sort by</p>
      <p>sizes</p>
      </span>
    </div>
    <div class="sort-icon valign-wrapper">
      <mat-icon
      [style.transform]="(active ? 'rotate(90deg)' : null)"
      >filter_list</mat-icon>
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
        opacity: 1;

        border: 2px solid #47bf39;
        line-height: 0;
        font-weight: bold;
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
      @media only screen and (max-width: 576px) {
        button {
          transform: scale(0.8);
        }
      }
    `
  ]
})
export class SizeLegendButtonComponent implements OnInit, AfterContentInit {
  constructor(private _statusService: AppStatusService) {}
  // static inputs
  @Input()
  public forceXCombine;
  @Input()
  public forceYCombine;
  @Input()
  public nClusters;
  @Input()
  public width;
  @Input()
  public height;
  @Input()
  public navbarHeight;
  // subscriptions
  public radiusRange;
  public radiusSelector;
  public forceSimulation;
  public forceCluster;
  public colourSortActive;

  public btnHeight = 70;
  public btnStyles = {
    height: this.btnHeight + 'px',
    width: '131px'
  };
  // public data$ = [];
  public active = false;

  ngOnInit() {
    this._statusService.currentRadiusSelector.subscribe(
      v => (this.radiusSelector = v)
    );
    this._statusService.currentForceSimulation.subscribe(
      v => (this.forceSimulation = v)
    );
    this._statusService.currentForceCluster.subscribe(
      v => (this.forceCluster = v)
    );
    this._statusService.currentRadiusRange.subscribe(
      v => (this.radiusRange = v)
    );
    this._statusService.currentColourSortActive.subscribe(
      v => (this.colourSortActive = v)
    );
  }
  ngAfterContentInit() {}

  handleClick() {
    this.active = !this.active;
    const that = this;
    // split the clusters horizontally by size

    this._statusService.changeForceSimulation(
      this.colourSortActive
        ? // if colour sort is active, only modify the x force
          this.forceSimulation
            .force(
              'x',
              !this.active
                ? d3
                    .forceX(function(d) {
                      return (
                        0.4 * ((that.width / that.nClusters) * d.cluster) -
                        (0.4 * that.width) / 2
                      );
                    })
                    .strength(1.2)
                : d3
                    .forceX(function(d) {
                      return (
                        // move to cluster x position
                        0.4 * ((that.width / that.nClusters) * d.cluster) -
                        (0.4 * that.width) / 2 +
                        // move larger radii to right (normalized by radius range)
                        (30 * (d.r - that.radiusRange[0])) /
                          (that.radiusRange[1] - that.radiusRange[0]) -
                        15
                      );
                    })
                    .strength(1.2)
            )
            .force('cluster', this.active ? null : that.forceCluster)
            .alpha(this.active ? 0.4 : 0.3)
            .alphaTarget(this.active ? 0.1 : 0.001)
            .restart()
        : // if colour sort inactive, modify x force and turn off cluster force
          this.forceSimulation
            .force(
              'x',
              !this.active
                ? that.forceXCombine
                : d3
                    .forceX(function(d) {
                      return (
                        (100 * (d.r - that.radiusRange[0])) /
                          (that.radiusRange[1] - that.radiusRange[0]) -
                        50
                      );
                    })
                    .strength(2)
            )
            .force('cluster', this.active ? null : that.forceCluster)
            .alpha(this.active ? 0.4 : 0.3)
            .alphaTarget(this.active ? 0.1 : 0.001)
            .restart()
    );
  }
}
