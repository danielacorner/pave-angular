import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeSizesDropdownComponent } from './change-sizes-dropdown.component';

describe('ChangeSizesDropdownComponent', () => {
  let component: ChangeSizesDropdownComponent;
  let fixture: ComponentFixture<ChangeSizesDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeSizesDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeSizesDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
