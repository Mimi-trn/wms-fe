import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListWarehouseReceiptComponent } from './list-warehouse-receipt/list-warehouse-receipt.component';
import { GRPOComponent } from './GRPO/GRPO.component';
import { CreateGRNComponent } from './GRPO/create-GRN/create-GRN.component';
import { ViewGRNPendingComponent } from './GRPO/view-GRN-pending/view-GRN-pending.component';
import { ViewDetailImportRequestComponent } from './list-warehouse-receipt/view-detail-import-request/view-detail-import-request.component';
import { HandleIqcFailComponent } from './handle-iqc-fail/handle-iqc-fail.component';
import { ViewHandleIqcFailComponent } from './handle-iqc-fail/view-handle-iqc-fail/view-handle-iqc-fail.component';
import { CreateRequestIqcComponent } from './handle-iqc-fail/create-request-iqc/create-request-iqc.component';
import { ListOfIqcComponent } from './handle-iqc-fail/list-of-iqc/list-of-iqc.component';
import { ViewRequestIqcComponent } from './handle-iqc-fail/view-request-iqc/view-request-iqc.component';
import { ConfigGRNComponent } from './GRPO/config-GRN/config-GRN.component';
import { CreateImportRequestComponent } from './list-warehouse-receipt/create-import-request/create-import-request.component';

const routes: Routes = [
  {
    path: 'required-receipt-warehouse',
    component: ListWarehouseReceiptComponent,
  },
  {
    path: 'required-receipt-warehouse/create',
    component: CreateImportRequestComponent,
  },
  {
    path: 'required-receipt-warehouse/view-detail-import-request/:id',
    component: ViewDetailImportRequestComponent,
  },
  {
    path: 'good-receipt-note',
    component: GRPOComponent,
  },
  {
    path: 'good-receipt-note-pending',
    component: GRPOComponent,
  },
  {
    path: 'create-good-receipt-note',
    component: CreateGRNComponent,
  },
  {
    path: 'good-receipt-note/view-GRN/:id',
    component: ViewGRNPendingComponent,
  },
  {
    path: 'good-receipt-note/view-GRN/:id/config',
    component: ConfigGRNComponent,
  },
  {
    path: 'handle-iqc-failed',
    component: HandleIqcFailComponent,
  },
  {
    path: 'handle-iqc-failed/view-handle-iqc-failed/:id',
    component: ViewHandleIqcFailComponent,
  },
  {
    path: 'create-iqc-request',
    component: CreateRequestIqcComponent,
  },
  {
    path: 'list-of-iqc',
    component: ListOfIqcComponent,
  },
  {
    path: 'list-of-iqc/view-request-iqc/:id',
    component: ViewRequestIqcComponent,
  },
  // {
  //   path: 'good-receipt-note/view-GRN-approved/:id',
  //   component: ViewGRNApprovedComponent,
  // },
  // {
  //   path: 'good-receipt-note/view-GRN-refuse/:id',
  //   component: ViewGRNRefuseComponent,
  // },
  // {
  //   path: 'good-receipt-note/view-GRN-drag/:id',
  //   component: ViewGrnDragComponent,
  // },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageWarehouseReceiptRoutingModule {}
