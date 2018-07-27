import { Component, OnInit, AfterContentInit, Input } from '@angular/core';
import * as d3 from 'd3';
import { DataService } from '../data.service';
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
      ></app-filter-slider>

      <app-graph-mode
      [nodes]="nodes"
      [forceSimulation]="forceSimulation"
      [forceXCombine]="forceXCombine"
      [forceYCombine]="forceYCombine"
      [forceCluster]="forceCluster"
      [nClusters]="numClusters"
      [width]="width"
      [height]="height"
      [navbarHeight]="navbarHeight"
      [radiusRange]="radiusRange"
      ></app-graph-mode>

      <app-colour-legend-button
      [forceSimulation]="forceSimulation"
      [forceXCombine]="forceXCombine"
      [forceYCombine]="forceYCombine"
      [forceCluster]="forceCluster"
      [nClusters]="numClusters"
      [width]="width"
      [height]="height"
      [navbarHeight]="navbarHeight"
      [uniqueClusterValues]="uniqueClusterValues"
      [clusterSelector]="clusterSelector"
      [radiusRange]="radiusRange"
      ></app-colour-legend-button>

      <app-size-legend-button
      [forceSimulation]="forceSimulation"
      [forceXCombine]="forceXCombine"
      [forceYCombine]="forceYCombine"
      [forceCluster]="forceCluster"
      [nClusters]="numClusters"
      [width]="width"
      [height]="height"
      [navbarHeight]="navbarHeight"
      [radiusRange]="radiusRange"
      ></app-size-legend-button>

      <app-change-sizes-dropdown
      [radiusSelector]="radiusSelector"
      [radiusRange]="radiusRange"
      [radiusScale]="radiusScale"
      [forceSimulation]="forceSimulation"
      [nodeAttraction]="nodeAttraction"
      [nodePadding]="nodePadding"
      [defaultCircleRadius]="defaultCircleRadius"
      [defaultNodeAttraction]="defaultNodeAttraction"
      ></app-change-sizes-dropdown>

      <app-change-colours-dropdown
      [clusterSelector]="clusterSelector"
      [colourScale]="colourScale"
      [uniqueClusterValues]="uniqueClusterValues"
      [clusterCenters]="clusterCenters"
      [nodes]="nodes"
      [forceSimulation]="forceSimulation"
      [forceCluster]="forceCluster"
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
  styles: [``],
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
  constructor(private _dataService: DataService) {}
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
  // radius range: [ highest of (4 or 0.0017 width) , highest of (10 or 0.019 width) ]
  public minRadius = window.innerWidth * 0.004;
  // public minRadius = (window.innerWidth * 0.0017 > 5 ? window.innerWidth * 0.0017 : 5);
  public maxRadius = window.innerWidth * 0.025;
  // public maxRadius = (window.innerWidth * 0.019 > 10 ? window.innerWidth * 0.019 : 10);
  public radiusRange = [this.minRadius, this.maxRadius];
  public radiusScale;
  // custom circle sizes and colours/clusters
  // ----- STARTING RADIUS & CLUSTERS ----- //
  public radiusSelector = 'none';
  public defaultCircleRadius = window.innerWidth * 0.0083;
  public clusterSelector = 'industry';
  public uniqueClusterValues;
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
  public forceSimulation;
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
  public forceCluster;
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

  ngOnInit() {}

  ngAfterContentInit() {
    // resolve d3 function scope by saving outer scope
    const that = this;
    // load the data & initialize the nodes
    this._dataService.getData().subscribe(receivedData => {
      this.data$ = receivedData;
      // SELECT THE RADIUS VARIABLE
      this.radiusSelector = 'none';
      this.radiusScale = d3
        .scaleSqrt() // sqrt because circle areas
        .domain(
          this.radiusSelector === 'none'
            ? [1, 1]
            : d3.extent(this.data$, d => +d[that.radiusSelector])
        )
        .range(
          this.radiusSelector === 'none'
            ? Array(2).fill(this.defaultCircleRadius)
            : [this.minRadius, this.maxRadius]
        );

      // convert each unique value to a cluster number
      this.uniqueClusterValues = this.data$
        .map(d => d[that.clusterSelector])
        // filter uniqueOnly
        .filter((value, index, self) => self.indexOf(value) === index);

      // define the nodes
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
      }, 1000);

      this.ticked = () => {
        that.circles.attr('cx', d => d.x).attr('cy', d => d.y);
      };

      // These are implementations of the custom forces.
      this.forceCluster = alpha => {
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

      // create the forceCluster/collision force simulation
      this.forceSimulation = d3
        .forceSimulation(this.nodes)
        // .velocityDecay(0.3)
        .force('x', that.forceXCombine)
        .force('y', that.forceYCombine)
        .force('collide', that.forceCollide)
        .force('gravity', that.forceGravity)
        .force('cluster', that.forceCluster)
        .on('tick', that.ticked);
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

    // todo: modify to eliminate "freeze twitch" on drag-call
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
    this.forceSimulation
      .nodes(filteredNodes)
      .alpha(0.3)
      .restart();
  }
}
