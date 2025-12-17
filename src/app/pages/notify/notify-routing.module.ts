import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotifyCommonComponent } from './notify-common/notify-common.component';

const routes: Routes = [
  {
    path: '',
    component: NotifyCommonComponent,
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotifyRoutingModule {}
