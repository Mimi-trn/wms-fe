import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// routing module
import { ManageWarehouseReceiptRoutingModule } from './manage-warehouse-receipt-routing.module';
// ng-zorro
import { NzAffixModule } from 'ng-zorro-antd/affix';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzAnchorModule } from 'ng-zorro-antd/anchor';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBackTopModule } from 'ng-zorro-antd/back-top';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzCascaderModule } from 'ng-zorro-antd/cascader';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzCommentModule } from 'ng-zorro-antd/comment';
import { NzNoAnimationModule } from 'ng-zorro-antd/core/no-animation';
import { NzTransButtonModule } from 'ng-zorro-antd/core/trans-button';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzI18nModule } from 'ng-zorro-antd/i18n';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzMentionModule } from 'ng-zorro-antd/mention';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTransferModule } from 'ng-zorro-antd/transfer';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzTreeViewModule } from 'ng-zorro-antd/tree-view';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzResizableModule } from 'ng-zorro-antd/resizable';
import { NzPipesModule } from 'ng-zorro-antd/pipes';
import { NzQRCodeModule } from 'ng-zorro-antd/qr-code';
import { NzWaterMarkModule } from 'ng-zorro-antd/water-mark';
// component
import { ListWarehouseReceiptComponent } from './list-warehouse-receipt/list-warehouse-receipt.component';
import { GRPOComponent } from './GRPO/GRPO.component';
import { SharedModule } from 'src/app/shared/components/upload/components.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterPipe } from './list-warehouse-receipt/filter/filter.pipe';
import { CreateGRNComponent } from './GRPO/create-GRN/create-GRN.component';
import { ViewGRNPendingComponent } from './GRPO/view-GRN-pending/view-GRN-pending.component';

import { ViewDetailImportRequestComponent } from './list-warehouse-receipt/view-detail-import-request/view-detail-import-request.component';
import { CancelRequestComponent } from './list-warehouse-receipt/view-detail-import-request/components/cancel-request/cancel-request.component';
import { FilterListItemGRNPipe } from './GRPO/filter-list-item-grn/filterListItemGRN.pipe';
import { GrnRefuseComponent } from './GRPO/view-GRN-pending/grn-refuse/grn-refuse.component';

import { GrnRevokeComponent } from './GRPO/view-GRN-pending/grn-revoke/grn-revoke.component';
import { FilterLIstImportRequestCodePipe } from './GRPO/create-GRN/filterLIstImportRequestCode.pipe';
import { HandleIqcFailComponent } from './handle-iqc-fail/handle-iqc-fail.component';
import { ViewHandleIqcFailComponent } from './handle-iqc-fail/view-handle-iqc-fail/view-handle-iqc-fail.component';
import { ListOfIqcComponent } from './handle-iqc-fail/list-of-iqc/list-of-iqc.component';
import { CreateRequestIqcComponent } from './handle-iqc-fail/create-request-iqc/create-request-iqc.component';
import { ViewRequestIqcComponent } from './handle-iqc-fail/view-request-iqc/view-request-iqc.component';
import { FilterPOPipe } from './handle-iqc-fail/create-request-iqc/filterPO.pipe';
import { FilterEmployeePipe } from './GRPO/create-GRN/filterEmployee.pipe';
import { ConfigGRNComponent } from './GRPO/config-GRN/config-GRN.component';
import { ReadGrnPackageComponent } from './GRPO/view-GRN-pending/read-grn-package/read-grn-package.component';
import { ReadPackageComponent } from './GRPO/view-GRN-pending/read-package/read-package.component';
import { CreatePackageComponent } from './GRPO/view-GRN-pending/create-package/create-package.component';
import { ListLocationComponent } from './GRPO/view-GRN-pending/list-location/list-location.component';
import { CreateLocationComponent } from './GRPO/view-GRN-pending/create-location/create-location.component';
import { CreateImportRequestComponent } from './list-warehouse-receipt/create-import-request/create-import-request.component';
import { UploadReportDataComponent } from './list-warehouse-receipt/create-import-request/upload-report-data/upload-report-data.component';

@NgModule({
  declarations: [
    ListWarehouseReceiptComponent,
    GRPOComponent,
    FilterListItemGRNPipe,
    CreateGRNComponent,
    ViewGRNPendingComponent,
    GrnRefuseComponent,
    GrnRevokeComponent,
    FilterPipe,
    ViewDetailImportRequestComponent,
    CancelRequestComponent,
    FilterLIstImportRequestCodePipe,
    HandleIqcFailComponent,
    ViewHandleIqcFailComponent,
    ListOfIqcComponent,
    CreateRequestIqcComponent,
    ViewRequestIqcComponent,
    FilterPOPipe,
    FilterEmployeePipe,
    ConfigGRNComponent,
    ReadGrnPackageComponent,
    ReadPackageComponent,
    CreatePackageComponent,
    ListLocationComponent,
    CreateLocationComponent,
    CreateImportRequestComponent,
    UploadReportDataComponent,
  ],
  imports: [
    CommonModule,
    ManageWarehouseReceiptRoutingModule,
    // ng-zorro
    NzAffixModule,
    NzAlertModule,
    NzAnchorModule,
    NzAutocompleteModule,
    NzAvatarModule,
    NzBackTopModule,
    NzBadgeModule,
    NzButtonModule,
    NzBreadCrumbModule,
    NzCalendarModule,
    NzCardModule,
    NzCarouselModule,
    NzCascaderModule,
    NzCheckboxModule,
    NzCollapseModule,
    NzCommentModule,
    NzDatePickerModule,
    NzDescriptionsModule,
    NzDividerModule,
    NzDrawerModule,
    NzDropDownModule,
    NzEmptyModule,
    NzFormModule,
    NzGridModule,
    NzI18nModule,
    NzIconModule,
    NzImageModule,
    NzInputModule,
    NzInputNumberModule,
    NzLayoutModule,
    NzListModule,
    NzMentionModule,
    NzMenuModule,
    NzMessageModule,
    NzModalModule,
    NzNoAnimationModule,
    NzNotificationModule,
    NzPageHeaderModule,
    NzPaginationModule,
    NzPopconfirmModule,
    NzPopoverModule,
    NzProgressModule,
    NzRadioModule,
    NzRateModule,
    NzResultModule,
    NzSegmentedModule,
    NzSelectModule,
    NzSkeletonModule,
    NzSliderModule,
    NzSpaceModule,
    NzSpinModule,
    NzStatisticModule,
    NzStepsModule,
    NzSwitchModule,
    NzTableModule,
    NzTabsModule,
    NzTagModule,
    NzTimePickerModule,
    NzTimelineModule,
    NzToolTipModule,
    NzTransButtonModule,
    NzTransferModule,
    NzTreeModule,
    NzTreeViewModule,
    NzTreeSelectModule,
    NzTypographyModule,
    NzUploadModule,
    NzWaveModule,
    NzResizableModule,
    NzPipesModule,
    NzQRCodeModule,
    NzWaterMarkModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
  ],
})
export class ManageWarehouseReceiptModule {}
