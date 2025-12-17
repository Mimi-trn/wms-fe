import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpiredMaterialReportComponent } from './expired-material-report.component';

describe('ExpiredMaterialReportComponent', () => {
  let component: ExpiredMaterialReportComponent;
  let fixture: ComponentFixture<ExpiredMaterialReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpiredMaterialReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpiredMaterialReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
