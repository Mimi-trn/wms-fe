import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AcceptHoldMaterialRoutingModule } from './accept-hold-material-routing.module';
import { AcceptHoldMaterialComponent } from './accept-hold-material/accept-hold-material.component';

@NgModule({
  declarations: [AcceptHoldMaterialComponent],
  imports: [CommonModule, AcceptHoldMaterialRoutingModule],
})
export class AcceptHoldMaterialModule {}
