import { Component, OnInit, AfterContentInit } from '@angular/core';
import * as d3 from 'd3';
import { DataService } from '../data.service';

@Component({
  selector: 'app-viz',
  template: `
  <div>
    <svg [ngStyle]="canvasStyles">
      <g class="circlesG" *ngIf="data$" [style.transform]="gTransform">
        <!-- <circle *ngFor="let node of nodes"
         [style.r]="node.r"
         [style.fill]="colorScale(node.cluster)"
        /> -->
      </g>
    </svg>
    <div class='container'>
      <app-colour-legend-button [forceSimulation]="vizSimulation"></app-colour-legend-button>
    </div>
  </div>
  `,
  styles: [`
    div.tooltip {
      position: absolute;
      text-align: center;
      width: 150px;
      /*height: 28px;         */
      padding: 2px;
      font: 12px sans - serif;
      background: lightgrey;
      border: 0px;
      border-radius: 8px;
      pointer-events: none;
    }
  `]
})
export class VizComponent implements OnInit, AfterContentInit {
  constructor(private _dataService: DataService) {}

  public navbarHeight = 64;
  public height = window.innerHeight - this.navbarHeight;
  public width = window.innerWidth;
  // data viz properties
  public padding = 1.5; // separation between same-color circles
  public clusterPadding = 6; // separation between different-color circles
  public maxRadius = this.height * 0.1;
  public m = 10; // number of distinct clusters
  public colorScale = d3.scaleOrdinal(d3.schemeCategory10);
  public clusters = new Array(this.m);
  // the graphing canvas
  public canvasStyles = {
            position: 'absolute',
            top: this.navbarHeight + 'px',
            width: this.width,
            height: this.height,
          };
  // move the circles into the center
  public gTransform = 'translate(' + this.width / 2 + 'px,' + this.height / 2 + 'px)';
  public data$ = [];
  public nodes = [];
  public vizSimulation;
  ngOnInit() {
  }
  ngAfterContentInit() {
    this._dataService.getData().subscribe(receivedData => {
      // load data
      this.data$ = receivedData;

      // Define the div for the tooltip
      // todo: extract tooltip component
      const div = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

      // SELECT THE RADIUS VARIABLE
      const radiusSelector = 'Total';

      const radiusScale = d3.scaleLinear() // should be scaleSqrt because circle areas?
        .domain(d3.extent(this.data$, function (d) { return +d[radiusSelector]; }))
        .range([4, this.maxRadius]);

      // SELECT THE CLUSTER VARIABLE 1/2
      // convert each unique value to a cluster number
      const clusterSelector = 'Major_category_code';
      const uniqueClusterValues = this.data$.map(d => d[clusterSelector]);

      // defining the nodes
      this.nodes = this.data$.map((d) => {
        // scale radius to fit on the screen
        const scaledRadius = radiusScale(+d[radiusSelector]),
          // SELECT THE CLUSTER VARIABLE 2/2
          // cluster = the item's index in uniqueClusterValues
          forcedCluster = uniqueClusterValues.indexOf(d[clusterSelector]) + 1;

        // add cluster id and radius to array
        d = {
          cluster: forcedCluster,
          r: scaledRadius,
          major: d.Major,
          major_cat: d.Major_category
        };
        // add to clusters array if it doesn't exist or the radius is larger than another radius in the cluster
        if (!this.clusters[forcedCluster] || (scaledRadius > this.clusters[forcedCluster].r)) { this.clusters[forcedCluster] = d; }

        return d;
      });

      // VIZ NODES
      console.log('Viz nodes: ' + this.nodes);

      // resolve function scope by saving outer scope
      const that = this;

      // append the circles to svg then style
      // add functions for interaction
      const circles = d3.select('.circlesG')
        .selectAll('.circle')
        .data(that.nodes)
        .enter().append('circle')
        .attr('r', (d) => d.r)
        .attr('fill', (d) => this.colorScale(d.cluster))
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended))
        // add tooltips to each circle
        .on('mouseover', function (d) {
          div.transition()
            .duration(200)
            .style('opacity', .9);
          div.html('The major ' + d.major + '<br/>In the category ' + d.major_cat)
            .style('left', (d3.event.pageX) + 'px')
            .style('top', (d3.event.pageY - 28) + 'px');
        })
        .on('mouseout', function (d) {
          div.transition()
            .duration(500)
            .style('opacity', 0);
        });

      // create the clustering/collision force simulation
      const simulation = d3.forceSimulation(this.nodes)
        .velocityDecay(0.2)
        .force('x', d3.forceX().strength(.0005))
        .force('y', d3.forceY().strength(.0005))
        .force('collide', collide)
        .force('cluster', clustering)
        .on('tick', ticked);

      // pass the simulation to child components
      this.vizSimulation = simulation;

      function ticked() {
        circles
          .attr('cx', (d) => d.x)
          .attr('cy', (d) => d.y);
      }

      // Drag functions used for interactivity
      function dragstarted(d) {
        if (!d3.event.active) { simulation.alphaTarget(0.3).restart(); }
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }

      function dragended(d) {
        if (!d3.event.active) { simulation.alphaTarget(0); }
        d.fx = null;
        d.fy = null;
      }

      // These are implementations of the custom forces.
      function clustering(alpha) {
        that.nodes.forEach(function (d) {
          const cluster = that.clusters[d.cluster];
          if (cluster === d) { return; }
          let x = d.x - cluster.x,
            y = d.y - cluster.y,
            l = Math.sqrt(x * x + y * y);
          const r = d.r + cluster.r;
          if (l !== r) {
            l = (l - r) / l * alpha;
            d.x -= x *= l;
            d.y -= y *= l;
            cluster.x += x;
            cluster.y += y;
          }
        });
      }

      function collide(alpha) {
        const quadtree = d3.quadtree()
          .x((d) => d.x)
          .y((d) => d.y)
          .addAll(that.nodes);

        that.nodes.forEach(function (d) {
          let r = d.r + that.maxRadius + Math.max(that.padding, that.clusterPadding);
          const nx1 = d.x - r,
                nx2 = d.x + r,
                ny1 = d.y - r,
                ny2 = d.y + r;
          quadtree.visit(function (quad, x1, y1, x2, y2) {

            if (quad.data && (quad.data !== d)) {
              let x = d.x - quad.data.x,
                y = d.y - quad.data.y,
                l = Math.sqrt(x * x + y * y);
                r = d.r + quad.data.r + (d.cluster === quad.data.cluster ? that.padding : that.clusterPadding);
              if (l < r) {
                l = (l - r) / l * alpha;
                d.x -= x *= l;
                d.y -= y *= l;
                quad.data.x += x;
                quad.data.y += y;
              }
            }
            return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
          });
        });
      }


    });

  }
}
