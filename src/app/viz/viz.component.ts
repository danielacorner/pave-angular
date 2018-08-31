import {
  Component,
  OnInit,
  AfterContentInit,
  HostListener,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild
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
import { getWidth, getHeight } from './utils';
import { StaticChartComponent } from './static-chart/static-chart.component';
import { ForceSimulationComponent } from './force-simulation/force-simulation.component';

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

  @ViewChild(StaticChartComponent)
  private staticChartComponent: StaticChartComponent;

  @ViewChild(ForceSimulationComponent)
  private forceSimulationComponent: ForceSimulationComponent;

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
  // staticNodes;
  // bubble;
  // bubbleSvg;

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
    'sliderPositions',
    'circlesGroupTransform'
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
  zoomAmount;
  circlesGroupTransform;

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

  forceSimulationActive = true;

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

    // init either force simulation or static chart based on device memory
    // todo: check web API indicating device memory and determine cut-off
    this.forceSimulationActive = JSON.parse(
      localStorage.getItem('forceSimulationActive')
    ); // default to true
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
    if (this.forceSimulationActive) {
      this.forceSimulationComponent.recenterForceSimulation(event);
    } else {
      this.staticChartComponent.recenterStaticChart();
    }
  }
  toggleForceSimulationActive() {
    this.forceSimulationActive = !this.forceSimulationActive;
    localStorage.setItem(
      'forceSimulationActive',
      JSON.stringify(this.forceSimulationActive)
    );
    location.reload();
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

      if (this.forceSimulationActive) {
        // append the circles to svg then style
        // add functions for interaction
        this.forceSimulationComponent.initForceSimulation();
      } else {
        this.staticChartComponent.initStaticChart();
      }
    });
  } // end ngAfterContentinit

  // include any data to be displayed
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

  addMouseInteractions(node) {
    node
      .on('mouseover', this.handleMouseover())
      .on('mouseout', this.handleMouseout())
      .on('click', this.handleClick());
  }

  attachImages() {
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
      this.initTooltip(d);

      // highlight the circle border
      d3.select(`#circle_${d.id || d.data.id}`).style('stroke-width', 2);
      // : d3.select(`#circle_${d.data.id}`).style('stroke-width', 2);

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
      d3.select(`#circle_${d.id || d.data.id}`).style(
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
      this.tooltipExpanded = !this.tooltipExpanded;
      //
      if (!this.tooltipExpanded) {
        this.justClosed = true;
      }
    };
  }

  private initTooltip(d: any) {
    const circleBox = document
      .querySelector(`#circle_${d.id || d.data.id}`)
      .getBoundingClientRect();

    const { left, top } = circleBox;

    this.tooltipData = {
      // for the force simulation
      d: this.forceSimulationActive ? d : d.data,
      x: left < window.innerWidth / 2 ? left + 20 : left - 360,
      y: top + 120
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
    if (!this.forceSimulationActive) {
      this.staticChartComponent.filterStaticChart();
    } else {
      this.forceSimulationComponent.filterForceSimulation();
    }
  }

  // Filter slider function: $event = skill level, filterVariable = skill name
  handleSliderMouseUp(event, filterVariable) {
    // Save this slider's position
    this.filterSliders
      .filter(slider => slider.variable === filterVariable)
      .map(slider => (slider.value = event.value));

    // Update all other sliders based on new minimums
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

    if (!this.forceSimulationActive) {
      this.staticChartComponent.rerenderStaticChart();
    } else {
      this.forceSimulationComponent.rerenderForceSimulation();
    }

    // check if sliders are resettable (show/hide reset button)
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
