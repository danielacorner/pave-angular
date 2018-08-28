import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaticChartComponent } from './static-chart.component';

describe('StaticChartComponent', () => {
  let component: StaticChartComponent;
  let fixture: ComponentFixture<StaticChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaticChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaticChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
