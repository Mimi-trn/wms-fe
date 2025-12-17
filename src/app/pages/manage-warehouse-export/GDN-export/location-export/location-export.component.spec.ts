/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { LocationExportComponent } from './location-export.component';

describe('LocationExportComponent', () => {
  let component: LocationExportComponent;
  let fixture: ComponentFixture<LocationExportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocationExportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
