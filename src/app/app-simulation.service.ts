import { Injectable } from '@angular/core';
import { AppStatusService } from './app-status.service';

@Injectable({
  providedIn: 'root'
})
export class AppSimulationService {
  constructor(private _statusService: AppStatusService) {}

  public clusteringAmount = 0.5;

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
            l = this.clusteringAmount * Math.sqrt(x * x + y * y);
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
}
