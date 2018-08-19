import {
  Component,
  OnInit,
  AfterContentInit,
  HostListener,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import * as d3 from 'd3';
import { DataService } from '../services/data.service';
import { AppStatusService } from '../services/app-status.service';
import { AppFilterService } from '../services/app-filter.service';
import { AppSimulationService } from '../services/app-simulation.service';
import { DomSanitizer } from '@angular/platform-browser';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    private _simulationService: AppSimulationService,
    private _sanitizer: DomSanitizer,
    private ref: ChangeDetectorRef
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
    (window.innerHeight - this.navbarHeight + 80) / 2 +
    'px)';

  // ----- FILTER SLIDERS ----- //
  public filterSliders = [
    {
      variable: 'skillsLang',
      title: 'Language and Communication'
    },
    { variable: 'skillsLogi', title: 'Logic and Reasoning' },
    { variable: 'skillsMath', title: 'Math and Spatial' },
    {
      variable: 'skillsComp',
      title: 'Computer and Information'
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
  public forceCluster;
  public forceSimulation;
  public radiusRange;
  public radiusScale;
  public filteredNodes;
  public nodes;
  public clusterCenters;
  public numClusters;
  public svgTransform = 'scale(1)'; // zoom when fewer nodes

  // ----- SIMULATION & FORCES ----- //
  // public clusteringAmount = 0.5;
  public defaultCircleRadius = 1.0;
  public nodeAttractionConstant = -0.28; // negative = repel
  public nodeAttraction =
    Math.min(window.innerWidth, window.innerHeight - this.navbarHeight) *
    this.nodeAttractionConstant *
    this.defaultCircleRadius; // negative = repel
  public centerGravity = 1.75;
  public forceXCombine = d3.forceX().strength(this.centerGravity);
  public forceYCombine = d3.forceY().strength(this.centerGravity);
  public forceGravity;
  public nodePadding = -1;
  // public forceCollide = null;
  public forceCollide;
  public ticked;
  // tooltip
  public tooltipData;
  public tooltipExpanded = false; // whether the tooltip is expanded
  public autoExpand;
  public justClosed = false; // whether the tooltip was clicked-closed

  mobileSliderActive = {
    skillsLang: false,
    skillsLogi: false,
    skillsMath: false,
    skillsComp: false
  };

  // // Drag functions used for interactivity
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
    // pull in the subscriptions
    this.subscriptions.forEach(s => {
      const titleCase = s.charAt(0).toUpperCase() + s.slice(1);
      this._statusService['current' + titleCase].subscribe(v => (this[s] = v));
    });
    this.updateForceCollide();
    this.updateForceGravity();
  }
  updateForceCollide() {
    this._simulationService.forceCollide(
      this.radiusSelector,
      this.defaultCircleRadius,
      this.nodePadding
    );
  }
  updateForceGravity() {
    this._simulationService.forceGravity(
      this.radiusSelector,
      this.nodeAttraction,
      this.radiusScale
    );
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    // reposition canvas
    this.canvasStyles.top = this.navbarHeight + 'px';
    this.canvasStyles.width = event.target.innerWidth;
    this.canvasStyles.height = event.target.innerHeight - this.navbarHeight;

    // recalculate forces
    this.radiusSelector === 'none'
      ? (this.nodeAttraction =
          Math.min(
            event.target.innerWidth,
            event.target.innerHeight - this.navbarHeight
          ) *
          this.nodeAttractionConstant *
          this.defaultCircleRadius)
      : (this.nodeAttraction =
          Math.min(
            event.target.innerWidth,
            event.target.innerHeight - this.navbarHeight
          ) * this.nodeAttractionConstant);

    // change the collision and gravity forces for the new radii
    this.updateForceCollide();
    this.updateForceGravity();

    // start the simulation
    this._statusService.changeForceSimulation(
      this.forceSimulation
        .force('gravity', this.forceGravity)
        .force('collide', this.forceCollide)
        .alpha(0.3)
        .restart()
    );

    this.gTransform =
      'translate(' +
      event.target.innerWidth / 2 +
      'px,' +
      (event.target.innerHeight - this.navbarHeight + 80) / 2 +
      'px)';
  }

  ngAfterContentInit() {
    // load the data & initialize the nodes
    this._dataService.getData().subscribe(receivedData => {
      this.data$ = receivedData;

      // set the radius scale based on the min, max values in the data
      this._statusService.changeRadiusScale(
        d3
          .scaleSqrt() // sqrt because circle areas
          .domain(
            this.radiusSelector === 'none'
              ? [1, 1]
              : d3.extent(this.data$, d => +d[this.radiusSelector])
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
          .map(d => d[this.clusterSelector])
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
            clusterValue: d[this.clusterSelector],
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

      // append the circles to svg then style
      // add functions for interaction
      this.circles = d3
        .select('.circlesG')
        .selectAll('circle')
        .data(this.nodes)
        .enter()
        .append('svg:circle')
        .style('opacity', 0)
        .style('stroke', 'black')
        .style('stroke-width', 0)
        .attr('id', d => 'circle_' + d.id)
        .attr('class', 'circle')
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
          this.tooltipData = {
            d: d,
            x: d.x + this.width / 2,
            y: d.y + this.height / 2
          };

          // highlight the circle border
          d3.select('#circle_' + d.id)
            //   .filter(c => c.id === d.id)
            .style('stroke-width', 1);
          // start the clock for auto-expansion after 2 seconds unless clicked-closed
          if (!this.justClosed) {
            this.autoExpand = setTimeout(() => {
              this.tooltipExpanded = true;
            }, 2000);
          }
        })
        .on('mouseout', d => {
          // clear the autoExpand timeout
          clearTimeout(this.autoExpand);
          // remove the border highlight
          d3.select('#circle_' + d.id).style('stroke-width', 0);
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
          }
        });

      setTimeout(() => {
        this.circles
          .transition()
          .duration(1500)
          .style('opacity', 1)
          // .attr('stroke', d => this.colourScale(d.cluster))
          .delay((d, i) => i * 3);
      }, 500);

      this._simulationService.forceCluster(this.nodes, this.clusterCenters);

      // create the forceCluster/collision force simulation
      const newForceSimulation = d3
        .forceSimulation(this.nodes)
        // .velocityDecay(0.3)
        .force('x', this.forceXCombine)
        .force('y', this.forceYCombine)
        .force('collide', this.forceCollide)
        .force('gravity', this.forceGravity)
        .force('cluster', this.forceCluster)
        .on('tick', () => {
          this.ref.markForCheck();
          this.circles.attr('cx', d => d.x).attr('cy', d => d.y);
        });

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
      // .attr('stroke', d => this.colourScale(d.cluster))
      // add tooltips to each circle
      .on('mouseover', d => {
        // initialize the tooltip
        this.tooltipData = {
          d: d,
          x: d.x + this.width / 2,
          y: d.y + this.height / 2
        };
        // highlight the circle border
        // d3.selectAll('circle')
        //   .filter(c => c.id === d.id)
        //   .attr('stroke', 'black');
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
        // d3.selectAll('circle').attr('stroke', d => this.colourScale(d.cluster));
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
    console.log(zoomAmount);
    const yTranslateAmount = Math.max(
      -this.nodes.length / this.filteredNodes.length,
      -35
    );
    console.log(yTranslateAmount);
    const newSvgTransform = this._sanitizer.bypassSecurityTrustStyle(
      'scale(' + zoomAmount + ') translate(0,' + yTranslateAmount + 'px)'
    );
    this._statusService.changeSvgTransform(newSvgTransform);

    // fill circles with images if <40 remain
    setTimeout(() => {
      this.filteredNodes.length <= 40
        ? this.circles
            .attr('fill-opacity', 0.2)
            .attr('fill', d => 'url(#pattern_' + d.id + ')')
            // .attr('stroke', d => this.colourScale(d.cluster))
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

  showMobileSlider(filterVar?) {
    this.mobileSliderActive = {
      skillsLang: false,
      skillsLogi: false,
      skillsMath: false,
      skillsComp: false
    };
    if (filterVar) {
      this.mobileSliderActive[filterVar] = true;
    }
  }
}
