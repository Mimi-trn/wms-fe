/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ReadGDNComponent } from './read-GDN.component';

describe('ReadGDNComponent', () => {
  let component: ReadGDNComponent;
  let fixture: ComponentFixture<ReadGDNComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReadGDNComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadGDNComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
