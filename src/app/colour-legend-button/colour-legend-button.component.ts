import { Component, OnInit, Input } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-colour-legend-button',
  template: `
  <button class='colourBtn btn waves-effect z-depth-3'
    [ngStyle]="btnStyles"
    (click)="handleClick()">
    <p>Colour</p>
    <p>Legend</p>
  </button>
  `,
  styles: [
    `
      p {
        line-height: 0.5em;
      }
      button {
        height: 70px;
        width: 100px;
        border-radius: 4px;
      }
    `
  ]
})
export class ColourLegendButtonComponent implements OnInit {
  @Input() public forceSimulation;

  public navbarHeight = 64;
  public height = window.innerHeight - this.navbarHeight;
  public middle = this.height / 2;
  public btnStyles = {
    position: 'fixed',
    top: this.height / 2 + 'px',
  };

  constructor() {}

  ngOnInit() {
    // transition height down by half button height
    const buttonHeight = document.getElementsByClassName('colourBtn')[0].getBoundingClientRect().height;
    const that = this;
    d3.select('.colourBox').transition().duration(500)
      .style('top', (this.middle + (buttonHeight / 2)) + 'px');
  }

  handleClick() {
    console.log(this.forceSimulation);
  }
}
