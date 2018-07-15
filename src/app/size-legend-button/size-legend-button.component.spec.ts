import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SizeLegendButtonComponent } from './size-legend-button.component';

describe('SizeLegendButtonComponent', () => {
  let component: SizeLegendButtonComponent;
  let fixture: ComponentFixture<SizeLegendButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SizeLegendButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SizeLegendButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
