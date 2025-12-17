import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AcceptHoldMaterialComponent } from './accept-hold-material/accept-hold-material.component';

const routes: Routes = [
  {
    path: '',
    component: AcceptHoldMaterialComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AcceptHoldMaterialRoutingModule {}
