import { Component, OnInit, Input, AfterContentInit } from '@angular/core';
import * as d3 from 'd3';
import { DataService } from '../data.service';
import { AppStatusService } from '../app-status.service';

@Component({
  selector: 'app-change-sizes-dropdown',
  template: `

<mat-form-field class="sizes-select"
[style.display]="(active ? 'inline' : 'none')"
>
  <mat-select
  placeholder="Circle size"
  [(value)]="radiusSelector"
  (selectionChange)="changeSelection($event)"
  >
      <mat-optgroup *ngFor="let group of radiusSelectorGroups" [label]="group.name"
                    >
        <mat-option value="none">-- None --</mat-option>
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
        position: fixed;
        bottom: 300px;
        right: 30px;
        background: rgba(246, 248, 255, 0.7);
      }
    `
  ]
})
export class ChangeSizesDropdownComponent implements OnInit, AfterContentInit {
  // static inputs
  @Input() public nodeAttraction;
  @Input() public nodePadding;
  @Input() public defaultNodeAttraction;
  @Input() public defaultCircleRadius;
  // subscriptions
  public radiusRange;
  public radiusScale;
  public radiusSelector;
  public forceSimulation;
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

  constructor(private _dataService: DataService, private _statusService: AppStatusService) {}

  ngOnInit() {
    this._statusService.currentRadiusSelector.subscribe(v => this.radiusSelector = v);
    this._statusService.currentForceSimulation.subscribe(v => this.forceSimulation = v);
    this._statusService.currentRadiusRange.subscribe(v => this.radiusRange = v);
    this._statusService.currentRadiusScale.subscribe(v => this.radiusScale = v);
    this._dataService.getData().subscribe(receivedData => {
      this.data$ = receivedData;
    });
  }

  ngAfterContentInit() {
  }

  changeSelection($event) {
    // change the radius selector (it auto-updates because of the subscription)
    this._statusService.changeRadiusSelector($event.value);
    // recalculate the radius range
    this._statusService.changeRadiusRange([
     d3.min()
    ])
    // recalculate the radius scale
    this._statusService.changeRadiusScale(
    d3
      .scaleSqrt() // sqrt because circle areas
      .domain(d3.extent(this.data$, d => +d[this.radiusSelector]))
      .range([this.radiusRange[0], this.radiusRange[1]])
    );

    // transition the circles using cx, cy for current positions
    d3.selectAll('circle').transition()
      .attr('r', this.radiusSelector === 'none' ? this.defaultCircleRadius :
        d => this.radiusScale(+d.all[this.radiusSelector]))
          .delay((d, i) => i * 0.8);

    setTimeout(() => {
      this._statusService.changeForceSimulation(
        this.forceSimulation
        .force('gravity', d3
        .forceManyBody()
        .strength(
          this.radiusSelector === 'none'
          ? this.defaultNodeAttraction
          : d =>
          Math.pow(this.radiusScale(+d.all[this.radiusSelector]), 2) *
          this.nodeAttraction
        ))
        .alpha(0.3)
        .restart()
      );
    }, 500);
  }
}
