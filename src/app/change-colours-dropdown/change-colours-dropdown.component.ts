import { Component, OnInit, Input, AfterContentInit } from '@angular/core';
import * as d3 from 'd3';
import { DataService } from '../data.service';
import { AppStatusService } from '../app-status.service';

@Component({
  selector: 'app-change-colours-dropdown',
  template: `

<mat-form-field class="colours-select"
[style.display]="(active ? 'inline' : 'none')"
>
  <mat-select
  placeholder="Circle colour"
  [(value)]="clusterSelector"
  (selectionChange)="changeSelection($event)"
  >
    <mat-option value="none">-- None --</mat-option>
    <mat-optgroup *ngFor="let group of clusterSelectorGroups" [label]="group.name"
                  >
      <mat-option *ngFor="let item of group.members" [value]="item.value">
        {{item.viewValue}}
      </mat-option>
    </mat-optgroup>
  </mat-select>
</mat-form-field>

  `,
  styles: [
    `
      .colours-select {
        position: fixed;
        bottom: 300px;
        left: 30px;
        background: rgba(246, 248, 255, 0.7);
      }
    `
  ]
})
export class ChangeColoursDropdownComponent implements OnInit, AfterContentInit {
  // static inputs
  @Input() public colourScale;
  @Input() public nodeAttraction;
  @Input() public nodePadding;
  public active = true;
  public data$;
  public newClusters;
  // subscriptions
  public clusterCenters;
  public uniqueClusterValues;
  public nodes;
  public forceSimulation;
  public clusterSelector;
  public forceCluster;

  public clusterSelectorGroups = [
    {
      name: 'Statistics',
      members: [
        { value: 'industry', viewValue: 'Job Industry (large category groups)' },
        { value: 'sector', viewValue: 'Job Sector (small category groups)' },
        { value: 'minEduc', viewValue: 'Minimum years of education' }
      ]
    },
    {
      name: 'Skills',
      members: [
        { value: 'topSkill1', viewValue: 'Most useful skill for each job' },
      ]
    }
  ];

  constructor(private _dataService: DataService, private _statusService: AppStatusService) { }

  ngOnInit() {
    this._statusService.currentClusterSelector.subscribe(v => (this.clusterSelector = v));
    this._statusService.currentForceCluster.subscribe(v => (this.forceCluster = v));
    this._statusService.currentForceSimulation.subscribe(v => (this.forceSimulation = v));
    this._statusService.currentUniqueClusterValues.subscribe(v => (this.uniqueClusterValues = v));
    this._statusService.currentClusterCenters.subscribe(v => (this.clusterCenters = v));
    this._statusService.currentNodes.subscribe(v => (this.nodes = v));
   }

  ngAfterContentInit() {
    this._dataService.getData().subscribe(receivedData => {
      this.data$ = receivedData;
    });
  }

  changeSelection($event) {
    const that = this;
    // change the cluster selector
    this._statusService.changeClusterSelector($event.value);

    // convert each unique value to a cluster number
    this._statusService.changeUniqueClusterValues(
      this.data$
      .map(d => d[that.clusterSelector])
      // filter uniqueOnly
      .filter((value, index, self) => self.indexOf(value) === index)
    );

    // reset the (local) cluster centers
    this.clusterCenters = [];

    // redefine the nodes
    this._statusService.changeNodes(
      // todo: map from the data? or map from the nodes?
      this.nodes.map(d => {
        // detect the cluster center
        const forcedCluster = this.uniqueClusterValues.indexOf(d.all[that.clusterSelector]) + 1;
        // change the node's cluster
        d.cluster = forcedCluster;
        // if (d.id === 200) { console.log(this.clusterCenters); }
        // add to clusters array if it doesn't exist or the radius is larger than another radius in the cluster
        if (
          !this.clusterCenters[forcedCluster] ||
          d.r > this.clusterCenters[forcedCluster].r
        ) {
          this.clusterCenters[forcedCluster] = d; // local
          this._statusService.changeClusterCenters(this.clusterCenters); // global
        }
        return d;
      })
    );

    // transition the circle colours
    d3.selectAll('circle').transition()
      .attr('fill', (d, i) => this.colourScale(this.nodes[i].cluster))
      .delay((d, i) => i * 0.8);

      // .attr('r', that.clusterSelector === 'none' ? window.innerWidth * 0.009 :
      //   d => that.colourScale(+d.all[that.clusterSelector]))

    this._statusService.changeForceCluster(alpha => {
      that.nodes.forEach(d => {
        const cluster = that.clusterCenters[d.cluster];
        // if (d.id === 200) { console.log(cluster); }
        // if (d.id === 200) { console.log(d); }
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
    });


    setTimeout(() => {
      console.log(this.clusterSelector)
      console.log(this.forceCluster)
      this.forceSimulation
        .force('cluster', (this.clusterSelector === 'none' ? null : this.forceCluster))
        .alpha(0.3)
        .restart();
    }, 500);
  }
}
