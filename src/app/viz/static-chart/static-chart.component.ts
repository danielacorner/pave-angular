import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as d3 from 'd3';
import CONFIG from '../../app.config';
import { getWidth, getHeight } from '../utils';
import { AppStatusService } from '../../services/app-status.service';

@Component({
  selector: 'app-static-chart',
  template: `

  `,
  styles: []
})
export class StaticChartComponent implements OnInit {
  bubble;
  bubbleSvg;
  staticNodes;
  staticCircles;

  staticChartResizer;
  NAVBAR_HEIGHT = CONFIG.DEFAULTS.NAVBAR_HEIGHT;
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

  @Input()
  colourScale;

  @Output()
  chartInit = new EventEmitter();

  constructor(private _statusService: AppStatusService) {}

  ngOnInit() {
    // pull in the subscriptions
    this.subscriptions.forEach(s => {
      const titleCase = s.charAt(0).toUpperCase() + s.slice(1);
      this._statusService['current' + titleCase].subscribe(v => (this[s] = v));
    });
  }

  initStaticChart() {
    // todo: extract force simulation to its own component
    // todo: scale and re-render chart on resize
    // todo: hide appended text under threshold < circle radius
    // todo: hide appended text under threshold
    this.staticChartResizer = 0.7;

    const canvasWidth = getWidth('#canvas');
    const canvasHeight = getHeight('#canvas');

    const [width, height] = [
      canvasWidth * this.staticChartResizer,
      canvasHeight * this.staticChartResizer
    ];

    this.bubble = d3
      .pack()
      .size([width, height])
      .padding(1.5);

    // center the chart
    const translateX = (1 - this.staticChartResizer) * 0.5 * canvasWidth;
    const translateY =
      (1 - this.staticChartResizer) * 0.5 * canvasHeight + this.NAVBAR_HEIGHT;

    this.bubbleSvg = d3
      .select('#canvas')
      .append('g')
      .attr('class', 'bubble')
      .attr('transform', `translate(${translateX},${translateY})`);

    // size of each node
    this.staticNodes = d3.hierarchy({ children: this.nodes }).sum(d => {
      if (this.radiusSelector === 'none') {
        return 10;
      } else {
        return d[this.radiusSelector];
      }
    });

    this.staticCircles = this.bubbleSvg
      .selectAll('.node')
      .data(this.bubble(this.staticNodes).descendants(), d => d.id)
      .enter()
      .filter(d => !d.children)
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => 'translate(' + d.x + ',' + d.y + ')');

    this.staticCircles
      .append('title')
      .text(d => d.data.all.job + ': ' + d.data.all.workers);

    this.staticCircles
      .append('circle')
      .attr('id', d => `circle_${d.data.id}`)
      .attr('r', d => d.r)
      .style('fill', d => this.colourScale(d.data.all.cluster));

    this.chartInit.emit(this.staticCircles);

    this.staticCircles
      .append('text')
      .attr('dy', '.2em')
      .style('text-anchor', 'middle')
      .style('pointer-events', 'none')
      .text(d => d.data.all.job.substring(0, d.r / 3))
      .attr('font-family', 'sans-serif')
      .attr('font-size', d => d.r / 5)
      .attr('fill', 'white');

    this.staticCircles
      .append('text')
      .attr('dy', '1.3em')
      .style('text-anchor', 'middle')
      .style('pointer-events', 'none')
      .text(d => d.data.all.workers)
      .attr('font-family', 'Gill Sans', 'Gill Sans MT')
      .attr('font-size', d => d.r / 5)
      .attr('fill', 'white');

    d3.select(self.frameElement).style('height', height + 'px');
  }

  recenterStaticChart() {
    const canvasWidth = getWidth('#canvas');
    const chartWidth = getWidth('.bubble');
    const chartHeight = getHeight('.bubble');
    const canvasHeight = getHeight('#canvas');

    // center the chart
    // todo: this breaks when loaded on width > 1000px
    const translateX = 0.5 * (canvasWidth - chartWidth);
    const translateY =
      (1 - this.staticChartResizer) * 0.5 * canvasHeight + this.NAVBAR_HEIGHT;

    d3.select('.bubble').attr(
      'transform',
      `translate(${translateX},${translateY})`
    );
  }

  filterStaticChart() {
    const remainingIds = this.filteredNodes.map(d => d.id);

    // turn to-be-filtered nodes transparent
    d3.selectAll('.node')
      .style('opacity', 1)
      .filter(d => !remainingIds.includes(d.data.id))
      .style('opacity', 0.1);

    // todo: pop and remove the final exit() selection on mouseup
  }

  rerenderStaticChart() {
    const remainingIds = this.filteredNodes.map(d => d.id);

    // remove all nodes
    d3.selectAll('.node')
      .transition()
      .duration(500)
      .style('opacity', 0)
      .remove();

    // create circle-pack layout
    const bubble = d3
      .pack(this.filteredNodes)
      .size([
        getWidth('#canvas') * this.staticChartResizer,
        getHeight('#canvas') * this.staticChartResizer
      ])
      .padding(1.5);

    // center the chart
    const translateX =
      (1 - this.staticChartResizer) * 0.5 * getWidth('#canvas');
    const translateY =
      (1 - this.staticChartResizer) * 0.5 * getHeight('#canvas') +
      this.NAVBAR_HEIGHT;

    const bubbleSvg = d3
      .select('#canvas')
      .append('g')
      .attr('class', 'bubble')
      .attr('transform', `translate(${translateX},${translateY})`);

    const dataset = { children: this.filteredNodes };

    // size of each node
    const nodes = d3.hierarchy(dataset).sum(d => {
      if (this.radiusSelector === 'none') {
        return 10;
      } else {
        return d[this.radiusSelector];
      }
    });

    this.staticCircles = bubbleSvg
      .selectAll('.node')
      .data(bubble(nodes).descendants())
      .enter()
      .filter(d => !d.children)
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => 'translate(' + d.x + ',' + d.y + ')');

    this.staticCircles
      .append('title')
      .text(d => d.data.all.job + ': ' + d.data.all.workers);

    this.staticCircles
      .append('circle')
      .attr('id', d => `circle_${d.data.id}`)
      .attr('r', d => d.r)
      .style('fill', d => this.colourScale(d.data.all.cluster))
      .style('opacity', 0)
      .transition()
      .duration(1000)
      .style('opacity', 1);

    this.chartInit.emit(this.staticCircles);
    // this.addMouseInteractions(this.staticCircles);

    this.staticCircles
      .append('text')
      .attr('dy', '.2em')
      .style('text-anchor', 'middle')
      .style('pointer-events', 'none')
      .text(d => d.data.all.job.substring(0, d.r / 3))
      .attr('font-family', 'sans-serif')
      .attr('font-size', d => d.r / 5)
      .attr('fill', 'white');

    this.staticCircles
      .append('text')
      .attr('dy', '1.3em')
      .style('text-anchor', 'middle')
      .style('pointer-events', 'none')
      .text(d => d.data.all.workers)
      .attr('font-family', 'Gill Sans', 'Gill Sans MT')
      .attr('font-size', d => d.r / 5)
      .attr('fill', 'white');

    d3.select(self.frameElement).style(
      'height',
      getHeight('#canvas') * this.staticChartResizer + 'px'
    );
  }
}
