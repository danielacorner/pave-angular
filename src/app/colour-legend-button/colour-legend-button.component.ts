import { Component, OnInit, Input } from '@angular/core';
import { AppStatusService } from '../app-status.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-colour-legend-button',
  template: `
  <button class='btn waves-effect z-depth-3'
    [class.green]="colourSortActive"
    [ngStyle]='btnStyles'
    (click)="handleClick()">
  <div class='grid-container'>
    <div class="sort-icon valign-wrapper">
      <mat-icon
      [style.transform]="(colourSortActive ? 'rotate(-90deg)' : null)"
      >filter_list</mat-icon>
    </div>
    <div class="btn-text">
      <span>
      <p>Sort by</p>
      <p>Colours</p>
      </span>
    </div>
  </div>

  </button>
  `,
  styles: [
    `
      p {
        line-height: 0.5em;
      }
      button {
        border-radius: 4px;
        opacity: 1;
      }
      .grid-container {
        display: grid;
        grid-gap: 10px;
        grid-columns: auto auto;
      }
      .sort-icon {
        text-align: center;
        grid-column: 2;
        grid-row: 1;
      }
      .btn-text {
        text-align: center;
        grid-column: 1;
        grid-row: 1;
      }
      mat-icon {
        transition: transform 0.2s;
      }
      .annotation {

      }
    `
  ]
})
export class ColourLegendButtonComponent implements OnInit {
  // static inputs
  @Input() public forceXCombine;
  @Input() public forceYCombine;
  @Input() public nClusters;
  @Input() public navbarHeight;
  @Input() public width;
  @Input() public height;
  // subscriptions
  public forceSimulation;
  public forceCluster;
  public uniqueClusterValues;
  public clusterSelector;
  public colourSortActive;

  public btnHeight = 70;
  public btnStyles = {
    height: this.btnHeight + 'px',
    width: '130px'
  };
  public clusterCenters = [];
  public refreshInterval;

  constructor(private _statusService: AppStatusService) {}

  ngOnInit() {
    this._statusService.currentClusterSelector.subscribe(v => (this.clusterSelector = v));
    this._statusService.currentUniqueClusterValues.subscribe(v => (this.uniqueClusterValues = v));
    this._statusService.currentForceCluster.subscribe(v => (this.forceCluster = v));
    this._statusService.currentForceSimulation.subscribe(v => (this.forceSimulation = v));
    this._statusService.currentColourSortActive.subscribe(v => (this.colourSortActive = v));
  }

  handleClick() {
    this._statusService.changeColourSortActive(!this.colourSortActive);
    const that = this;
    // split the clusters horizontally
    const forceXSeparate = d3
      .forceX(function(d) {
        return (
          // 40% (screen width / number of clusters)
          0.4 * ((that.width / that.nClusters) * d.cluster) -
          (0.4 * that.width) / 2
        );
      })
      .strength(1.2);
    // split the clusters vertically
    const forceYSeparate = d3
      .forceY(function(d) {
        if (d.cluster % 2 === 0) {
          // even clusters go up to 2/6 height
          return -that.height / 12;
        } else {
          // odd clusters go down to 4/6 height
          return that.height / 12;
        }
      })
      .strength(1.2);

    if (this.colourSortActive) {
      this._statusService.changeForceSimulation(this.forceSimulation
          .force('x', forceXSeparate)
          .force('y', forceYSeparate)
          .alpha(0.3)
          .alphaTarget(0.001)
          .restart());

      this.createAnnotations();

      setTimeout(function() {
        d3.selectAll('.annotation-note-bg')
          .style('fill', 'white')
          .style('fill-opacity', 0.7);

        d3.selectAll('.annotation-group')
          // .style('font-size','20px')
          .style('font-weight', 'bold')
          .style('fill', 'black');
        d3.selectAll('.annotation-note-label')
          .style('background', 'white')
          .style('opacity', 1);
      }, 3000);
    } else {
      this._statusService.changeForceSimulation(this.forceSimulation
          .force('x', that.forceXCombine)
          .force('y', that.forceYCombine)
          .alpha(0.3)
          .alphaTarget(0.001)
          .restart());

      this.clearAnnotations();
    }
  }

  createAnnotations() {
    const that = this;

    // get average cluster 'center of mass'
    const calculateClusterCenters = () => {
      that.uniqueClusterValues.map((cluster, index) => {
        // select cluster-specific circles
        const clusterCircles = d3
          .selectAll('circle')
          .data()
          .filter(d => d.clusterValue === cluster);
        // average x, y positions per cluster
        const clusterX = clusterCircles.map(c => c.x);
        const clusterY = clusterCircles.map(c => c.y);

        const avgX =
          clusterX.reduce((acc, currValue) => {
            return acc + currValue;
          }, 0) /
            clusterCircles.length +
          window.innerWidth / 2;

        const avgY =
          clusterY.reduce((acc, currValue) => {
            return acc + currValue;
          }, 0) /
            clusterCircles.length +
          window.innerHeight / 2;

        that.clusterCenters[index] = [avgX, avgY];
      });
    };
    calculateClusterCenters();

    const transitionTime = 350;
    // todo: calculate marginLeft = 1/2 annotation width
    const marginLeft = 110;

    // append cluster title to the canvas at avg x, y
    that.uniqueClusterValues.map((cluster, index) => {
      d3.select('body')
        .append('div')
        .attr('class', 'annotation')
        .style('position', 'fixed')
        .style('max-width', '200px')
        .style('opacity', 0)
        .style('color', '#272d2d')
        .style('padding', '0 5px')
        .style('background', 'rgba(246, 248, 255, 0.7)')
        .style('font-family', 'Helvetica')
        .style('left', that.clusterCenters[index][0] - marginLeft + 'px')
        .style('top', that.clusterCenters[index][1] + 'px')
        .html(cluster)
        .attr('id', cluster)
        .transition()
        .duration(transitionTime)
        .style('opacity', 1);
      // console.log(that.clusterCenters)
    });
    // re-center every .5s
    this.refreshInterval = setInterval(() => {
      calculateClusterCenters();
      d3.selectAll('.annotation')
        .transition()
        .ease(d3.easeLinear)
        .duration(transitionTime)
        .style('left', (d, i) => {
          return that.clusterCenters[i][0] - marginLeft + 'px';
        })
        .style('top', (d, i) => {
          return that.clusterCenters[i][1] + 'px';
        });
    }, transitionTime);
  }

  clearAnnotations() {
    clearInterval(this.refreshInterval);
    d3.selectAll('.annotation').transition().duration(500)
      .style('opacity', 0).remove();
  }
}
