/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { WoReadComponent } from './wo-read.component';

describe('WoReadComponent', () => {
  let component: WoReadComponent;
  let fixture: ComponentFixture<WoReadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WoReadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WoReadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
