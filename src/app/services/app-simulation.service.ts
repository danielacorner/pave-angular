import { Injectable } from '@angular/core';
import { AppStatusService } from './app-status.service';
import * as d3 from 'd3';
import APP_CONFIG from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class AppSimulationService {
  constructor(private _statusService: AppStatusService) {}

  forceCluster(nodes, clusterCenters) {
    this._statusService.changeForceCluster(
      // These are implementations of the custom forces.
      alpha => {
        nodes.forEach(d => {
          // if(d.id==1){console.log(d);}
          const clusterCenter = clusterCenters[d.cluster];
          if (clusterCenter === d) {
            return;
          }
          let x = d.x - clusterCenter.x,
            y = d.y - clusterCenter.y,
            l = APP_CONFIG.FORCES.CLUSTER * Math.sqrt(x * x + y * y);
          const r = d.r + clusterCenter.r;
          if (l !== r) {
            l = ((l - r) / l) * alpha;
            d.x -= x *= l;
            d.y -= y *= l;
            clusterCenter.x += x;
            clusterCenter.y += y;
          }
        });
      }
    );
  }

  forceCollide(radiusSelector) {
    const { NODE_PADDING, CIRCLE_RADIUS } = APP_CONFIG.DEFAULTS;
    this._statusService.changeForceCollide(
      d3
        .forceCollide()
        .radius(
          radiusSelector === 'none'
            ? CIRCLE_RADIUS + NODE_PADDING + 'vmin'
            : d => d.r + NODE_PADDING + 'vmin'
        )
    );
  }

  forceGravity(radiusSelector, nodeAttraction, radiusScale) {
    this._statusService.changeForceGravity(
      d3
        .forceManyBody()
        .strength(
          radiusSelector === 'none'
            ? nodeAttraction
            : d =>
                Math.pow(radiusScale(+d.all[radiusSelector]), 2) *
                nodeAttraction
        )
    );
  }
}
