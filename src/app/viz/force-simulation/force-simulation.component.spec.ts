import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForceSimulationComponent } from './force-simulation.component';

describe('ForceSimulationComponent', () => {
  let component: ForceSimulationComponent;
  let fixture: ComponentFixture<ForceSimulationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForceSimulationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForceSimulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
