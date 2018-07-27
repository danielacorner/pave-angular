import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeColoursDropdownComponent } from './change-colours-dropdown.component';

describe('ChangeColoursButtonComponent', () => {
  let component: ChangeColoursDropdownComponent;
  let fixture: ComponentFixture<ChangeColoursDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeColoursDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeColoursDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
