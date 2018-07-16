import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-filter-slider',
  template: `
    <mat-slider thumbLabel [min]="min" [max]="max" step="1"
    [(ngModel)]="myModel"
    tickInterval="5"
    (change)="fireEvent()"
    ></mat-slider>
    <div>{{myModel}}</div>
  `,
  styles: [
    `
      mat-slider {
        width: 40%;
      }
    `
  ]
})
export class FilterSliderComponent implements OnInit {
  @Input() public min;
  @Input() public max;
  @Output() public myModel = new EventEmitter();
  @Output() public childEvent = new EventEmitter();
  constructor() {}

  ngOnInit() {}

  fireEvent() {
    this.childEvent.emit(this.myModel);
  }
}
