import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StorageWarehouseComponent } from './storage-warehouse/storage-warehouse.component';
import {PickingWarehouseComponent} from "./picking-warehouse/picking-warehouse.component";

const routes: Routes = [
  {
    path: 'storage',
    component: StorageWarehouseComponent
  },{
    path: 'picking',
    component: PickingWarehouseComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StorageWarehouseRoutingModule { }
