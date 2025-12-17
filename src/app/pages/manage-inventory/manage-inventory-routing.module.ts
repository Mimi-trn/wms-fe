import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InventoryDeclarationComponent } from './inventory-declaration/inventory-declaration.component';
import { InventorySheetComponent } from './inventory-sheet/inventory-sheet.component';
import { InventoryRequestComponent } from './inventory-request/inventory-request.component';
import { CreateInventoryRequestComponent } from './inventory-request/create-inventory-request/create-inventory-request.component';
import { ReadInventoryRequestComponent } from './inventory-request/read-inventory-request/read-inventory-request.component';
import { CreateInventorySheetComponent } from './inventory-sheet/create-inventory-sheet/create-inventory-sheet.component';
import { ReadInventorySheetComponent } from './inventory-sheet/read-inventory-sheet/read-inventory-sheet.component';

const routes: Routes = [
  {
    path: 'inventory-declaration',
    component: InventoryDeclarationComponent,
  },
  {
    path: 'inventory-sheet-list-pending',
    component: InventorySheetComponent,
  },
  {
    path: 'new-inventory-sheet-list',
    component: CreateInventorySheetComponent,
  },
  {
    path: 'inventory-sheet-list',
    component: InventorySheetComponent,
  },
  {
    path: 'inventory-sheet-list/:id',
    component: ReadInventorySheetComponent,
  },
  {
    path: 'inventory-request',
    component: InventoryRequestComponent,
  },
  {
    path: 'inventory-request/new',
    component: CreateInventoryRequestComponent,
  },
  {
    path: 'inventory-request/:id',
    component: ReadInventoryRequestComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageInventoryRoutingModule {}
