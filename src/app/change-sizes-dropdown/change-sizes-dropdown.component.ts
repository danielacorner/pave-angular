import { Component, OnInit, Input, AfterContentInit } from '@angular/core';
import * as d3 from 'd3';
import { DataService } from '../data.service';

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
  @Input() radiusSelector;
  @Input() radiusScale;
  @Input() radiusRange;
  @Input() forceSimulation;
  @Input() nodeAttraction;
  @Input() nodePadding;
  @Input() defaultNodeAttraction;
  @Input() defaultCircleRadius;
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

  constructor(private _dataService: DataService) {}

  ngOnInit() {}

  ngAfterContentInit() {
    this._dataService.getData().subscribe(receivedData => {
      this.data$ = receivedData;
    });
  }

  changeSelection($event) {
    const that = this;
    // change the axis selectors
    that.radiusSelector = $event.value;

    this.radiusScale = d3
      .scaleSqrt() // sqrt because circle areas
      .domain(d3.extent(this.data$, d => +d[that.radiusSelector]))
      .range([this.radiusRange[0], this.radiusRange[1]]);

    // recalculate the axis scales
    // transition the circles using cx, cy for current positions
    d3 .selectAll('circle') .transition()
      .attr('r', that.radiusSelector === 'none' ? this.defaultCircleRadius :
        d => that.radiusScale(+d.all[that.radiusSelector]))
          .delay((d, i) => i * 0.8);

    setTimeout(() => {
      this.forceSimulation
        .force( 'gravity',
          d3 .forceManyBody()
            .strength(that.radiusSelector === 'none' ? this.defaultNodeAttraction :
              d =>
                Math.pow(that.radiusScale(+d.all[that.radiusSelector]), 2) *
                this.nodeAttraction)
        )
        .alpha(0.3)
        .restart();
    }, 500);
  }
}
