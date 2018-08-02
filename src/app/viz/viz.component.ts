import { Component, OnInit, AfterContentInit, HostListener } from '@angular/core';
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
    private _statusService: AppStatusService
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
  public minRadius = window.innerWidth * 0.03;
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
    'px,' +
    (window.innerHeight - this.navbarHeight) / 2 +
    'px)';

  // ----- FILTER SLIDERS ----- //
  public filterSliders = [
    {
      variable: 'language',
      title_1: 'Language and',
      title_2: 'Communication'
    },
    { variable: 'logic', title_1: 'Logic and', title_2: 'Reasoning' },
    { variable: 'math', title_1: 'Math and', title_2: 'Spatial' },
    {
      variable: 'computer',
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
  public clusteringAmount = 0.5;
  public defaultCircleRadius = 1.0;
  public nodeAttractionConstant = -0.28; // negative = repel
  public nodeAttraction =
    window.innerWidth * this.nodeAttractionConstant * this.defaultCircleRadius; // negative = repel
  public centerGravity = 1.75;
  public forceXCombine = d3.forceX().strength(this.centerGravity);
  public forceYCombine = d3.forceY().strength(this.centerGravity);
  public forceGravity = d3
    .forceManyBody()
    .strength(
      this.radiusSelector === 'none'
        ? this.nodeAttraction
        : d => Math.pow(d.r, 2) * this.nodeAttraction + 3
    );
  public forceCollide = null;
  public nodePadding = 1;
  // public forceCollide = d3.forceCollide().radius(d => (6*d.r) + this.nodePadding);
  public ticked;
  // tooltip
  public tooltipData;
  public tooltipExpanded = false; // whether the tooltip is expanded
  public autoExpand;
  public justClosed = false; // whether the tooltip was clicked-closed

  // filter slider positions
  public sliderPositions = { language: 0, logic: 0, math: 0, computer: 0 };

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
    this.subscriptions.forEach(s => {
      const titleCase = s.charAt(0).toUpperCase() + s.slice(1);
      this._statusService['current' + titleCase].subscribe(v => (this[s] = v));
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    // reposition canvas
    this.canvasStyles.top = this.navbarHeight + 'px';
    this.canvasStyles.width = window.innerWidth;
    this.canvasStyles.height = window.innerHeight - this.navbarHeight;

    // recalculate forces
    this.nodeAttraction =
      event.target.innerWidth *
      this.nodeAttractionConstant *
      this.defaultCircleRadius;

    this.forceGravity = d3
      .forceManyBody()
      .strength(
        this.radiusSelector === 'none'
          ? this.nodeAttraction
          : d => Math.pow(d.r, 2) * this.nodeAttraction + 3
      );

    this._statusService.changeForceSimulation(
      this.forceSimulation
        .force('gravity', this.forceGravity)
        .alpha(0.3)
        .restart()
    );

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
      this._statusService.changeNodes(
        this.data$.map(d => {
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
            computer: d.skillsComp,
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

      // todo: fill circles with images when <30 circles remain
      d3.select('#canvas').append('defs')
        .selectAll('.img-pattern')
        .data(this.nodes)
        .enter().append('pattern')
        .attr('class', 'img-pattern')
        .attr('id', d => 'pattern_' + d.id )
        .attr('height', '100%')
        .attr('width', '100%')
        .attr('patternContentUnits', 'objectBoundingBox')
        .append('image')
        .attr('height', 1)
        .attr('width', 1)
        .attr('preserveAspectRatio', 'none')
        .attr('xlink:href', d => '../../assets/img/NOC_images/' + d.all.noc + '.jpg');

      // append the circles to svg then style
      // add functions for interaction
      // this._statusService.changeCircles(
      this.circles = d3
        .select('.circlesG')
        .selectAll('circle')
        .data(this.nodes)
        .enter()
        .append('svg:circle')
        .style('opacity', 0)
        .attr('id', d => 'circle_' + d.id)
        .attr('r', d => d.r + 'vw')
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
            .attr('stroke', 'black')
            .style('stroke-width', '2px');
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

      this._statusService.changeForceCluster(
        // These are implementations of the custom forces.
        alpha => {
          that.nodes.forEach(d => {
            // if(d.id==1){console.log(d);}
            const clusterCenter = that.clusterCenters[d.cluster];
            if (clusterCenter === d) {
              return;
            }
            let x = d.x - clusterCenter.x,
              y = d.y - clusterCenter.y,
              l = this.clusteringAmount * Math.sqrt(x * x + y * y);
            const r = d.r + clusterCenter.r;
            if (l !== r) {
              l = ((l - r) / l) * alpha;
              d.x -= x *= l;
              d.y -= y *= l;
              clusterCenter.x += x;
              clusterCenter.y += y;
            }
          });
        }
      );

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

  // Filter slider function: $event = skill level, filterVariable = skill name
  handleSliderUpdate($event, filterVariable) {
    const that = this;
    this.sliderPositions[filterVariable] = $event;
    // update the viz with the slider value, $event
    // update the nodes from the data
    this._statusService.changeFilteredNodes(
      this.nodes.filter(d => {
        for (const key in this.sliderPositions) {
          // filter out any nodes below the slider thresholds
          if (d[key] < this.sliderPositions[key]) {
            return false;
          }
        }
        return true;
      })
    );
    // UPDATE the viz data
    this.circles = this.circles.data(this.filteredNodes, d => d.id);
    // EXIT
    this.circles
      .exit()
      .transition()
      .duration(500)
      // exit "pop" transition: enlarge radius & fade out
      // todo: edit pop size based on d.r
      .attr('r', d => d.r * 1.75 + 'vw')
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
      .attr('r', d => d.r + 'vw')
      .attr('fill', d => that.colourScale(d.cluster))
      // add tooltips to each circle
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
      })
      .merge(this.circles);

    // ZOOM to fit remaining of circles
    // todo: calculate zoom based on total circle area if size-changed doesn't fit
    const zoomAmount = Math.pow(
      this.nodes.length / this.filteredNodes.length,
      0.45
    );
    this._statusService.changeSvgTransform('scale(' + zoomAmount + ')');

    // fill circles with images if <30 remain
    setTimeout(() => {
    this.filteredNodes.length <= 30
      ? d3.selectAll('circle')
          .attr('fill', d => 'url(#pattern_' + d.id + ')')
          .attr('stroke', d => this.colourScale(d.cluster))
      : d3.selectAll('circle')
          .attr('fill', d => this.colourScale(d.cluster))
          .attr('stroke', 'none');
    }, 1000);

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
        .nodes(this.filteredNodes)
        .alpha(0.3)
        .restart()
    );
  }
}
