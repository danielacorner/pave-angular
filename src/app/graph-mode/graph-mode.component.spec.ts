import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphModeComponent } from './graph-mode.component';

describe('GraphModeComponent', () => {
  let component: GraphModeComponent;
  let fixture: ComponentFixture<GraphModeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GraphModeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GraphModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
