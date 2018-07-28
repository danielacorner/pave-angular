import { Component, OnInit, AfterContentInit, Input } from '@angular/core';
import * as d3 from 'd3';
import { DataService } from '../data.service';
import { AppStatusService } from '../app-status.service';

import {
  trigger,
  state,
  style,
  animate,
  transition,
  query,
  animateChild
} from '@angular/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-viz',
  template: `
  <div>
    <svg [ngStyle]="canvasStyles" (click)="closeTooltip($event)">
      <g class="circlesG" *ngIf="data$" [style.transform]="gTransform">
      </g>
    </svg>

    <div class='container'>

      <app-filter-slider class="sliderLang"
      (childEvent)="handleSliderUpdate($event, 'language')"
      [filterVariable]="'language'"
      [title1]="'Language and'"
      [title2]="'Communication skills'"
      ></app-filter-slider>

      <app-filter-slider class="sliderLogi"
      (childEvent)="handleSliderUpdate($event, 'logic')"
      [filterVariable]="'logic'"
      [title1]="'Logic and'"
      [title2]="'Reasoning skills'"
      ></app-filter-slider>

      <app-filter-slider class="sliderMath"
      (childEvent)="handleSliderUpdate($event, 'math')"
      [filterVariable]="'math'"
      [title1]="'Math and'"
      [title2]="'Spatial skills'"
      ></app-filter-slider>

      <app-filter-slider class="sliderComp"
      (childEvent)="handleSliderUpdate($event, 'computer')"
      [filterVariable]="'computer'"
      [title1]="'Computer and'"
      [title2]="'Information skills'"
      ></app-filter-slider>

      <app-graph-mode
      [nodes]="nodes"
      [forceXCombine]="forceXCombine"
      [forceYCombine]="forceYCombine"
      [nClusters]="numClusters"
      [width]="width"
      [height]="height"
      [navbarHeight]="navbarHeight"
      ></app-graph-mode>

      <app-colour-legend-button
      [forceXCombine]="forceXCombine"
      [forceYCombine]="forceYCombine"
      [nClusters]="numClusters"
      [width]="width"
      [height]="height"
      [navbarHeight]="navbarHeight"
      ></app-colour-legend-button>

      <app-size-legend-button
      [forceXCombine]="forceXCombine"
      [forceYCombine]="forceYCombine"
      [nClusters]="numClusters"
      [width]="width"
      [height]="height"
      [navbarHeight]="navbarHeight"
      ></app-size-legend-button>

      <app-change-sizes-dropdown
      [nodeAttraction]="nodeAttraction"
      [nodePadding]="nodePadding"
      [minRadius]="minRadius"
      [width]="width"
      [maxCircleScreenFraction]="maxCircleScreenFraction"
      [defaultCircleRadius]="defaultCircleRadius"
      [defaultNodeAttraction]="defaultNodeAttraction"
      ></app-change-sizes-dropdown>

      <app-change-colours-dropdown
      [colourScale]="colourScale"
      [uniqueClusterValues]="uniqueClusterValues"
      [clusterCenters]="clusterCenters"
      [nodes]="nodes"
      ></app-change-colours-dropdown>

    </div>

    <div *ngIf="tooltipData" @ngIfAnimation
    >
      <app-tooltip @easeInOut
      [tooltipData]="tooltipData"
      [expanded]="tooltipExpanded"
      ></app-tooltip>
    </div>

  </div>
  `,
  styles: [
    `
      .sliderLang{
        position: fixed;
        top: 100px;
        left: 20px;
      }
      .sliderLogi{
        position: fixed;
        top: 100px;
        right: 20px;
      }
      .sliderMath{
        position: fixed;
        bottom: 100px;
        left: 20px;
      }
      .sliderComp{
        position: fixed;
        bottom: 100px;
        right: 20px;
      }

    `
  ],
  animations: [
    trigger('ngIfAnimation', [
      transition(':enter, :leave', [query('@*', animateChild())])
    ]),
    trigger('easeInOut', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate('200ms ease-in-out', style({ opacity: 1 }))
      ])
      // TODO: transition-out bug opens tooltip before deleting
      // transition('* => void', [
      //   style({ opacity: '*' }),
      //   animate('400ms ease-in-out', style({ opacity: 0 }))
      // ])
    ])
  ]
})
export class VizComponent implements OnInit, AfterContentInit {
  constructor(
    private _dataService: DataService,
    private _statusService: AppStatusService
  ) {}
  // positioning
  public navbarHeight = 64;
  public height = window.innerHeight - this.navbarHeight;
  public width = window.innerWidth;
  // the graphing canvas
  public canvasStyles = {
    position: 'absolute',
    top: this.navbarHeight + 'px',
    width: this.width,
    height: this.height
  };
  // move the circles into the center
  public gTransform =
    'translate(' + this.width / 2 + 'px,' + this.height / 2 + 'px)';
  // data
  public data$ = [];

  // ----- CIRCLE PROPERTIES ----- //
  public padding = 1.5; // separation between same-color circles
  public clusterPadding = 6; // separation between different-color circles
  // radius range
  public minRadius = window.innerWidth * 0.004;
  public maxCircleScreenFraction = window.innerWidth * 0.03;
  // public maxRadius = window.innerWidth * 0.025;
  public radiusRange; // subscription
  public radiusScale;

  // custom circle sizes and colours/clusters
  // ----- STARTING RADIUS & CLUSTERS ----- //
  public radiusSelector; // subscription
  public defaultCircleRadius = window.innerWidth * 0.0083;
  public clusterSelector; // subscription
  public uniqueClusterValues; // subscription
  public forceCluster; // subscription
  public forceSimulation; // subscription
  // circles and clusters
  public nodes = [];
  public circles;
  public numClusters = 10; // number of distinct clusters
  public colourScale = d3.scaleOrdinal(d3.schemeCategory10);
  public clusterCenters = new Array(this.numClusters);

  // ----- SIMULATION & FORCES ----- //
  public defaultNodeAttraction = window.innerWidth * -0.23; // negative = repel
  public nodeAttraction = -3.14; // negative = repel
  public nodePadding = 1;
  public centerGravity = 1.75;
  public forceXCombine = d3.forceX().strength(this.centerGravity);
  public forceYCombine = d3.forceY().strength(this.centerGravity);
  public forceGravity = d3
    .forceManyBody()
    .strength(
      this.radiusSelector === 'none'
        ? this.defaultNodeAttraction
        : d => Math.pow(d.r, 2) * this.nodeAttraction + 3
    );
  public forceCollide = null;
  // public forceCollide = d3.forceCollide().radius(d => d.r + this.nodePadding);
  public ticked;
  // tooltip
  public tooltipData;
  public tooltipExpanded = false;
  public autoExpand;
  public justClosed = false;

  // Drag functions used for interactivity
  public dragstarted = d => {
    if (!d3.event.active) {
      this.forceSimulation.alphaTarget(0.3).restart();
    }
    d.fx = d.x;
    d.fy = d.y;
  };
  public dragged = d => {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  };
  public dragended = d => {
    if (!d3.event.active) {
      this.forceSimulation.alphaTarget(0);
    }
    d.fx = null;
    d.fy = null;
  };

  ngOnInit() {
    this._statusService.currentRadiusSelector.subscribe(
      v => (this.radiusSelector = v)
    );
    this._statusService.currentClusterSelector.subscribe(
      v => (this.clusterSelector = v)
    );
    this._statusService.currentUniqueClusterValues.subscribe(
      v => (this.uniqueClusterValues = v)
    );
    this._statusService.currentForceCluster.subscribe(
      v => (this.forceCluster = v)
    );
    this._statusService.currentForceSimulation.subscribe(
      v => (this.forceSimulation = v)
    );
    this._statusService.currentRadiusRange.subscribe(
      v => (this.radiusRange = v)
    );
    this._statusService.currentRadiusScale.subscribe(
      v => (this.radiusScale = v)
    );
  }

  ngAfterContentInit() {
    // resolve d3 function scope by saving outer scope
    const that = this;
    // load the data & initialize the nodes
    this._dataService.getData().subscribe(receivedData => {
      this.data$ = receivedData;
      // set the circle radii based on window width
      this._statusService.changeRadiusRange([
        this.minRadius,
        // max radius = output * normalized maximum
        this.maxCircleScreenFraction
      ]);

      this._statusService.changeRadiusScale(
        d3
          .scaleSqrt() // sqrt because circle areas
          .domain(
            this.radiusSelector === 'none'
              ? [1, 1]
              : d3.extent(this.data$, d => +d[that.radiusSelector])
          )
          .range(
            this.radiusSelector === 'none'
              ? Array(2).fill(this.defaultCircleRadius)
              : this.radiusRange
          )
      );

      // convert each unique value to a cluster number
      this._statusService.changeUniqueClusterValues(
        this.data$
          .map(d => d[that.clusterSelector])
          // filter uniqueOnly
          .filter((value, index, self) => self.indexOf(value) === index)
      );

      // define the nodes
      // todo: subscribe to nodes?
      this.nodes = this.data$.map(d => {
        // scale radius to fit on the screen
        const scaledRadius = this.radiusScale(+d[this.radiusSelector]);

        // SELECT THE CLUSTER VARIABLE 2/2
        const forcedCluster =
          this.uniqueClusterValues.indexOf(d[that.clusterSelector]) + 1;

        // define the nodes
        d = {
          id: d.id,
          // circle attributes
          r: scaledRadius,
          cluster: forcedCluster,
          clusterValue: d[that.clusterSelector],
          // skills
          math: d.skillsMath,
          logic: d.skillsLogi,
          language: d.skillsLang,
          computer: d.skillsComputer,
          // tooltip info
          all: d
        };
        // add to clusters array if it doesn't exist or the radius is larger than another radius in the cluster
        if (
          !this.clusterCenters[forcedCluster] ||
          scaledRadius > this.clusterCenters[forcedCluster].r
        ) {
          this.clusterCenters[forcedCluster] = d;
        }
        return d;
      });

      // append the circles to svg then style
      // add functions for interaction
      this.circles = d3
        .select('.circlesG')
        .selectAll('.circle')
        .data(that.nodes)
        .enter()
        .append('circle')
        .style('opacity', 0)
        .attr('id', d => 'circle_' + d.id)
        .attr('r', d => d.r)
        .attr('fill', d => this.colourScale(d.cluster))
        .call(
          d3
            .drag()
            .on('start', that.dragstarted)
            .on('drag', that.dragged)
            .on('end', that.dragended)
        )
        // TODO: extract tooltips - add tooltips to each circle
        .on('mouseover', d => {
          // initialize the tooltip
          that.tooltipData = {
            d: d,
            x: d.x + that.width / 2,
            y: d.y + that.height / 2
          };
          // highlight the circle border
          d3.selectAll('circle')
            .filter(c => c.id === d.id)
            .attr('stroke', 'black')
            .style('stroke-width', '2px');
          // start the clock for auto-expansion after 2 seconds unless click-closed
          if (!that.justClosed) {
            that.autoExpand = setTimeout(() => {
              that.tooltipExpanded = true;
            }, 2000);
          }
        })
        .on('mouseout', () => {
          // clear the autoExpand timeout
          clearTimeout(that.autoExpand);
          // remove the border highlight
          d3.selectAll('circle').attr('stroke', 'none');
          // remove the tooltip unless expanded
          if (that.tooltipExpanded) {
            return;
          } else {
            that.tooltipData = null;
          }
          that.justClosed = false;
        })
        .on('click', () => {
          that.tooltipExpanded = !that.tooltipExpanded;
          if (!that.tooltipExpanded) {
            that.justClosed = true;
          }
        });

      setTimeout(() => {
        this.circles
          .transition()
          .duration(1500)
          .style('opacity', 1)
          .delay((d, i) => i * 3);
      }, 500);

      this.ticked = () => {
        that.circles.attr('cx', d => d.x).attr('cy', d => d.y);
      };

      // These are implementations of the custom forces.
      const newForceCluster = alpha => {
        that.nodes.forEach(d => {
          const cluster = that.clusterCenters[d.cluster];
          if (cluster === d) {
            return;
          }
          let x = d.x - cluster.x,
            y = d.y - cluster.y,
            l = Math.sqrt(x * x + y * y);
          const r = d.r + cluster.r;
          if (l !== r) {
            l = ((l - r) / l) * alpha;
            d.x -= x *= l;
            d.y -= y *= l;
            cluster.x += x;
            cluster.y += y;
          }
        });
      };

      this._statusService.changeForceCluster(newForceCluster);

      // create the forceCluster/collision force simulation
      const newForceSimulation = d3
        .forceSimulation(this.nodes)
        // .velocityDecay(0.3)
        .force('x', that.forceXCombine)
        .force('y', that.forceYCombine)
        .force('collide', that.forceCollide)
        .force('gravity', that.forceGravity)
        .force('cluster', that.forceCluster)
        .on('tick', that.ticked);

      this._statusService.changeForceSimulation(newForceSimulation);
    });
  } // end ngAfterContentinit

  // close tooltip on background click
  closeTooltip($event) {
    if ($event.target.nodeName === 'svg' && this.tooltipExpanded) {
      this.tooltipExpanded = false;
      d3.select('app-tooltip')
        .transition()
        .duration(300)
        .style('opacity', 0);
    }
  }

  // Filter slider function
  handleSliderUpdate($event, filterVariable) {
    const that = this;
    // update the viz with the slider value, $event
    // update the nodes from the data
    // TODO: faster = include skills values in the nodes initially and ONLY filter the nodes
    const filteredNodes = this.nodes.filter(d => d[filterVariable] >= $event);

    // UPDATE the viz data
    this.circles = this.circles.data(filteredNodes, d => d.id);
    // EXIT
    this.circles
      .exit()
      .transition()
      .duration(500)
      // exit "pop" transition: enlarge radius & fade out
      .attr('r', $(window).height() * 0.03)
      .styleTween('opacity', d => {
        const i = d3.interpolate(1, 0);
        return t => i(t);
      })
      .remove();
    // ENTER and MERGE
    this.circles = this.circles
      .enter()
      .append('circle')
      .attr('r', d => d.r)
      .attr('fill', d => that.colourScale(d.cluster))
      // add tooltips to each circle
      // TODO: extract tooltips
      .on('mouseover', d => {
        that.tooltipData = {
          d: d,
          x: d.x + that.width / 2,
          y: d.y + that.height / 2
        };
        d3.select('app-tooltip')
          .transition()
          .duration(200)
          .style('opacity', 0.9);
      })
      .on('mouseout', () => {
        that.tooltipData = null;
      })
      .merge(this.circles);

    // todo: modify to eliminate "freeze twitch" on drag-call (temporarily delayed by 2000ms)
    // todo: fix by settimeout 0 for each individual circle?
    setTimeout(() => {
      that.circles.call(
        d3
          .drag()
          .on('start', that.dragstarted)
          .on('drag', that.dragged)
          .on('end', that.dragended)
      );
    }, 2000);
    // Update nodes and restart the simulation.
    this._statusService.changeForceSimulation(
      this.forceSimulation
        .nodes(filteredNodes)
        .alpha(0.3)
        .restart()
    );
  }
}
