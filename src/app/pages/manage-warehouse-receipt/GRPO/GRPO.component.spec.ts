/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { GRPOComponent } from './GRPO.component';

describe('GRPOComponent', () => {
  let component: GRPOComponent;
  let fixture: ComponentFixture<GRPOComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GRPOComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GRPOComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
