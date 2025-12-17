/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SoListComponent } from './so-list.component';

describe('SoListComponent', () => {
  let component: SoListComponent;
  let fixture: ComponentFixture<SoListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SoListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
