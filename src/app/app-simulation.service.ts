import { Injectable } from '@angular/core';
import { AppStatusService } from './app-status.service';
import { forceCluster } from 'd3-force-cluster';

import * as d3 from 'd3';

@Injectable({
  providedIn: 'root'
})
export class AppSimulationService {
  constructor(private _statusService: AppStatusService) {}

  // -----------------------------------------------------------------------------------------------------
  // Force functions
  // -----------------------------------------------------------------------------------------------------

  forceCluster(nodes, clusterCenters, clusteringAmount) {
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
            l = clusteringAmount * Math.sqrt(x * x + y * y);
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

  forceCollide(radiusSelector, defaultCircleRadius, nodePadding) {
    this._statusService.changeForceCollide(
      d3
        .forceCollide()
        .radius(
          radiusSelector === 'none'
            ? defaultCircleRadius + nodePadding + 'vmin'
            : d => d.r + nodePadding + 'vmin'
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

  forceCharge(radiusSelector, nodeRepel, radiusScale) {
    this._statusService.changeForceCharge(
      d3
        .forceManyBody()
        .strength(
          radiusSelector === 'none'
            ? nodeRepel
            : d =>
                Math.pow(radiusScale(+d.all[radiusSelector]), 2) *
                nodeRepel
        )
    );
  }

  forceSimulation(forceSimulation, forceGravity, forceCollide) {
    this._statusService.changeForceSimulation(
      forceSimulation
        .force('gravity', forceGravity)
        .force('collide', forceCollide)
        .force('charge', forceCollide)
        .alpha(0.3)
        .restart()
    );
  }

}
