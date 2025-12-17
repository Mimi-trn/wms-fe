import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InventoryAdjustmentComponent } from './inventory-adjustment/inventory-adjustment.component';
import { InventorySituationComponent } from './inventory-situation/inventory-situation.component';
import { LocationStockComponent } from './location-stock/location-stock.component';

const routes: Routes = [
  {
    path: 'inventory-adjustment',
    component: InventoryAdjustmentComponent,
  },
  {
    path: 'inventory-situation',
    component: InventorySituationComponent,
  },
  {
    path: 'inventory-detail',
    component: LocationStockComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageStockRoutingModule {}
