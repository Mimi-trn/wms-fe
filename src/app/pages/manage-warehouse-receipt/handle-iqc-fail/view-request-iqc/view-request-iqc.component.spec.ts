import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRequestIqcComponent } from './view-request-iqc.component';

describe('ViewRequestIqcComponent', () => {
  let component: ViewRequestIqcComponent;
  let fixture: ComponentFixture<ViewRequestIqcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewRequestIqcComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewRequestIqcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
