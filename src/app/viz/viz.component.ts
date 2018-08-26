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
import CONFIG from '../app.config';

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
import {
  ngIfAnimation,
  easeInOut,
  slideInFromRight,
  slideHorizontal,
  circleWidth,
  circlePop
} from '../animations';

@Component({
  selector: 'app-viz',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'viz.component.html',
  styleUrls: ['viz.component.scss'],
  animations: [ngIfAnimation, easeInOut, slideInFromRight, slideHorizontal]
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
  wdw = window;
  NAVBAR_HEIGHT = CONFIG.DEFAULTS.NAVBAR_HEIGHT;
  height = window.innerHeight - this.NAVBAR_HEIGHT;
  width = window.innerWidth;

  // ----- CANVAS PROPERTIES ----- //
  data$ = [];
  circles;
  minRadius =
    Math.min(
      window.innerWidth,
      window.innerHeight - CONFIG.DEFAULTS.NAVBAR_HEIGHT
    ) * 0.0006; // vmin
  colourScale = d3.scaleOrdinal(CONFIG.SPECTRUM);
  canvasStyles = {
    position: 'absolute',
    top: this.NAVBAR_HEIGHT + 'px',
    left: 0,
    width: window.innerWidth,
    height: window.innerHeight - this.NAVBAR_HEIGHT
  };
  circleImagesActive = false;
  // move the circles into the center
  circlesGroupTransform =
    'translate(' +
    window.innerWidth / 2 +
    'px, ' +
    (window.innerHeight - this.NAVBAR_HEIGHT + 20) / 2 +
    'px)';

  // ----- FILTER SLIDERS ----- //
  filterSliders = [
    {
      variable: 'skillsLang',
      title: 'Language and Communication',
      value: 0
    },
    {
      variable: 'skillsLogi',
      title: 'Logic and Reasoning',
      value: 0
    },
    {
      variable: 'skillsMath',
      title: 'Math and Spatial',
      value: 0
    },
    {
      variable: 'skillsComp',
      title: 'Computer and Information',
      value: 0
    }
  ];

  // ----- CIRCLE PROPERTIES ----- //
  // subscriptions are defined in ngOnInit() through the _statusService
  subscriptions = [
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
    'svgTransform',
    'sliderPositions'
  ];
  radiusSelector = 'none'; // default value because forceGravity defined before subscription
  sliderPositions;
  clusterSelector;
  uniqueClusterValues;
  forceCluster;
  forceSimulation;
  radiusRange;
  radiusScale;
  filteredNodes;
  nodes;
  clusterCenters;
  numClusters;
  svgTransform = 'scale(1)'; // zoom when fewer nodes

  // ----- SIMULATION & FORCES ----- //
  // clusteringAmount = 0.5;
  CIRCLE_RADIUS = CONFIG.DEFAULTS.CIRCLE_RADIUS;
  NODE_PADDING = CONFIG.DEFAULTS.NODE_PADDING;
  NODE_ATTRACTION_CONSTANT = CONFIG.FORCES.NODE_ATTRACTION_CONSTANT; // negative = repel
  CENTER_GRAVITY = CONFIG.FORCES.CENTER_GRAVITY;
  nodeAttraction =
    Math.min(window.innerWidth, window.innerHeight - this.NAVBAR_HEIGHT) *
    this.NODE_ATTRACTION_CONSTANT *
    this.CIRCLE_RADIUS; // negative = repel
  forceXCombine = d3.forceX().strength(this.CENTER_GRAVITY);
  forceYCombine = d3.forceY().strength(this.CENTER_GRAVITY);
  forceGravity;
  // forceCollide = null;
  forceCollide;
  ticked;
  // tooltip
  tooltipData;
  tooltipExpanded = false; // whether the tooltip is expanded
  autoExpand;
  autoFadeout;
  justClosed = false; // whether the tooltip was clicked-closed

  // sliders
  mobileSliderActive = {
    skillsLang: false,
    skillsLogi: false,
    skillsMath: false,
    skillsComp: false
  };
  slidersInUse = false;
  mobileView;

  sufficientMemory = true;

  // // Drag functions used for interactivity
  dragstarted = d => {
    if (!d3.event.active) {
      this.forceSimulation.alphaTarget(0.3).restart();
    }
    d.fx = d.x;
    d.fy = d.y;
  };
  dragged = d => {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  };
  dragended = d => {
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
    this._simulationService.forceCollide(this.radiusSelector);
    this._simulationService.forceGravity(
      this.radiusSelector,
      this.nodeAttraction,
      this.radiusScale
    );
    // mobile view flag
    this.mobileView = window.innerWidth < CONFIG.DEFAULTS.MOBILE_BREAKPOINT;
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    // reposition canvas
    this.canvasStyles.top = this.NAVBAR_HEIGHT + 'px';
    this.canvasStyles.width = event.target.innerWidth;
    this.canvasStyles.height = event.target.innerHeight - this.NAVBAR_HEIGHT;

    // mobile view flag
    this.mobileView = window.innerWidth < CONFIG.DEFAULTS.MOBILE_BREAKPOINT;

    // recalculate forces
    if (this.sufficientMemory) {
      this.recenterForceSimulation(event);
    } else {
      console.log('recentering the packed circles viz');
    }
  }

  private recenterForceSimulation(event: any) {
    this.radiusSelector === 'none'
      ? (this.nodeAttraction =
          Math.min(
            event.target.innerWidth,
            event.target.innerHeight - this.NAVBAR_HEIGHT
          ) *
          this.NODE_ATTRACTION_CONSTANT *
          this.CIRCLE_RADIUS)
      : (this.nodeAttraction =
          Math.min(
            event.target.innerWidth,
            event.target.innerHeight - this.NAVBAR_HEIGHT
          ) * this.NODE_ATTRACTION_CONSTANT);
    // change the collision and gravity forces for the new radii
    this._simulationService.forceCollide(this.radiusSelector);
    this._simulationService.forceGravity(
      this.radiusSelector,
      this.nodeAttraction,
      this.radiusScale
    );
    // start the simulation
    this._statusService.changeForceSimulation(
      this.forceSimulation
        .force('gravity', this.forceGravity)
        .force('collide', this.forceCollide)
        .alpha(0.3)
        .restart()
    );
    this.circlesGroupTransform =
      'translate(' +
      event.target.innerWidth / 2 +
      'px,' +
      (event.target.innerHeight - this.NAVBAR_HEIGHT + 80) / 2 +
      'px)';
  }

  ngAfterContentInit() {
    // todo: check web API indicating device memory and determine cut-off
    this.sufficientMemory = false;

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
              ? Array(2).fill(this.CIRCLE_RADIUS)
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
      this.defineNodes();

      // circle svg image patterns
      this.attachImages();

      if (this.sufficientMemory) {
        // append the circles to svg then style
        // add functions for interaction
        this.initForceSimulation();
      } else {
        this.initStaticChart();
      }
    });
  } // end ngAfterContentinit

  private defineNodes() {
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
  }

  private initForceSimulation() {
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
      .attr('r', circleWidth)
      .attr('fill', d => this.colourScale(d.cluster))
      .call(
        d3
          .drag()
          .on('start', this.dragstarted)
          .on('drag', this.dragged)
          .on('end', this.dragended)
      )
      .on('mouseover', this.handleMouseover())
      .on('mouseout', this.handleMouseout())
      .on('click', this.handleClick());
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
      .velocityDecay(CONFIG.FORCES.VELOCITY_DECAY) // use for faster dev testing
      .force('x', this.forceXCombine)
      .force('y', this.forceYCombine)
      .force('collide', this.forceCollide)
      .force('gravity', this.forceGravity)
      .force('cluster', this.forceCluster)
      .on('tick', () => {
        // this.ref.markForCheck();
        this.circles.attr('cx', d => d.x).attr('cy', d => d.y);
      });
    this._statusService.changeForceSimulation(newForceSimulation);
  }

  private initStaticChart() {
    // const dataset = {
    //   children: [
    //     { Name: 'Olives', Count: 4319 },
    //     { Name: 'Tea', Count: 4159 },
    //     { Name: 'Mashed Potatoes', Count: 2583 },
    //     { Name: 'Boiled Potatoes', Count: 2074 },
    //     { Name: 'Milk', Count: 1894 },
    //     { Name: 'Chicken Salad', Count: 1809 },
    //     { Name: 'Vanilla Ice Cream', Count: 1713 },
    //     { Name: 'Cocoa', Count: 1636 },
    //     { Name: 'Lettuce Salad', Count: 1566 },
    //     { Name: 'Lobster Salad', Count: 1511 },
    //     { Name: 'Chocolate', Count: 1489 },
    //     { Name: 'Apple Pie', Count: 1487 },
    //     { Name: 'Orange Juice', Count: 1423 },
    //     { Name: 'American Cheese', Count: 1372 },
    //     { Name: 'Green Peas', Count: 1341 },
    //     { Name: 'Assorted Cakes', Count: 1331 },
    //     { Name: 'French Fried Potatoes', Count: 1328 },
    //     { Name: 'Potato Salad', Count: 1306 },
    //     { Name: 'Baked Potatoes', Count: 1293 },
    //     { Name: 'Roquefort', Count: 1273 },
    //     { Name: 'Stewed Prunes', Count: 1268 }
    //   ]
    // };

    const [width, height] = [
      document.querySelector('#canvas').getBoundingClientRect().width,
      document.querySelector('#canvas').getBoundingClientRect().height
    ];

    const bubble = d3
      .pack(this.data$)
      .size([width, height])
      .padding(1.5);

    const svg = d3.select('#canvas').attr('class', 'bubble');

    const dataset = { children: this.data$ };

    console.log('data$', this.data$);

    const nodes = d3.hierarchy(dataset).sum(d => {
      if (this.radiusSelector === 'none') {
        return 10;
      } else {
        return d[this.radiusSelector];
      }
    });
    console.log(nodes);

    const node = svg
      .selectAll('.node')
      .data(bubble(nodes).descendants())
      .enter()
      .filter(d => !d.children)
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => 'translate(' + d.x + ',' + d.y + ')');

    node.append('title').text(d => d.job + ': ' + d.workers);

    node
      .append('circle')
      .attr('r', d => d.r)
      .style('fill', d => this.colourScale(d.data.cluster));

    node
      .append('text')
      .attr('dy', '.2em')
      .style('text-anchor', 'middle')
      .text(d => d.data.job.substring(0, d.r / 3))
      .attr('font-family', 'sans-serif')
      .attr('font-size', d => d.r / 5)
      .attr('fill', 'white');

    node
      .append('text')
      .attr('dy', '1.3em')
      .style('text-anchor', 'middle')
      .text(d => d.data.workers)
      .attr('font-family', 'Gill Sans', 'Gill Sans MT')
      .attr('font-size', d => d.r / 5)
      .attr('fill', 'white');

    d3.select(self.frameElement).style('height', height + 'px');
  }

  private attachImages() {
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
  }

  handleMouseover() {
    return d => {
      // initialize the tooltip
      this.initTooltip(d);

      // highlight the circle border
      d3.select('#circle_' + d.id).style('stroke-width', 2);

      // start the clock for auto-expansion after 2 seconds unless clicked-closed
      if (!this.justClosed) {
        this.autoExpand = setTimeout(() => {
          this.tooltipExpanded = true;
        }, 2000);
      }

      // call Angular's change-detection
      this.ref.markForCheck();
    };
  }
  handleMouseout() {
    return d => {
      // clear the autoExpand timeout
      clearTimeout(this.autoExpand);

      // remove the border highlight (unless zoomed in and circle images are showing)
      d3.select('#circle_' + d.id).style(
        'stroke-width',
        this.circleImagesActive ? 1.5 : 0
      );

      // remove the tooltip unless expanded or clicked-closed
      if (!this.tooltipExpanded && !this.justClosed) {
        this.tooltipData = null;
      }
      this.justClosed = false;

      // call Angular's change-detection
      this.ref.markForCheck();
    };
  }
  handleClick() {
    return d => {
      // todo: how to identify current tooltip ? these both identify mouse target
      // todo: let previousTooltipData somewhere
      //   console.log('case 1');
      this.tooltipExpanded = !this.tooltipExpanded;
      //
      if (!this.tooltipExpanded) {
        this.justClosed = true;
        // this.tooltipData = null;
      }
      // if clicking on another circle,
      // } else if (d3.event.target.id !== this.tooltipData.d.id) {
      //   console.log('case 2');
      //   // (tooltip should be expanded in this case)
      //   console.log('tooltipExpanded', this.tooltipExpanded);
      //   this.tooltipExpanded = false;
      //   this.initTooltip(d);
      //   // this.tooltipExpanded = true;
      // } else {
      //   console.log('case 3');
      //   this.handleSvgClick(d3.event);
      //   // this.tooltipData = null;
      //   // this.tooltipExpanded = false;
      //   setTimeout(this.initTooltip(d), 301);
      //   // this.tooltipExpanded = true;
      // }
      // expand the tooltip, or close if expanded
      // this.tooltipExpanded = !this.tooltipExpanded;

      // if tooltip was clicked-closed, prevent re-opening
    };
  }

  private initTooltip(d: any) {
    this.tooltipData = {
      d: d,
      x: d.x + this.width / 2,
      y: d.y + this.height / 2
    };
  }

  // close tooltip on background click
  handleSvgClick($event) {
    if ($event.target.nodeName === 'svg' && this.tooltipExpanded) {
      this.tooltipExpanded = false;
      d3.select('app-tooltip')
        .transition()
        .duration(300)
        .style('opacity', 0);
    }
  }

  // While moving the slider, filter the circles

  // After mouseup from the slider, restart the simulation and zoom in/out

  handleSliderDrag(event, filterVariable) {
    this._filterService.filterViz(event.value, filterVariable, this.nodes);
    // UPDATE the viz data
    this.circles = this.circles.data(this.filteredNodes, d => d.id);
    // EXIT
    this.circles
      .exit()
      .transition()
      .duration(500)
      // exit "pop" transition: enlarge radius & fade out
      .attr('r', circlePop)
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
      .attr('r', circleWidth)
      .attr('fill', d => this.colourScale(d.cluster))
      // .attr('stroke', d => this.colourScale(d.cluster))
      // add tooltips to each circle
      .on('mouseover', this.handleMouseover)
      .on('mouseout', this.handleMouseout)
      .on('click', this.handleClick)
      .merge(this.circles);
  }

  // Filter slider function: $event = skill level, filterVariable = skill name
  handleSliderMouseUp(event, filterVariable) {
    // Save the slider position
    this.filterSliders
      .filter(slider => slider.variable === filterVariable)
      .map(slider => (slider.value = event.value));

    // Update all sliders based on new minimums
    this._statusService.changeSliderPositions(
      this.filterSliders.map(slider => {
        return {
          variable: slider.variable,
          value: this.filteredNodes.reduce((min, node) => {
            return Math.min(min, node[slider.variable]);
          }, 999999)
        };
      })
    );

    // ZOOM to fit remaining of circles
    // todo: if size-changed circles don't fit, calculate zoom based on total circle area
    const zoomAmount = Math.pow(
      this.nodes.length / this.filteredNodes.length,
      0.45 // less than sqrt (0.5) to reduce overflow
    );
    const circlesGroupYTranslate = Math.max(
      -this.nodes.length / this.filteredNodes.length - 1,
      -10
    );

    const newSvgTransform = this._sanitizer.bypassSecurityTrustStyle(
      'scale(' + zoomAmount + ') translate(0,' + circlesGroupYTranslate + 'px)'
    );

    this._statusService.changeSvgTransform(newSvgTransform);

    // fill circles with images if <50 remain
    setTimeout(() => {
      this.filteredNodes.length <= 50
        ? (this.circleImagesActive = true)
        : (this.circleImagesActive = false);

      this.circleImagesActive
        ? this.circles
            .attr('fill-opacity', 0.2)
            .attr('fill', d => 'url(#pattern_' + d.id + ')')
            .style('stroke', d => this.colourScale(d.cluster))
            .style('stroke-width', 5 / zoomAmount)
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
        : this.circles
            .attr('fill', d => this.colourScale(d.cluster))
            .style('stroke', 'black')
            .style('stroke-width', 0)
            .call(
              d3
                .drag()
                .on('start', this.dragstarted)
                .on('drag', this.dragged)
                .on('end', this.dragended)
            );
    }, 1000);

    // Update nodes and restart the simulation
    this._statusService.changeForceSimulation(
      this.forceSimulation
        .nodes(this.filteredNodes)
        .alpha(0.3)
        .restart()
    );

    // check if sliders are resettable
    this.slidersInUse = this.filterSliders.filter(slider => slider.value > 0)
      ? true
      : false;
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

  resetFilters() {
    this.filterSliders.map(slider => {
      slider.value = 0;
      this._filterService.filterViz(0, slider.variable, this.nodes);
    });
    this.handleSliderDrag(
      { value: 0, variable: this.filterSliders[0].variable },
      this.filterSliders[0].variable
    );
    this.handleSliderMouseUp(
      { value: 0, variable: this.filterSliders[0].variable },
      this.filterSliders[0].variable
    );

    this.slidersInUse = false;
  }
}
