import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef
} from '@angular/core';
import * as d3 from 'd3';
import CONFIG from '../../app.config';
import { getWidth, getHeight } from '../utils';
import { AppStatusService } from '../../services/app-status.service';
import { DataService } from '../../services/data.service';
import { AppFilterService } from '../../services/app-filter.service';
import { AppSimulationService } from '../../services/app-simulation.service';
import { DomSanitizer } from '@angular/platform-browser';

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
  NAVBAR_HEIGHT = CONFIG.DEFAULTS.NAVBAR_HEIGHT;

  @Input()
  colourScale;

  @Output()
  forceSimInit = new EventEmitter();

  subscriptions = [
    'radiusSelector',
    'clusterSelector',
    'uniqueClusterValues',
    'forceCluster',
    'forceGravity',
    'forceSimulation',
    'radiusRange',
    'radiusScale',
    'filteredNodes',
    'nodes',
    'clusterCenters',
    'numClusters',
    'defaultCircleRadius',
    'svgTransform',
    'sliderPositions'
  ];
  radiusSelector = 'none'; // default value because forceGravity defined before subscription
  sliderPositions;
  clusterSelector;
  uniqueClusterValues;
  forceCluster;
  forceSimulation;
  radiusRange;
  radiusScale;
  filteredNodes;
  nodes;
  clusterCenters;
  numClusters;
  svgTransform = 'scale(1)'; // zoom when fewer nodes
  zoomAmount;

  constructor(
    private _dataService: DataService,
    private _statusService: AppStatusService,
    private _filterService: AppFilterService,
    private _simulationService: AppSimulationService,
    private _sanitizer: DomSanitizer,
    private ref: ChangeDetectorRef
  ) {}

  ngOnInit() {}
}
