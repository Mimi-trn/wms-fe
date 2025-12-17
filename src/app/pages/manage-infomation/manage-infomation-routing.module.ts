import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { InventoryListComponent } from './inventory-list/inventory-list.component';
import { ListOfPoComponent } from './list-of-po/list-of-po/list-of-po.component';
import { ListOfEmployeeComponent } from './list-of-employee/list-of-employee/list-of-employee.component';
import { CreatePoComponent } from './list-of-po/create-po/create-po.component';
import { ViewPoComponent } from './list-of-po/view-po/view-po.component';
import { ContractListComponent } from './contract-list/contract-list.component';
import { CreateContractComponent } from './contract-list/create-contract/create-contract.component';
import { ReadContractComponent } from './contract-list/read-contract/read-contract.component';
import { SoListComponent } from './so-list/so-list.component';
import { ReadSoComponent } from './so-list/read-so/read-so.component';
import { ListTechFormComponent } from './manage-tech-form/list-tech-form/list-tech-form.component';
import { ViewTechFormComponent } from './manage-tech-form/view-tech-form/view-tech-form.component';

import { WarehouseDiagramComponent } from './warehouse-diagram/warehouse-diagram.component';
import { ListOfGoodsLocationComponent } from './manage-goods-location/list-of-goods-location/list-of-goods-location.component';
import { WoListComponent } from './workOrder-list/wo-list/wo-list.component';
import { VenderListComponent } from './vender-list/vender-list.component';
import { WoReadComponent } from './workOrder-list/wo-read/wo-read.component';
import { CreateProductOnLocationPackageComponent } from './manage-goods-location/create-product-on-location-package/create-product-on-location-package.component';
import { WoCreateComponent } from './workOrder-list/wo-create/wo-create.component';

const routes: Routes = [
  {
    path: 'manage-list-po',
    component: ListOfPoComponent,
  },
  {
    path: 'manage-list-employee',
    component: ListOfEmployeeComponent,
  },
  {
    path: 'manage-list-po/new',
    component: CreatePoComponent,
  },
  {
    path: 'manage-list-po/:id',
    component: ViewPoComponent,
  },
  {
    path: 'manage-inventory-list',
    component: InventoryListComponent,
  },
  {
    path: 'list-contract',
    component: ContractListComponent,
  },
  {
    path: 'list-contract/new',
    component: CreateContractComponent,
  },
  {
    path: 'list-contract/:id',
    component: ReadContractComponent,
  },
  {
    path: 'list-so',
    component: SoListComponent,
  },
  {
    path: 'list-so/:id',
    component: ReadSoComponent,
  },
  {
    path: 'list-tech-form',
    component: ListTechFormComponent,
  },
  {
    path: 'list-tech-form/view-tech-form/:id',
    component: ViewTechFormComponent,
  },
  {
    path: 'warehouse-diagram',
    component: WarehouseDiagramComponent,
  },
  {
    path: 'manage-goods-location',
    component: ListOfGoodsLocationComponent,
  },
  {
    path: 'manage-goods-location/new',
    component: CreateProductOnLocationPackageComponent,
  },
  {
    path: 'list-wo',
    component: WoListComponent,
  },
  {
    path: 'list-vender',
    component: VenderListComponent,
  },
  {
    path: 'list-wo/:id',
    component: WoReadComponent,
  },
  {
    path: 'create',
    component: WoCreateComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageInfomationRoutingModule { }
