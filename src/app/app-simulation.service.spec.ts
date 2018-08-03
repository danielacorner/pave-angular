import { TestBed, inject } from '@angular/core/testing';

import { AppSimulationService } from './app-simulation.service';

describe('AppSimulationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppSimulationService]
    });
  });

  it('should be created', inject([AppSimulationService], (service: AppSimulationService) => {
    expect(service).toBeTruthy();
  }));
});
