import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef
} from '@angular/core';
import * as d3 from 'd3';
import CONFIG from '../../app.config';
import { getWidth, getHeight } from '../utils';
import { AppStatusService } from '../../services/app-status.service';
import { DataService } from '../../services/data.service';
import { AppFilterService } from '../../services/app-filter.service';
import { AppSimulationService } from '../../services/app-simulation.service';
import { DomSanitizer } from '@angular/platform-browser';
import { circleWidth, circlePop } from '../../animations';

@Component({
  selector: 'app-force-simulation',
  template: `
  `,
  styles: []
})
export class ForceSimulationComponent implements OnInit {
  NAVBAR_HEIGHT = CONFIG.DEFAULTS.NAVBAR_HEIGHT;

  simNodes;

  simCircles;

  @Input()
  colourScale;

  @Output()
  forceSimInit = new EventEmitter();

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

  // move the circles into the center
  circlesGroupTransform =
    'translate(' +
    window.innerWidth / 2 +
    'px, ' +
    (window.innerHeight - this.NAVBAR_HEIGHT + 20) / 2 +
    'px)';

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
    'circleImagesActive'
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

  circleImagesActive;

  // Drag functions used for interactivity
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

  constructor(
    private _dataService: DataService,
    private _statusService: AppStatusService,
    private _filterService: AppFilterService,
    private _simulationService: AppSimulationService,
    private _sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    // pull in the subscriptions
    this.subscriptions.forEach(s => {
      const titleCase = s.charAt(0).toUpperCase() + s.slice(1);
      this._statusService['current' + titleCase].subscribe(v => (this[s] = v));
    });
  }

  initForceSimulation() {
    this.simCircles = d3
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
      .attr('fill', d => this.colourScale(d.cluster));

    this.forceSimInit.emit(this.simCircles);
    // this.applyDragBehaviour(this.simCircles);
    // this.addMouseInteractions(this.simCircles);

    setTimeout(() => {
      this.simCircles
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
        this.simCircles.attr('cx', d => d.x).attr('cy', d => d.y);
      });
    this._statusService.changeForceSimulation(newForceSimulation);
  }

  recenterForceSimulation(event: any) {
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

  filterForceSimulation() {
    // UPDATE the viz data
    this.simCircles = this.simCircles.data(this.filteredNodes, d => d.id);
    // EXIT
    circlePop(this.simCircles);
    // ENTER and MERGE
    this.simCircles = this.simCircles
      .data(this.filteredNodes)
      .enter()
      .append('svg:circle')
      .attr('r', circleWidth)
      .attr('fill', d => this.colourScale(d.cluster))
      .merge(this.simCircles);
    // this.addMouseInteractions(this.simCircles);
  }
  rerenderForceSimulation() {
    // ZOOM to fit remaining of circles
    // todo: if size-changed circles don't fit, calculate zoom based on total circle area
    this.zoomAmount = Math.pow(
      this.nodes.length / this.filteredNodes.length,
      0.45 // less than sqrt (0.5) to reduce overflow
    );
    const circlesGroupYTranslate = Math.max(
      -this.nodes.length / this.filteredNodes.length - 1,
      -10
    );

    const newSvgTransform = this._sanitizer.bypassSecurityTrustStyle(
      'scale(' +
        this.zoomAmount +
        ') translate(0,' +
        circlesGroupYTranslate +
        'px)'
    );

    this._statusService.changeSvgTransform(newSvgTransform);

    // fill circles with images if <50 remain
    setTimeout(() => {
      this.filteredNodes.length <= 50
        ? (this.circleImagesActive = true)
        : (this.circleImagesActive = false);

      this.circleImagesActive
        ? this.simCircles
            .attr('fill-opacity', 0.2)
            .attr('fill', d => 'url(#pattern_' + d.id + ')')
            .style('stroke', d => this.colourScale(d.cluster))
            .style('stroke-width', 5 / this.zoomAmount)
            .transition()
            .duration(1000)
            .attr('fill-opacity', 1)
        : this.simCircles
            .attr('fill', d => this.colourScale(d.cluster))
            .style('stroke', 'black')
            .style('stroke-width', 0);

      this.applyDragBehaviour(this.simCircles);
    }, 1000);

    // Update nodes and restart the simulation
    this._statusService.changeForceSimulation(
      this.forceSimulation
        .nodes(this.filteredNodes)
        .alpha(0.3)
        .restart()
    );
  }
  private applyDragBehaviour(node) {
    node.call(
      d3
        .drag()
        .on('start', this.dragstarted)
        .on('drag', this.dragged)
        .on('end', this.dragended)
    );
  }
}
