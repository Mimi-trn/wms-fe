import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InventoryReportComponent } from './inventory-report/inventory-report.component';
import { ExpiredMaterialReportComponent } from './expired-material-report/expired-material-report.component';

const routes: Routes = [
  {
    path: 'inventory-report',
    component: InventoryReportComponent,
  },
  {
    path: 'expired-material-report',
    component: ExpiredMaterialReportComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StatisticRoutingModule {}
