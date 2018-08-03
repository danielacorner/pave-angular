import { Injectable } from '@angular/core';
import { AppStatusService } from './app-status.service';
@Injectable({
  providedIn: 'root'
})
export class AppFilterService {
  constructor(private _statusService: AppStatusService) {}
  // public subscriptions = [
  //   'filteredNodes',
  //   'nodes',
  // ];
  // public filteredNodes;
  public sliderPositions = {
    skillsLang: 0,
    skillsLogi: 0,
    skillsMath: 0,
    skillsComp: 0
  };

  // ngOnInit() {
  //   // pull in the subscriptions
  //   console.log(this.nodes)

  //   this.subscriptions.forEach(s => {
  //     const titleCase = s.charAt(0).toUpperCase() + s.slice(1);
  //     this._statusService['current' + titleCase].subscribe(v => (this[s] = v));
  //   });
  //   console.log(this.nodes)

  // }

  filterViz($event, filterVariable, nodes) {
    // new slider position
    this.sliderPositions[filterVariable] = $event;
    // update the viz with the slider value, $event
    // update the nodes from the data
    this._statusService.changeFilteredNodes(
      nodes.filter(d => {
        for (const key in this.sliderPositions) {
          // filter out any nodes below the slider thresholds
          if (d[key] < this.sliderPositions[key]) {
            return false;
          }
        }
        return true;
      })
    );
  }
}
