import { TestBed, inject } from '@angular/core/testing';

import { AppFilterService } from './app-filter.service';

describe('AppFilterService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppFilterService]
    });
  });

  it('should be created', inject([AppFilterService], (service: AppFilterService) => {
    expect(service).toBeTruthy();
  }));
});
