import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-tooltip',
  template: `
    <div class="tooltip z-depth-3">

    <mat-expansion-panel>
      <mat-expansion-panel-header>

        <mat-card class="tooltip-card">

          <mat-card-header>
            <div mat-card-avatar class="header-image"></div>
            <mat-card-title>{{data.job}}</mat-card-title>
            <mat-card-subtitle>{{data.sector}}</mat-card-subtitle>
          </mat-card-header>

          <img mat-card-image src="../../assets/img/NOC_images/{{tooltipData.d.all.noc}}.jpg" alt="Photo of a Shiba Inu">

              <mat-panel-title>
                This is the expansion title
              </mat-panel-title>
              <mat-panel-description>
                This is a summary of the content
              </mat-panel-description>

        </mat-card>

      </mat-expansion-panel-header>

      <p>
        Here is a brief job description; it will be roughly 250 characters.
        Lorem Ipsum is simply dummy text of the printing and typesetting industry.
        Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
      </p>

      <mat-action-row>
            <button mat-button><mat-icon>info</mat-icon> LEARN MORE</button>
            <button mat-button><mat-icon>star</mat-icon> FAVOURITE</button>
      </mat-action-row>

    </mat-expansion-panel>


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
      .tooltip-card {
        max-width: 400px;
      }
      .header-image {
        background-size: cover;
      }
      mat-card-subtitle {
        font-size: 12px;
      }
    `
  ]
})
export class TooltipComponent implements OnInit, OnDestroy {
  @Input() public tooltipData;
  public data; // shortcut to access tooltipData.d.all
  public tooltipHeight;
  public panelOpenState = false;

  constructor() {}

  ngOnInit() {
    this.data = this.tooltipData.d.all;
    this.tooltipInit(
      this.tooltipData.d,
      this.tooltipData.x,
      this.tooltipData.y
    );
    console.log(this.tooltipData.d.all);
  }

  ngOnDestroy(): void {}

  tooltipInit(d, x, y) {
    // set avatar image
    d3.select('.header-image').style(
      'background-image',
      'url("../../assets/img/NOC_images/' + this.tooltipData.d.all.noc + '.jpg"'
    );
    // get tooltip height
    this.tooltipHeight = document
      .getElementsByClassName('tooltip')[0]
      .getBoundingClientRect().height;
    // position based on height
    d3.select('.tooltip')
      // check top, if > ( window.height - this.height ), top = window.height - this.height
      .style(
        'top',
        // set max-top to prevent content bleeding below page height
        (1.3 * y * window.innerHeight) / (y + window.innerHeight) <
        window.innerHeight - this.tooltipHeight
          ? (1.3 * y * window.innerHeight) / (y + window.innerHeight) + 'px'
          : window.innerHeight - this.tooltipHeight - 20 + 'px'
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
}
