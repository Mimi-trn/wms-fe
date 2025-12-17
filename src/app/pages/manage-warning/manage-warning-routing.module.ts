import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WarningConfigurationComponent } from './warning-configuration/warning-configuration.component';
import { ListOfWarningComponent } from './list-of-warning/list-of-warning.component';
import { EmailSendComponent } from './email-send/email-send.component';

const routes: Routes = [
  {
    path: 'warning-configuration',
    component: WarningConfigurationComponent,
  },
  {
    path: 'list-of-warning',
    component: ListOfWarningComponent,
  },
  {
    path: 'email-configuration',
    component: EmailSendComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageWarningRoutingModule {}
