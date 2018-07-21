import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-graph-mode',
  template: `
    <button (click)="handleClick()" mat-button>
      GRAPH VIEW
    </button>
  `,
  styles: []
})
export class GraphModeComponent implements OnInit {
  @Input() public buttonData;

  constructor() { }

  ngOnInit() {
  }

  handleClick() {
    console.log('CLICK IT');
    console.log(this.buttonData);
  }
}
