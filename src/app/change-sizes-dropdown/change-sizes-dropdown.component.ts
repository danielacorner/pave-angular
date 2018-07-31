import { Component, OnInit, Input, AfterContentInit } from '@angular/core';
import * as d3 from 'd3';
import { DataService } from '../data.service';
import { AppStatusService } from '../app-status.service';

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
  public defaultCircleRadius;
  public radiusRange;
  public radiusScale;
  public radiusSelector;
  public forceSimulation;
  public active = true;
  public data$;
  public nodes;
  public filteredNodes;

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
    private _statusService: AppStatusService
  ) {}

  ngOnInit() {
    this._statusService.currentRadiusSelector.subscribe(
      v => (this.radiusSelector = v)
    );
    this._statusService.currentForceSimulation.subscribe(
      v => (this.forceSimulation = v)
    );
    this._statusService.currentRadiusRange.subscribe(
      v => (this.radiusRange = v)
    );
    this._statusService.currentRadiusScale.subscribe(
      v => (this.radiusScale = v)
    );
    this._dataService.getData().subscribe(receivedData => {
      this.data$ = receivedData;
    });
    this._statusService.currentFilteredNodes.subscribe(
      v => (this.filteredNodes = v)
    );
    this._statusService.currentNodes.subscribe(
      v => (this.nodes = v)
    );
    this._statusService.currentDefaultCircleRadius.subscribe(
      v => (this.defaultCircleRadius = v)
    );

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
        ? this.defaultCircleRadius + 'vw'
        : d => this.radiusScale(+d.all[this.radiusSelector]) + 'vw'
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
          .alpha(0.3)
          .restart()
      );
    }, 500);
  }
}
