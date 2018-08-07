import { Component } from '@angular/core';
import APP_CONFIG from './app.config';
import { Node, Link } from './d3';
import { DataService } from './data.service';
import { AppStatusService } from './app-status.service';
import * as d3 from 'd3';
@Component({
  selector: 'app-root',
  template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
    <app-graph [nodes]="nodes" [links]="links"></app-graph>

    `,
    styles: []
  })
  export class AppComponent {
    // <app-viz></app-viz>

  subscriptions = [
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
  nodes: Node[] = [];
  links: Link[] = [];
  data$;
  radiusSelector = 'none'; // default value because forceGravity defined before subscription
  clusterSelector;
  uniqueClusterValues;
  forceCluster;
  forceSimulation;
  radiusRange;
  radiusScale;
  filteredNodes;
  clusterCenters;
  numClusters;
  svgTransform = 'scale(1)'; // zoom when fewer nodes
  navbarHeight = 64;
  // ----- SIMULATION & FORCES ----- //
  // public clusteringAmount = 0.5;
  public defaultCircleRadius = 1.0;
  public nodeAttractionConstant = -0.28; // negative = repel
  public nodeAttraction =
    Math.min(window.innerWidth, (window.innerHeight - this.navbarHeight))
    * this.nodeAttractionConstant * this.defaultCircleRadius; // negative = repel
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

  constructor(
    private _dataService: DataService,
    private _statusService: AppStatusService
  ) {
    // pull in the subscriptions
    // const that = this;
    // this.subscriptions.forEach(s => {
    //   const titleCase = s.charAt(0).toUpperCase() + s.slice(1);
    //   this._statusService['current' + titleCase].subscribe(v => (this[s] = v));
    // });

    const N = APP_CONFIG.N,
      getIndex = number => number - 1;

    /** constructing the nodes array */
    for (let i = 1; i <= N; i++) {
      this.nodes.push(new Node(i));
    }

    for (let i = 1; i <= N; i++) {
      for (let m = 2; i * m <= N; m++) {
        /** increasing connections toll on connecting nodes */
        this.nodes[getIndex(i)].linkCount++;
        this.nodes[getIndex(i * m)].linkCount++;

        /** connecting the nodes before starting the simulation */
        this.links.push(new Link(i, i * m));
      }
    }
    // this._dataService.getData().subscribe(receivedData => {
    //   this.data$ = receivedData;

    //   // set the radius scale based on the min, max values in the data
    //   this._statusService.changeRadiusScale(
    //     d3
    //       .scaleSqrt() // sqrt because circle areas
    //       .domain(
    //         this.radiusSelector === 'none'
    //           ? [1, 1]
    //           : d3.extent(this.data$, d => +d[that.radiusSelector])
    //       )
    //       .range(
    //         this.radiusSelector === 'none'
    //           ? Array(2).fill(this.defaultCircleRadius)
    //           : this.radiusRange
    //       )
    //   );

    //   // convert each unique value to a cluster number
    //   this._statusService.changeUniqueClusterValues(
    //     this.data$
    //       .map(d => d[that.clusterSelector])
    //       // filter uniqueOnly
    //       .filter((value, index, self) => self.indexOf(value) === index)
    //   );

    //   // define the nodes
    //   this._statusService.changeNodes(
    //     this.data$.map(d => {
    //       // scale radius to fit on the screen
    //       const scaledRadius = this.radiusScale(+d[this.radiusSelector]);

    //       // SELECT THE CLUSTER VARIABLE 2/2
    //       const forcedCluster =
    //         this.uniqueClusterValues.indexOf(d[that.clusterSelector]) + 1;

    //       // define the nodes
    //       d = {
    //         id: d.id,
    //         // circle attributes
    //         r: scaledRadius,
    //         cluster: forcedCluster,
    //         clusterValue: d[that.clusterSelector],
    //         // skills
    //         skillsMath: d.skillsMath,
    //         skillsLogi: d.skillsLogi,
    //         skillsLang: d.skillsLang,
    //         skillsComp: d.skillsComp,
    //         // tooltip info
    //         all: d
    //       };
    //       // add to clusters array if it doesn't exist or the radius is larger than another radius in the cluster
    //       if (
    //         !this.clusterCenters[forcedCluster] ||
    //         scaledRadius > this.clusterCenters[forcedCluster].r
    //       ) {
    //         this.clusterCenters[forcedCluster] = d;
    //         this._statusService.changeClusterCenters(this.clusterCenters);
    //       }
    //       return d;
    //     })
    //   );

    //   // circle svg image patterns
    //   d3.select('#canvas')
    //     .append('defs')
    //     .selectAll('.img-pattern')
    //     .data(this.nodes)
    //     .enter()
    //     .append('pattern')
    //     .attr('class', 'img-pattern')
    //     .attr('id', d => 'pattern_' + d.id)
    //     .attr('height', '100%')
    //     .attr('width', '100%')
    //     .attr('patternContentUnits', 'objectBoundingBox')
    //     .append('image')
    //     .attr('height', 1)
    //     .attr('width', 1)
    //     .attr('preserveAspectRatio', 'none')
    //     .attr(
    //       'xlink:href',
    //       d =>
    //         window.location.href.includes('localhost')
    //           ? '../../assets/img/NOC_thumbnails/tn_' + d.all.noc + '.jpg'
    //           : '../../pave-angular/assets/img/NOC_thumbnails/tn_' +
    //             d.all.noc +
    //             '.jpg'
    //     );

    // });
  }
}
