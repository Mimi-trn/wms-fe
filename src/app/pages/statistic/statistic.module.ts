import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StatisticRoutingModule } from './statistic-routing.module';
import { InventoryReportComponent } from './inventory-report/inventory-report.component';
import { ExpiredMaterialReportComponent } from './expired-material-report/expired-material-report.component';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { TranslateModule } from '@ngx-translate/core';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    InventoryReportComponent,
    ExpiredMaterialReportComponent
  ],
  imports: [
    FormsModule,
    NzInputModule,
    TranslateModule,
    NzGridModule,
    NzDatePickerModule,
    CommonModule,
    StatisticRoutingModule
  ]
})
export class StatisticModule { }
