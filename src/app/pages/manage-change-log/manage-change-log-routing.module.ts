import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChangeLogComponent } from './change-log/change-log.component';
import { InfoChangeLogComponent } from './info-change-log/info-change-log.component';

const routes: Routes = [
  {
    path: 'change-log',
    component: ChangeLogComponent,
  },
  {
    path: 'info-change-log',
    component: InfoChangeLogComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageChangeLogRoutingModule { }
