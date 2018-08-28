import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as d3 from 'd3';
import CONFIG from '../../app.config';
import { getWidth, getHeight } from '../utils';
import { AppStatusService } from '../../services/app-status.service';

@Component({
  selector: 'app-force-simulation',
  template: `
    <p>
      force-simulation works!
    </p>
  `,
  styles: []
})
export class ForceSimulationComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
