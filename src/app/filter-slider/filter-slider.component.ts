import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataService } from '../data.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-filter-slider',
  template: `
    <div class="slider-container">
      <div class="title">
      <p>{{title1}}</p>
      <p>{{title2}}</p>
      </div>
      <mat-slider thumbLabel [min]="min" [max]="max" step="1"
      [(ngModel)]="sliderValue"
      tickInterval="10"
      (change)="fireEvent()"
      ></mat-slider>
    </div>
  `,
  styles: [
    `
      .slider-container {
      }
      mat-slider {
      }
      .title p {
        line-height: 0.5rem;
      }
    `
  ]
})
export class FilterSliderComponent implements OnInit {
  public sliderValue;
  @Input() public title1;
  @Input() public title2;
  @Input() public filterVariable;
  @Output() public childEvent = new EventEmitter();
  public min;
  public max;

  constructor(private _dataService: DataService) {}

  ngOnInit() {
    // load data and set slider range on creation
    this._dataService.getData().subscribe(receivedData => {
      this.min = d3.min(receivedData.map(d => d[this.filterVariable]));
      this.max = d3.max(receivedData.map(d => d[this.filterVariable])) * 0.75;
    });
  }

  fireEvent() {
    this.childEvent.emit(this.sliderValue);
  }
}
