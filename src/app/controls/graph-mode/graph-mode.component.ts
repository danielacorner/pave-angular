import { Component, OnInit, AfterContentInit, Input } from '@angular/core';
import * as d3 from 'd3';
import { DataService } from '../../data.service';
import { AppStatusService } from '../../app-status.service';

@Component({
  selector: 'app-graph-mode',
  template: `
    <button class="center btn waves-effect z-depth-3"
    [class.green]="active"
    [ngStyle]='btnStyles'
    (click)="handleClick()">
      <mat-slide-toggle
      color="accent" labelPosition="before"
      >
      <span class="white-text">GRAPH VIEW</span>
      </mat-slide-toggle>
    </button>

<mat-form-field class="y-axis-dropdown"
[style.display]="(active ? 'inline' : 'none')"
>
  <mat-select
  placeholder="Y-axis"
  [(value)]="ySelector"
  (selectionChange)="changeSelection($event, 'y')"
  >
      <mat-optgroup *ngFor="let group of axisSelectorGroups" [label]="group.name"
                    >
        <mat-option *ngFor="let item of group.members" [value]="item.value">
          {{item.viewValue}}
        </mat-option>
      </mat-optgroup>
    </mat-select>
</mat-form-field>

<mat-form-field class="x-axis-dropdown"
[style.display]="(active ? 'inline' : 'none')"
>
  <mat-select
  placeholder="X-axis"
  [(value)]="xSelector"
  (selectionChange)="changeSelection($event, 'x')"
  >
      <mat-optgroup *ngFor="let group of axisSelectorGroups" [label]="group.name"
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
      button {
        width: 100px;
        border-radius: 4px;
        opacity: 1;
        display: flex;
        margin: auto;
      }
      .x-axis-dropdown {
        position: fixed;
        bottom: 100px;
        left: 100px;
      }
      mat-select-placeholder {
        color: black;
      }
      .y-axis-dropdown {
        position: fixed;
        bottom: 100px;
        right: 100px;
      }
      @media only screen and (max-width: 692px) {
        button {
          transform: scale(0.8);
          width: 220px;
        }
      }
    `
  ]
})
export class GraphModeComponent implements OnInit, AfterContentInit {
  constructor(
    private _dataService: DataService,
    private _statusService: AppStatusService
  ) {}
  // static inputs
  @Input() public nodes;
  @Input() public buttonData;
  @Input() public forceXCombine;
  @Input() public forceYCombine;
  @Input() public nClusters;
  @Input() public width;
  @Input() public height;
  @Input() public navbarHeight;
  // subscriptions
  public subscriptions = [
    'forceCluster',
    'forceSimulation',
    'svgTransform'
  ];
  public forceCluster;
  public forceSimulation;
  public svgTransform;
  public data$;

  public axisSelectorGroups = [
    {
      name: 'Statistics',
      members: [
        {
          value: 'automationRisk',
          viewValue: 'Risk of machines replacing this job'
        },
        { value: 'workers', viewValue: 'Numer of Jobs' },
        { value: 'wage', viewValue: 'Wage ($ / hr)' },
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

  public btnHeight = 50;
  public btnStyles = {
    height: this.btnHeight + 'px',
    width: '185px'
  };
  public active = false;

  public xSelector = 'automationRisk';
  public ySelector = 'workers';

  public scaleX;
  public scaleY;

  public oldXPositions = [];
  public oldYPositions = [];
  public newXPositions = [];
  public newYPositions = [];
  public transitionDuration = 500;

  public graphDimensions = { x: 0.8, y: 0.7 };

  ngOnInit() {
    // pull in the subscriptions
    this.subscriptions.forEach(s => {
      const titleCase = s
          .charAt(0)
          .toUpperCase() + s.slice(1);
      this._statusService['current' + titleCase].subscribe(v => (this[s] = v));
    });
             }

  ngAfterContentInit() {
    // resolve d3 function scope by saving outer scope
    this._dataService.getData().subscribe(receivedData => {
      this.data$ = receivedData.splice(0, receivedData.length);
    });
  }

  handleClick() {
    this.active = !this.active;
    this.active ? this.graphModeOn() : this.graphModeOff();
  }

  graphModeOn() {
    const that = this;

    this._statusService.changeSvgTransform('scale(1)');

    that.data$.map(d => (that.newXPositions = d[that.xSelector]));
    that.data$.map(d => (that.newYPositions = d[that.ySelector]));

    this.setScales(that);

    this._statusService.changeForceSimulation(this.forceSimulation.alpha(0));
    // transition circles using x, y for initial simulation positions
    d3.selectAll('circle')
      .transition()
      .duration(that.transitionDuration)
      .each(d => {
        that.oldXPositions[d.id] = d.x;
        that.oldYPositions[d.id] = d.y;
      })
      .attrTween('cx', function(d) {
        const i = d3.interpolate(d.x, that.scaleX(+d.all[that.xSelector]));
        return t => (d.cx = i(t));
      })
      .attrTween('cy', function(d) {
        const i = d3.interpolate(d.y, that.scaleY(+d.all[that.ySelector]));
        return t => (d.cy = i(t));
      });
  }

  private setScales(that: this) {
    this.scaleX = d3
      .scaleLinear()
      .domain(d3.extent(that.data$.map(d => d[that.xSelector])))
      .range([
        that.graphDimensions.x * (-that.width / 2),
        that.graphDimensions.x * (that.width / 2)
      ]);
    this.scaleY = d3
      .scaleLinear()
      .domain(d3.extent(that.data$.map(d => d[that.ySelector])))
      .range([
        that.graphDimensions.y * (-that.height / 2),
        that.graphDimensions.y * (that.height / 2)
      ]);
  }

  graphModeOff() {
    const that = this;

    // todo: change svg transform back based on number of filtered nodes

    d3.selectAll('circle')
      .transition()
      .duration(that.transitionDuration)
      .attrTween('cx', d => {
        const i = d3.interpolate(d.cx, that.oldXPositions[d.id]);
        return t => (d.cx = i(t));
      })
      .attrTween('cy', d => {
        const i = d3.interpolate(d.cy, that.oldYPositions[d.id]);
        return t => (d.cy = i(t));
      });
    setTimeout(function() {
      that.forceSimulation
        .alpha(0.3)
        .alphaTarget(0.001)
        .restart();
    }, that.transitionDuration);
  }

  changeSelection($event, axis) {
    const that = this;
    // change the axis selectors
    axis === 'x'
      ? (that.xSelector = $event.value)
      : (that.ySelector = $event.value);
    // recalculate the axis scales
    this.setScales(that);
    // transition the circles using cx, cy for current positions
    d3.selectAll('circle')
      .transition()
      .duration(500)
      .attrTween('cx', function(d) {
        const i = d3.interpolate(d.cx, that.scaleX(+d.all[that.xSelector]));
        return t => (d.cx = i(t));
      })
      .attrTween('cy', function(d) {
        const i = d3.interpolate(d.cy, that.scaleY(+d.all[that.ySelector]));
        return t => (d.cy = i(t));
      });
  }
}
