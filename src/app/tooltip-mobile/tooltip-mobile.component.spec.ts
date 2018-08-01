import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TooltipMobileComponent } from './tooltip-mobile.component';

describe('TooltipMobileComponent', () => {
  let component: TooltipMobileComponent;
  let fixture: ComponentFixture<TooltipMobileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TooltipMobileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TooltipMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
