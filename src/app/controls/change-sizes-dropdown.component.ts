import { Component, OnInit, Input, AfterContentInit } from '@angular/core';
import { DataService } from '../services/data.service';
import { AppStatusService } from '../services/app-status.service';
import { AppSimulationService } from '../services/app-simulation.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-change-sizes-dropdown',
  template: `

<mat-form-field class="sizes-select"
>
  <mat-select
  placeholder="Circle size"
  [(value)]="radiusSelector"
  (selectionChange)="changeSelection($event)"
  >
    <mat-option value="none">-- None --</mat-option>
    <mat-optgroup *ngFor="let group of radiusSelectorGroups" [label]="group.name"
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
      .sizes-select {
        padding: 5px;
        background: rgba(246, 248, 255, 0.7);
      }
    `
  ]
})
export class ChangeSizesDropdownComponent implements OnInit, AfterContentInit {
  // static inputs
  @Input() public nodeAttraction;
  @Input() public nodePadding;
  @Input() public minRadius;
  @Input() public width;
  // subscriptions
  public subscriptions = [
    'defaultCircleRadius',
    'radiusRange',
    'radiusScale',
    'radiusSelector',
    'forceSimulation',
    'forceCollide',
    'forceGravity',
    'nodes',
    'filteredNodes'
  ];
  public defaultCircleRadius;
  public radiusRange;
  public radiusScale;
  public radiusSelector;
  public forceSimulation;
  public forceCollide;
  public forceGravity;
  public nodes;
  public filteredNodes;
  public active = true;
  public data$;

  public radiusSelectorGroups = [
    {
      name: 'Statistics',
      members: [
        { value: 'workers', viewValue: 'Numer of Jobs' },
        { value: 'salaryMed', viewValue: 'Salary ($ / yr)' }
      ]
    },
    {
      name: 'Skills',
      members: [
        { value: 'skillsComp', viewValue: 'Computer and Information Skills' },
        { value: 'skillsLogi', viewValue: 'Logic and Reasoning Skills' },
        { value: 'skillsMath', viewValue: 'Math and Spatial Skills' },
        { value: 'skillsLang', viewValue: 'Language and Communication Skills' }
      ]
    }
  ];

  constructor(
    private _dataService: DataService,
    private _statusService: AppStatusService,
    private _simulationService: AppSimulationService
  ) {}

  ngOnInit() {
    this._dataService.getData().subscribe(receivedData => {
      this.data$ = receivedData;
    });
    // pull in the subscriptions
    this.subscriptions.forEach(s => {
      const titleCase = s.charAt(0).toUpperCase() + s.slice(1);
      this._statusService['current' + titleCase].subscribe(v => (this[s] = v));
    });

  }

  ngAfterContentInit() {}

  changeSelection($event) {

    // change the radius selector
    this._statusService.changeRadiusSelector($event.value);

    // recalculate the radius range
    this._statusService.changeRadiusRange(
      [ this.minRadius,
      // max radius
        ['skillsComp', 'skillsLogi', 'skillsMath', 'skillsLang'].includes($event.value)
        ? this.defaultCircleRadius * 2.8 * 0.55
        : this.defaultCircleRadius * 2.8]
    );
    // recalculate the radius scale
    this._statusService.changeRadiusScale(
      d3
        .scaleSqrt() // sqrt because circle areas
        .domain(d3.extent(this.data$, d => +d[this.radiusSelector]))
        .range([this.radiusRange[0], this.radiusRange[1]])
    );

    // transition the circle radii, then update node radii to match

    d3.selectAll('circle').transition().attr(
      'r',
      this.radiusSelector === 'none'
        ? this.defaultCircleRadius + 'vmin'
        : d => this.radiusScale(+d.all[this.radiusSelector]) + 'vmin'
    ).delay((d, i) => i * 0.8);

    setTimeout(() => {
      this._statusService.changeNodes(
      this.nodes.map(d => {
        this.radiusSelector === 'none'
        ? d.r = this.defaultCircleRadius
        : d.r = this.radiusScale(+d.all[this.radiusSelector]);
        return d;
      })
    );
    }, 1000);

    setTimeout(() => {
      // change the collision force to the new radius
      this._statusService.changeForceCollide(
        this._simulationService.forceCollide(this.radiusSelector, this.defaultCircleRadius, this.nodePadding)
      );
      // change the force simulation with new gravities and radii
      this._statusService.changeForceSimulation(
        this.forceSimulation
          .force(
            'gravity',
            d3
              .forceManyBody()
              .strength(
                this.radiusSelector === 'none'
                  ? this.nodeAttraction
                  : d =>
                      Math.pow(
                        this.radiusScale(+d.all[this.radiusSelector]),
                        2
                      ) * this.nodeAttraction
              )
          )
          .force('collide', this.forceCollide)
          .alpha(0.3)
          .restart()
      );
    }, 500);
  }
}
