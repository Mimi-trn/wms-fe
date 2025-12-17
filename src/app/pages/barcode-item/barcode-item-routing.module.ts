import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BarcodeItemComponent } from './barcode-item/barcode-item.component';

const routes: Routes = [
  {
    path: '',
    component: BarcodeItemComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BarcodeItemRoutingModule {}
