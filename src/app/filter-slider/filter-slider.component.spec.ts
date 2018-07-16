import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterSliderComponent } from './filter-slider.component';

describe('FilterSliderComponent', () => {
  let component: FilterSliderComponent;
  let fixture: ComponentFixture<FilterSliderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterSliderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
