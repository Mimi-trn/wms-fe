import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListRequestExportComponent } from './request-export/list-request-export/list-request-export.component';
import { ListGDNComponent } from './GDN-export/list-GDN/list-GDN.component';
import { ReadRequestExportComponent } from './request-export/read-request-export/read-request-export.component';
import { CreateRequestExportComponent } from './request-export/create-request-export/create-request-export.component';
import { CreateGDNComponent } from './GDN-export/create-GDN/create-GDN.component';
import { ReadGDNComponent } from './GDN-export/read-GDN/read-GDN.component';
import { ConfigGRNComponent } from '../manage-warehouse-receipt/GRPO/config-GRN/config-GRN.component';
import { ConfigGDNComponent } from './GDN-export/config-gdn/config-gdn.component';

const routes: Routes = [
  {
    path: 'list-request-export',
    component: ListRequestExportComponent,
  },
  {
    path: 'list-request-export/new',
    component: CreateRequestExportComponent,
  },
  {
    path: 'list-request-export/:id',
    component: ReadRequestExportComponent,
  },
  {
    path: 'list-GDN',
    component: ListGDNComponent,
  },
  {
    path: 'list-GDN-pending',
    component: ListGDNComponent,
  },
  {
    path: 'new-GDN',
    component: CreateGDNComponent,
  },
  {
    path: 'list-GDN/:id',
    component: ReadGDNComponent,
  },
  {
    path: 'list-GDN/:id/config',
    component: ConfigGDNComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageWarehouseExportRoutingModule {}
