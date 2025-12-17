import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: './' },
  {
    path: 'welcome',
    loadChildren: () =>
      import('./pages/welcome/welcome.module').then((m) => m.WelcomeModule),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./pages/dashboard/dashboard.module').then(
        (m) => m.DashboardModule
      ),
  },
  {
    path: 'manage-info',
    loadChildren: () =>
      import('./pages/manage-infomation/manage-infomation.module').then(
        (m) => m.ManageInfomationModule
      ),
  },
  {
    path: 'manage-storage',
    loadChildren: () =>
      import('./pages/storage-warehouse/storage-warehouse.module').then(
        (m) => m.StorageWarehouseModule
      ),
  },
  {
    path: 'manage-warehouse-receipt',
    loadChildren: () =>
      import(
        './pages/manage-warehouse-receipt/manage-warehouse-receipt.module'
      ).then((m) => m.ManageWarehouseReceiptModule),
  },
  {
    path: 'export',
    loadChildren: () =>
      import(
        './pages/manage-warehouse-export/manage-warehouse-export.module'
      ).then((m) => m.ManageWarehouseExportModule),
  },
  {
    path: '',
    loadChildren: () =>
      import('./shared/exception/exception.module').then(
        (m) => m.ExceptionModule
      ),
  },
  {
    path: 'notify',
    loadChildren: () =>
      import('./pages/notify/notify.module').then((m) => m.NotifyModule),
  },
  {
    path: 'manage-inventory',
    loadChildren: () =>
      import('./pages/manage-inventory/manage-inventory.module').then(
        (m) => m.ManageInventoryModule
      ),
  },
  {
    path: 'manage-stock',
    loadChildren: () =>
      import('./pages/manage-stock/manage-stock.module').then(
        (m) => m.ManageStockModule
      ),
  },
  {
    path: 'accept-hold-material',
    loadChildren: () =>
      import('./pages/accept-hold-material/accept-hold-material.module').then(
        (m) => m.AcceptHoldMaterialModule
      ),
  },
  {
    path: 'barcode-item',
    loadChildren: () =>
      import('./pages/barcode-item/barcode-item.module').then(
        (m) => m.BarcodeItemModule
      ),
  },
  {
    path: 'manage-warning',
    loadChildren: () =>
      import('./pages/manage-warning/manage-warning.module').then(
        (m) => m.ManageWarningModule
      ),
  },
  {
    path: 'statistic',
    loadChildren: () =>
      import('./pages/statistic/statistic.module').then(
        (m) => m.StatisticModule
      ),
  },
  {
    path: 'log',
    loadChildren: () =>
      import('./pages/manage-change-log/manage-change-log.module').then(
        (m) => m.ManageChangeLogModule
      ),
  },
  {
    path: 'warehouse-transfer',
    loadChildren: () =>
      import('./pages/warehouse-transfer/warehouse-transfer.module').then(
        (m) => m.WarehouseTransferModule
      ),
  },
  {
    path: 'export_report',
    loadChildren: () =>
      import('./pages/export_report/export_report.module').then(
        (m) => m.ExportReportModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
