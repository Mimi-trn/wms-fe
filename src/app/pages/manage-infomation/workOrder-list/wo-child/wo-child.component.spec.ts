/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { WoChildComponent } from './wo-child.component';

describe('WoChildComponent', () => {
  let component: WoChildComponent;
  let fixture: ComponentFixture<WoChildComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WoChildComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WoChildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
