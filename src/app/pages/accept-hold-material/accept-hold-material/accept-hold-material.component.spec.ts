import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceptHoldMaterialComponent } from './accept-hold-material.component';

describe('AcceptHoldMaterialComponent', () => {
  let component: AcceptHoldMaterialComponent;
  let fixture: ComponentFixture<AcceptHoldMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AcceptHoldMaterialComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcceptHoldMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
