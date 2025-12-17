import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddWarehouseTransferComponent } from './add-warehouse-transfer/add-warehouse-transfer.component';
import { CreateWarehouseTransferComponent } from './create-warehouse-transfer/create-warehouse-transfer.component';
import { ListWarehouseTransferComponent } from './list-warehouse-transfer/list-warehouse-transfer.component';
import { WarehouseTransferDetailComponent } from './warehouse-transfer-detail/warehouse-transfer-detail.component';
import { ListWarehouseTransferNoteComponent } from './list-warehouse-transfer-note/list-warehouse-transfer-note.component';
import { WarehouseTransferNoteDetailComponent } from './warehouse-transfer-note-detail/warehouse-transfer-note-detail.component';

const routes: Routes = [
  {
    path: 'list-warehouse-transfer/add-warehouse-transfer',
    component: AddWarehouseTransferComponent,
  },
  {
    path: 'create-warehouse-transfer',
    component: CreateWarehouseTransferComponent,
  },
  {
    path: 'list-warehouse-transfer',
    component: ListWarehouseTransferComponent,
  },
  {
    path: 'list-warehouse-transfer/warehouse-transfer-detail/:id',
    component: WarehouseTransferDetailComponent,
  },
  {
    path: 'list-warehouse-transfer-note',
    component: ListWarehouseTransferNoteComponent,
  },
  {
    path: 'list-warehouse-transfer-note/warehouse-transfer-note-detail/:id',
    component: WarehouseTransferNoteDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WarehouseTransferRoutingModule {}
