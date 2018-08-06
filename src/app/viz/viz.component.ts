import { Component, OnInit, AfterContentInit, HostListener } from '@angular/core';
import * as d3 from 'd3';
import { DataService } from '../data.service';
import { AppStatusService } from '../app-status.service';
import { AppFilterService } from '../app-filter.service';
import { AppSimulationService } from '../app-simulation.service';
import { forceCluster } from 'd3-force-cluster';

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
  templateUrl: 'viz.component.html',
  styleUrls: ['viz.component.scss'],
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
    private _statusService: AppStatusService,
    private _filterService: AppFilterService,
    private _simulationService: AppSimulationService
  ) {}
  // ----- POSITIONING ----- //
  public wdw = window;
  public navbarHeight = 64;
  public height = window.innerHeight - this.navbarHeight;
  public width = window.innerWidth;
  public mobileBreakPoint = 480;

  // ----- CANVAS PROPERTIES ----- //
  public data$ = [];
  public circles;
  public minRadius =
    Math.min(window.innerWidth, window.innerHeight - this.navbarHeight) *
    0.0006; // vmin
  public colourScale = d3.scaleOrdinal(d3.schemeCategory10);
  public canvasStyles = {
    position: 'absolute',
    top: this.navbarHeight + 'px',
    left: 0,
    width: window.innerWidth,
    height: window.innerHeight - this.navbarHeight
  };
  // move the circles into the center
  public gTransform =
    'translate(' +
    window.innerWidth / 2 +
    'px, ' +
    (window.innerHeight - this.navbarHeight) / 2 +
    'px)';

  // ----- FILTER SLIDERS ----- //
  public filterSliders = [
    {
      variable: 'skillsLang',
      title_1: 'Language and',
      title_2: 'Communication'
    },
    { variable: 'skillsLogi', title_1: 'Logic and', title_2: 'Reasoning' },
    { variable: 'skillsMath', title_1: 'Math and', title_2: 'Spatial' },
    {
      variable: 'skillsComp',
      title_1: 'Computer and',
      title_2: 'Information'
    }
  ];

  // ----- CIRCLE PROPERTIES ----- //
  // subscriptions are defined in ngOnInit() through the _statusService
  public subscriptions = [
    'radiusSelector',
    'clusterSelector',
    'uniqueClusterValues',
    'forceCluster',
    'forceGravity',
    'forceSimulation',
    'radiusRange',
    'radiusScale',
    'filteredNodes',
    'nodes',
    'clusterCenters',
    'numClusters',
    'defaultCircleRadius',
    'svgTransform'
  ];
  public radiusSelector = 'none'; // default value because forceGravity defined before subscription
  public clusterSelector;
  public uniqueClusterValues;
  public radiusRange;
  public radiusScale;
  public filteredNodes;
  public nodes;
  public clusterCenters;
  public numClusters;
  public svgTransform = 'scale(1)'; // zoom when fewer nodes

  // ----------------------------------------------------------------------------
  // Simulation & Forces --------------------------------------------------------
  // ----------------------------------------------------------------------------
  // Constants
  public CLUSTERING_AMOUNT = 0.5;
  public DEFAULT_CIRCLE_RADIUS = 1.0;
  public NODE_REPEL = -0.85;
  public NODE_ATTRACT = 0.075; // negative = repel
  // public NODE_ATTRACT = -0.28; // negative = repel
  public CENTER_GRAVITY = 0.0175;
  public NODE_PADDING = -0.1;

  // Responsive force multipliers
  public nodeAttract =
    Math.min(window.innerWidth, window.innerHeight - this.navbarHeight) *
    this.NODE_ATTRACT * this.DEFAULT_CIRCLE_RADIUS;
  public nodeRepel =
    Math.min(window.innerWidth, window.innerHeight - this.navbarHeight) *
    this.NODE_REPEL * this.DEFAULT_CIRCLE_RADIUS;
  // todo: make forceX, Y responsive
  public forceXCombine = d3.forceX().strength(this.CENTER_GRAVITY);
  public forceYCombine = d3.forceY().strength(this.CENTER_GRAVITY);

  public forceCluster;
  public forceSimulation;
  public forceGravity;
  public forceCharge;
  // public forceCollide = null;
  public forceCollide;
  public ticked;
  // tooltip
  public tooltipData;
  public tooltipExpanded = false; // whether the tooltip is expanded
  public autoExpand;
  public justClosed = false; // whether the tooltip was clicked-closed

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

  // --------------------------------------------------------------
  // Update functions
  // --------------------------------------------------------------
  updateForceCluster() {
    this._simulationService.forceCluster(
      this.nodes,
      this.clusterCenters,
      this.CLUSTERING_AMOUNT
    );
  }
  updateForceCollide() {
    this._simulationService.forceCollide(
      this.radiusSelector,
      this.DEFAULT_CIRCLE_RADIUS,
      this.NODE_PADDING
    );
  }
  updateForceGravity() {
    this._simulationService.forceGravity(
      this.radiusSelector,
      this.nodeAttract,
      this.radiusScale
    );
  }
  updateForceCharge() {
    this._simulationService.forceCharge(
      this.radiusSelector,
      this.nodeRepel,
      this.radiusScale
    );
  }
  updateSimulation() {
    this._simulationService.forceSimulation(
      this.forceSimulation,
      this.forceGravity,
      this.forceCollide
    );
  }

  ngOnInit() {
    // pull in the subscriptions
    this.subscriptions.forEach(s => {
      const titleCase = s.charAt(0).toUpperCase() + s.slice(1);
      this._statusService['current' + titleCase].subscribe(v => (this[s] = v));
    });
    this.updateForceCollide();
    this.updateForceGravity();
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    // reposition canvas
    this.canvasStyles.top = this.navbarHeight + 'px';
    this.canvasStyles.width = window.innerWidth;
    this.canvasStyles.height = window.innerHeight - this.navbarHeight;

    // recalculate forces
    this.radiusSelector === 'none'
      ? (this.nodeAttract =
          Math.min(
            event.target.innerWidth,
            event.target.innerHeight - this.navbarHeight
          ) *
          this.NODE_ATTRACT *
          this.DEFAULT_CIRCLE_RADIUS)
      : (this.nodeAttract =
          Math.min(
            event.target.innerWidth,
            event.target.innerHeight - this.navbarHeight
          ) * this.NODE_ATTRACT);

    // change the collision and gravity forces for the new radii
    this.updateForceCluster(); // todo: necessary?
    this.updateForceCollide();
    this.updateForceGravity();
    this.updateSimulation();

    this.gTransform =
      'translate(' +
      event.target.innerWidth / 2 +
      'px,' +
      (window.innerHeight / 2 - this.navbarHeight) +
      'px)';
  }

  ngAfterContentInit() {
    // resolve d3 function scope by saving outer scope
    const that = this;
    // load the data & initialize the nodes
    this._dataService.getData().subscribe(receivedData => {
      this.data$ = receivedData;

      // set the radius scale based on the min, max values in the data
      this._statusService.changeRadiusScale(
        d3
          .scaleSqrt() // sqrt because circle areas
          .domain(
            this.radiusSelector === 'none'
              ? [1, 1] // equal radii if none
              : d3.extent(this.data$, d => +d[this.radiusSelector]) // else min, max
          )
          .range(
            this.radiusSelector === 'none'
              ? Array(2).fill(this.DEFAULT_CIRCLE_RADIUS) // equal radii if none
              : this.radiusRange // else min, max
          )
      );

      // create array of unique cluster values
      this._statusService.changeUniqueClusterValues(
        this.data$
          .map(d => d[that.clusterSelector])
          // filter uniqueOnly
          .filter((value, index, self) => self.indexOf(value) === index)
      );

      // define the nodes
      this._statusService.changeNodes(
        this.data$.map(d => {
          // scale radius to fit on the screen
          const scaledRadius = this.radiusScale(+d[this.radiusSelector]);

          // SELECT THE CLUSTER VARIABLE 2/2
          const forcedCluster =
            this.uniqueClusterValues.indexOf(d[this.clusterSelector]) + 1;

          // define the nodes
          d = {
            id: d.id,
            // circle attributes
            r: scaledRadius,
            cluster: forcedCluster,
            clusterValue: d[that.clusterSelector],
            // skills
            skillsMath: d.skillsMath,
            skillsLogi: d.skillsLogi,
            skillsLang: d.skillsLang,
            skillsComp: d.skillsComp,
            // tooltip info
            all: d
          };
          // add to clusters array if it doesn't exist or the radius is larger than another radius in the cluster
          if (
            !this.clusterCenters[forcedCluster] ||
            scaledRadius > this.clusterCenters[forcedCluster].r
          ) {
            this.clusterCenters[forcedCluster] = d;
            this._statusService.changeClusterCenters(this.clusterCenters);
          }
          return d;
        })
      );

      // circle svg image patterns
      d3.select('#canvas')
        .append('defs')
        .selectAll('.img-pattern')
        .data(this.nodes)
        .enter()
        .append('pattern')
        .attr('class', 'img-pattern')
        .attr('id', d => 'pattern_' + d.id)
        .attr('height', '100%')
        .attr('width', '100%')
        .attr('patternContentUnits', 'objectBoundingBox')
        .append('image')
        .attr('height', 1)
        .attr('width', 1)
        .attr('preserveAspectRatio', 'none')
        .attr(
          'xlink:href',
          d =>
            window.location.href.includes('localhost')
              ? '../../assets/img/NOC_thumbnails/tn_' + d.all.noc + '.jpg'
              : '../../pave-angular/assets/img/NOC_thumbnails/tn_' +
                d.all.noc +
                '.jpg'
        );

      // append the circles to svg then style
      // add functions for interaction
      this.circles = d3
        .select('.circlesG')
        .selectAll('circle')
        .data(this.nodes)
        .enter()
        .append('svg:circle')
        .style('opacity', 0)
        .attr('id', d => 'circle_' + d.id)
        .attr('r', d => d.r + 'vmin')
        .attr('fill', d => this.colourScale(d.cluster))
        .call(
          d3
            .drag()
            .on('start', this.dragstarted)
            .on('drag', this.dragged)
            .on('end', this.dragended)
        )
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
            .attr('stroke', 'black');
          // start the clock for auto-expansion after 2 seconds unless clicked-closed
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
          d3.selectAll('circle').attr('stroke', d =>
            this.colourScale(d.cluster)
          );
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
          .attr('stroke', d => this.colourScale(d.cluster))
          .delay((d, i) => i * 3);
      }, 500);

      this.ticked = () => {
        that.circles.attr('cx', d => d.x).attr('cy', d => d.y);
      };

      // create the forceCluster/collision force simulation
      const newForceSimulation = d3
        .forceSimulation(this.nodes)
        // .velocityDecay(0.3)
        .force('x', that.forceXCombine)
        .force('y', that.forceYCombine)
        .force('collide', that.forceCollide)
        .force('gravity', that.forceGravity)
        .force('charge', that.forceCharge)
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

  // Filter slider function: $event = skill level, filterVariable = skill name
  handleSliderUpdate($event, filterVariable) {
    // update the nodes with the new slider positions
    this._filterService.filterViz($event, filterVariable, this.nodes);
    // UPDATE the viz data
    this.circles = this.circles.data(this.filteredNodes, d => d.id);
    // EXIT
    this.circles
      .exit()
      .transition()
      .duration(500)
      // exit "pop" transition: enlarge radius & fade out
      // todo: edit pop size based on d.r
      .attr('r', d => d.r * 1.75 + 'vmin')
      .styleTween('opacity', d => {
        const i = d3.interpolate(1, 0);
        return t => i(t);
      })
      .remove();
    // ENTER and MERGE
    this.circles = this.circles
      .data(this.filteredNodes)
      .enter()
      .append('svg:circle')
      .attr('r', d => d.r + 'vmin')
      .attr('fill', d => this.colourScale(d.cluster))
      .attr('stroke', d => this.colourScale(d.cluster))
      // add tooltips to each circle
      .on('mouseover', d => {
        // initialize the tooltip
        this.tooltipData = {
          d: d,
          x: d.x + this.width / 2,
          y: d.y + this.height / 2
        };
        // highlight the circle border
        d3.selectAll('circle')
          .filter(c => c.id === d.id)
          .attr('stroke', 'black');
        // start the clock for auto-expansion after 2 seconds unless clicked-closed
        if (!this.justClosed) {
          this.autoExpand = setTimeout(() => {
            this.tooltipExpanded = true;
          }, 2000);
        }
      })
      .on('mouseout', () => {
        // clear the autoExpand timeout
        clearTimeout(this.autoExpand);
        // remove the border highlight
        d3.selectAll('circle').attr('stroke', d => this.colourScale(d.cluster));
        // remove the tooltip unless expanded
        if (this.tooltipExpanded) {
          return;
        } else {
          this.tooltipData = null;
        }
        this.justClosed = false;
      })
      .on('click', () => {
        this.tooltipExpanded = !this.tooltipExpanded;
        if (!this.tooltipExpanded) {
          this.justClosed = true;
          this.tooltipData = null;
        }
      })
      .merge(this.circles);

    // ZOOM to fit remaining of circles
    // todo: if size-changed circles don't fit, calculate zoom based on total circle area
    const zoomAmount = Math.pow(
      this.nodes.length / this.filteredNodes.length,
      0.45 // less than sqrt (0.5) to reduce overflow
    );
    this._statusService.changeSvgTransform('scale(' + zoomAmount + ')');

    // fill circles with images if <40 remain
    setTimeout(() => {
      this.filteredNodes.length <= 40
        ? this.circles
            .attr('fill-opacity', 0.2)
            .attr('fill', d => 'url(#pattern_' + d.id + ')')
            .attr('stroke', d => this.colourScale(d.cluster))
            .transition()
            .duration(1000)
            .attr('fill-opacity', 1)
            .call(
              d3
                .drag()
                .on('start', this.dragstarted)
                .on('drag', this.dragged)
                .on('end', this.dragended)
            )
        : this.circles.attr('fill', d => this.colourScale(d.cluster)).call(
            d3
              .drag()
              .on('start', this.dragstarted)
              .on('drag', this.dragged)
              .on('end', this.dragended)
          );
    }, 1000);

    // Update nodes and restart the simulation.
    this._statusService.changeForceSimulation(
      this.forceSimulation
        .nodes(this.filteredNodes)
        .alpha(0.3)
        .restart()
    );
  }
}
