import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColourLegendButtonComponent } from './colour-legend-button.component';

describe('ColourLegendButtonComponent', () => {
  let component: ColourLegendButtonComponent;
  let fixture: ComponentFixture<ColourLegendButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColourLegendButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColourLegendButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
