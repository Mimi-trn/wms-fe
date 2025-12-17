import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExportReportComponent } from './export_report/export_report.component';
const routes: Routes = [
    {
        path: '',
        component: ExportReportComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})

export class ExportReportRoutingModule { }