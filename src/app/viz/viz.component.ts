import { Component, OnInit, AfterContentInit, Input } from '@angular/core';
import * as d3 from 'd3';
import { DataService } from '../data.service';

@Component({
  selector: 'app-viz',
  template: `
  <div>
    <svg [ngStyle]="canvasStyles">
      <g class="circlesG" *ngIf="data$" [style.transform]="gTransform">
      </g>
    </svg>
    <div class='container'>

      <app-filter-slider class="sliderLang"
      (childEvent)="handleSliderUpdate($event, 'language')"
      ></app-filter-slider>

      <app-colour-legend-button
      [forceSimulation]="simulation"
      [forceXCombine]="forceXCombine"
      [forceYCombine]="forceYCombine"
      [nClusters]="numClusters"
      [vizWidth]="width"
      [vizHeight]="height"
      [navbarHeight]="navbarHeight"
      ></app-colour-legend-button>

      <app-size-legend-button
      [forceSimulation]="simulation"
      [forceXCombine]="forceXCombine"
      [nClusters]="numClusters"
      [vizWidth]="width"
      [vizHeight]="height"
      [navbarHeight]="navbarHeight"
      [radiusRange]="radiusRange"
      ></app-size-legend-button>

    </div>
  </div>
  `,
  styles: [
    `
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
    `
  ]
})
export class VizComponent implements OnInit, AfterContentInit {
  constructor(private _dataService: DataService) {}

  public navbarHeight = 64;
  public height = window.innerHeight - this.navbarHeight;
  public width = window.innerWidth;
  // data viz properties
  public padding = 1.5; // separation between same-color circles
  public clusterPadding = 6; // separation between different-color circles
  public minRadius = 4;
  public maxRadius = this.width * 0.03;
  public radiusRange = [this.minRadius, this.maxRadius];
  public radiusScale;

  public radiusSelector = 'workers';
  public clusterSelector = 'industry';
  public uniqueClusterValues;

  public circles;
  public numClusters = 10; // number of distinct clusters
  public colorScale = d3.scaleOrdinal(d3.schemeCategory10);
  public clusters = new Array(this.numClusters);
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
  public data$ = [];
  public nodes = [];

  public simulation;
  public forceXCombine = d3.forceX().strength(0.4);
  public forceYCombine = d3.forceY().strength(0.4);
  public forceGravity = d3.forceManyBody().strength(this.height * -0.08);
  public forceCollide = d3.forceCollide(this.height * 0.009);
  public clustering;
  public collide;
  public dragstarted;
  public dragged;
  public dragended;
  public ticked;

  // min and max skill values
  public skills = {
    language: {
      min: d3.min(this.data$.map(d => d.skillsLang)),
      max: d3.max(this.data$.map(d => d.skillsLang))
    },
    logic: {
      min: 10,
      max: 30
    },
    math: {
      min: 10,
      max: 30
    },
    computer: {
      min: 10,
      max: 30
    }
  };
  // the current slider values
  public sliderLangValue;
  ngOnInit() {}
  ngAfterContentInit() {
    // resolve d3 function scope by saving outer scope
    const that = this;

    this._dataService.getData().subscribe(receivedData => {
      // load data
      this.data$ = receivedData;

      // Define the div for the tooltip
      // todo: extract tooltip component
      const div = d3
        .select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

      // SELECT THE RADIUS VARIABLE
      this.radiusSelector = 'workers';

      this.radiusScale = d3
        .scaleSqrt() // should be scaleSqrt because circle areas?
        .domain(
          d3.extent(this.data$, function(d) {
            return +d[that.radiusSelector];
          })
        )
        .range([this.minRadius, this.maxRadius]);

      // SELECT THE CLUSTER VARIABLE 1/2
      // convert each unique value to a cluster number
      const clusterSelector = 'industry';
      this.uniqueClusterValues = this.data$.map(d => d[clusterSelector]);

      // defining the nodes
      this.nodes = this.data$.map(d => {
        // scale radius to fit on the screen
        const scaledRadius = this.radiusScale(+d[this.radiusSelector]),
          // SELECT THE CLUSTER VARIABLE 2/2
          // cluster = the item's index in uniqueClusterValues
          forcedCluster =
            this.uniqueClusterValues.indexOf(d[clusterSelector]) + 1;

        // add cluster id and radius to array
        d = {
          cluster: forcedCluster,
          r: scaledRadius,
          // TOOLTIP DATA TO DISPLAY
          id: d.id,
          language: d.skillsLang,
          logic: d.skillsLogi,
          math: d.skillsMath,
          computer: d.skillsComputer
          // total: d.Total,
        };
        // add to clusters array if it doesn't exist or the radius is larger than another radius in the cluster
        if (
          !this.clusters[forcedCluster] ||
          scaledRadius > this.clusters[forcedCluster].r
        ) {
          this.clusters[forcedCluster] = d;
        }

        return d;
      });

      // VIZ NODES
      // console.log('Viz nodes:');
      // console.log(this.nodes);

      // append the circles to svg then style
      // add functions for interaction
      this.circles = d3
        .select('.circlesG')
        .selectAll('.circle')
        .data(that.nodes)
        .enter()
        .append('circle')
        .attr('r', d => d.r)
        .attr('fill', d => this.colorScale(d.cluster))
        .call(
          d3
            .drag()
            .on('start', that.dragstarted)
            .on('drag', that.dragged)
            .on('end', that.dragended)
        )
        // add tooltips to each circle
        .on('mouseover', function(d) {
          div
            .transition()
            .duration(200)
            .style('opacity', 0.9);
          div
            .html(
              'The major ' +
                d.major +
                '<br/>In the category ' +
                d.major_cat +
                '<br/>Total: ' +
                d.total +
                '; Radius:' +
                d.r
            )
            .style('left', d3.event.pageX + 'px')
            .style('top', d3.event.pageY - 28 + 'px');
        })
        .on('mouseout', function(d) {
          div
            .transition()
            .duration(500)
            .style('opacity', 0);
        });

      this.ticked = function() {
        that.circles.attr('cx', d => d.x).attr('cy', d => d.y);
      };

      // Drag functions used for interactivity
      this.dragstarted = function(d) {
        if (!d3.event.active) {
          this.simulation.alphaTarget(0.3).restart();
        }
        d.fx = d.x;
        d.fy = d.y;
      };

      this.dragged = function(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      };

      this.dragended = function(d) {
        if (!d3.event.active) {
          this.simulation.alphaTarget(0);
        }
        d.fx = null;
        d.fy = null;
      };
      // These are implementations of the custom forces.
      this.clustering = function (alpha) {
        that.nodes.forEach(function (d) {
          const cluster = that.clusters[d.cluster];
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
      }

      this.collide = function (alpha) {
        const quadtree = d3
          .quadtree()
          .x(d => d.x)
          .y(d => d.y)
          .addAll(that.nodes);

        that.nodes.forEach(function (d) {
          let r =
            d.r + that.maxRadius + Math.max(that.padding, that.clusterPadding);
          const nx1 = d.x - r,
            nx2 = d.x + r,
            ny1 = d.y - r,
            ny2 = d.y + r;
          quadtree.visit(function (quad, x1, y1, x2, y2) {
            if (quad.data && quad.data !== d) {
              let x = d.x - quad.data.x,
                y = d.y - quad.data.y,
                l = Math.sqrt(x * x + y * y);
              r =
                d.r +
                quad.data.r +
                (d.cluster === quad.data.cluster
                  ? that.padding
                  : that.clusterPadding);
              if (l < r) {
                l = ((l - r) / l) * alpha;
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

      // create the clustering/collision force simulation
      // and pass the simulation to child components
      this.simulation = d3
        .forceSimulation(this.nodes)
        .velocityDecay(0.3)
        .force('x', that.forceXCombine)
        .force('y', that.forceYCombine)
        .force('collide', that.collide)
        .force('gravity', that.forceGravity)
        .force('cluster', that.clustering)
        .on('tick', that.ticked);

    });
  }

  handleSliderUpdate($event, filterVariable) {
    const that = this;
    // update the viz with the slider value, $event
    // update the nodes from the data
    // TODO: faster = include skills values in the nodes initially and ONLY filter the nodes
    const filteredNodes = this.nodes.filter(d => d[filterVariable] >= $event);

    // update the viz from the new nodes
    this.circles = this.circles.data(filteredNodes);

    this.circles.exit().remove(); // TODO: transition in and out

    this.circles.enter().append('circle')
      .attr('r', (d) => d.r)
      .attr('fill', (d) => that.colorScale(d.cluster))
      .call(d3.drag()
        .on('start', that.dragstarted)
        .on('drag', that.dragged)
        .on('end', that.dragended));

    // Update and restart the simulation.
    this.simulation.nodes(filteredNodes).alpha(0.3).restart();

      // add tooltips to each circle
      // .on('mouseover', function (d) {
      //   div.transition()
      //     .duration(200)
      //     .style('opacity', .9);
      //   div.html('The major ' + d.major + '<br/>In the category ' + d.major_cat +
      //     '<br/>Total: ' + d.total + '; Radius:' + d.r)
      //     .style('left', (d3.event.pageX) + 'px')
      //     .style('top', (d3.event.pageY - 28) + 'px');
      // })
      // .on('mouseout', function (d) {
      //   div.transition()
      //     .duration(500)
      //     .style('opacity', 0);
      // });
  }
}
