/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ListGDNComponent } from './list-GDN.component';

describe('ListGDNComponent', () => {
  let component: ListGDNComponent;
  let fixture: ComponentFixture<ListGDNComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListGDNComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListGDNComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
