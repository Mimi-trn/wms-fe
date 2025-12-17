import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportReportComponent } from './export_report.component';

describe('BarcodeItemComponent', () => {
    let component: ExportReportComponent;
    let fixture: ComponentFixture<ExportReportComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ExportReportComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ExportReportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
