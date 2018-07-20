import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-tooltip',
  template: `

<div id="tooltip" class="tooltip z-depth-3">
    <mat-card>
          <mat-card-header>
            <div mat-card-avatar class="header-image"></div>
            <mat-card-title>{{data.job}}</mat-card-title>
            <mat-card-subtitle>{{data.sector}}</mat-card-subtitle>
          </mat-card-header>
    </mat-card>
    <mat-accordion>

    <!-- PANEL 1 -->
    <mat-expansion-panel
    class="panel panel-1"
    [ngStyle]="headerStyles"
    [style.paddingBottom]="(headerOpenState ? '0px' : '20px')"
    [expanded]="expanded"
    (opened)="tooltipOpened($event)"
    (closed)="headerOpenState = false;
    hideOnExpanded = 'block';"
    >
      <mat-expansion-panel-header [style.display]="hideOnExpanded">
                <p>
                  Here is a very brief job description; it could be roughly 100 characters.
                </p>
      </mat-expansion-panel-header>

              <img mat-card-image src="../../assets/img/NOC_images/{{data.noc}}.jpg" alt="Photo of a Shiba Inu">
                <p>
                  Here is a longer job description; it could be roughly 250 characters.
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                  Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                </p>

              <mat-action-row class="btn-row">
                <button mat-button> <mat-icon class="btn-icon blue-icon">info</mat-icon> LEARN MORE</button>
                <button mat-button> <mat-icon class="btn-icon orange-icon">star</mat-icon> FAVOURITE</button>
              </mat-action-row>

    </mat-expansion-panel>
    <!-- PANEL 2 -->
    <mat-expansion-panel class="panel">
                <p>
                  Here is a brief job description; it could be roughly 250 characters.
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                  Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                </p>
    </mat-expansion-panel>
    <!-- PANEL 3 -->
    <mat-expansion-panel class="panel">
                  <p>
                  Here is a brief job description; it could be roughly 250 characters.
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                  Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                </p>
    </mat-expansion-panel>

  </mat-accordion>
</div>

  `,
  styles: [
    `
      .tooltip {
        position: absolute;
        text-align: center;
        width: 360px;
        padding: 5px;
        font: 12px sans-serif;
        background: lightgrey;
        border: 0px;
        border-radius: 8px;
      }
      .panel {
      }
      mat-expansion-panel-header {
      }
      .mat-content {
        height: 150px;
      }
      .tooltip-card {
        max-width: 400px;
      }
      .header-image {
        height: 72px;
        width: 72px;
        background-size: cover;
      }
      mat-card-subtitle {
        font-size: 12px;
        margin-bottom: 0px;
      }
      mat-action-row {
        justify-content: center;
        padding: 16px 24px;
      }
      .btn-icon {
        vertical-align: middle;
        display: inline-block;
        margin-top: -4px;
      }
      .blue-icon {
        color: blue;
      }
      .orange-icon {
        color: orange;
      }
    `
  ]
})
export class TooltipComponent implements OnInit, OnDestroy {
  @Input() public tooltipData;
  @Input() public expanded = false;
  public data; // shortcut to access tooltipData.d.all
  public tooltipHeight;
  public tooltipY;
  public headerOpenState = false;
  public hideOnExpanded = 'block';
  public headerStyles = {
    marginBottom: '0px'
    // paddingTop: '20px',
  };

  constructor() {}

  ngOnInit() {
    this.data = this.tooltipData.d.all;
    this.tooltipInit(
      this.tooltipData.d,
      this.tooltipData.x,
      this.tooltipData.y
    );
    // console.log(this.tooltipData.d.all);
  }

  ngOnDestroy(): void {}

  tooltipInit(d, x, y) {
    this.tooltipY = y;
    const that = this;
    // set avatar image
    d3.select('.header-image').style(
      'background-image',
      'url("../../assets/img/NOC_images/' + this.tooltipData.d.all.noc + '.jpg"'
    );
    // position based on height
    d3.select('.tooltip')
      // check top, if > ( window.height - this.height ), top = window.height - this.height
      .style(
        'top', () => {
          // set max-top to prevent content bleeding below page height
          // (1.3 * y * window.innerHeight) / (y + window.innerHeight) <
          // window.innerHeight - this.tooltipHeight
          //   ? (1.3 * y * window.innerHeight) / (y + window.innerHeight) + 'px'
          //   : window.innerHeight - this.tooltipHeight - 20 + 'px'
          // console.log(d)
          return y - 170 + 'px';
        }
      )
      .style(
        'left',
        x > window.innerWidth * 0.5
          ? // right side
            x - 360 - d.r + 'px'
          : // left side
            x + d.r + 'px'
      );

  }

  tooltipOpened(event) {
    this.headerOpenState = true;
    this.hideOnExpanded = 'none';

    console.log(event);
    // if expanded tooltip bleeds below window, move up
    const tooltipHeight = 595;
    if (this.tooltipY + tooltipHeight > window.innerHeight) {
      d3.select('.tooltip').transition().duration(200)
      .style('top', '')
      .style('bottom', 20 + 'px');
    }
  }
}
