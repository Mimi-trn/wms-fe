import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// routing module
import { ManageInfomationRoutingModule } from './manage-infomation-routing.module';
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

import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/components/upload/components.module';

import { InventoryListComponent } from './inventory-list/inventory-list.component';
import { CreateInventoryComponent } from './inventory-list/create-inventory/create-inventory.component';
import { ListOfPoComponent } from './list-of-po/list-of-po/list-of-po.component';
import { ListOfEmployeeComponent } from './list-of-employee/list-of-employee/list-of-employee.component';
import { CreatePoComponent } from './list-of-po/create-po/create-po.component';
import { ViewPoComponent } from './list-of-po/view-po/view-po.component';
import { FilterPOPipe } from './list-of-po/filterPO.pipe';

import { FilterItemsPipe } from './list-of-po/create-po/filter-items.pipe';
import { ContractListComponent } from './contract-list/contract-list.component';
import { CreateContractComponent } from './contract-list/create-contract/create-contract.component';
import { ReadContractComponent } from './contract-list/read-contract/read-contract.component';
import { FilterItemInContractPipe } from './contract-list/filter-item-in-contract/FilterItemInContract.pipe';
import { SoListComponent } from './so-list/so-list.component';
import { ReadSoComponent } from './so-list/read-so/read-so.component';
import { ListTechFormComponent } from './manage-tech-form/list-tech-form/list-tech-form.component';
import { ViewTechFormComponent } from './manage-tech-form/view-tech-form/view-tech-form.component';
import { CancelRequestComponent } from '../manage-warehouse-receipt/list-warehouse-receipt/view-detail-import-request/components/cancel-request/cancel-request.component';
import { FilterProductSoPipe } from './so-list/filter-product-so.pipe';

import { WarehouseDiagramComponent } from './warehouse-diagram/warehouse-diagram.component';
import { LocationComponent } from './warehouse-diagram/components/location/location.component';
import { CreateLocationComponent } from './warehouse-diagram/components/create-location/create-location.component';
import { PopupFocusOutComponent } from './warehouse-diagram/components/popup-focus-out/popup-focus-out.component';
import { ListOfGoodsLocationComponent } from './manage-goods-location/list-of-goods-location/list-of-goods-location.component';
import { WoListComponent } from './workOrder-list/wo-list/wo-list.component';
import { VenderListComponent } from './vender-list/vender-list.component';
import { WoReadComponent } from './workOrder-list/wo-read/wo-read.component';
import { WoChildComponent } from './workOrder-list/wo-child/wo-child.component';
import { FilterListItemPipe } from './list-of-po/create-po/filterListItem.pipe';
import { CreateProductOnLocationPackageComponent } from './manage-goods-location/create-product-on-location-package/create-product-on-location-package.component';
import { MapLocationProductComponent } from './warehouse-diagram/components/map-location-product/map-location-product.component';
import { WoCreateComponent } from './workOrder-list/wo-create/wo-create.component';

@NgModule({
  declarations: [
    InventoryListComponent,
    CreateInventoryComponent,
    ListOfPoComponent,
    ListOfEmployeeComponent,
    CreatePoComponent,
    ViewPoComponent,
    FilterPOPipe,
    FilterItemsPipe,
    FilterListItemPipe,
    ContractListComponent,
    FilterItemInContractPipe,
    CreateContractComponent,
    ReadContractComponent,
    SoListComponent,
    ReadSoComponent,
    ListTechFormComponent,
    ViewTechFormComponent,
    FilterProductSoPipe,
    WarehouseDiagramComponent,
    LocationComponent,
    CreateLocationComponent,
    PopupFocusOutComponent,
    ListOfGoodsLocationComponent,
    CreateProductOnLocationPackageComponent,
    WoListComponent,
    VenderListComponent,
    WoReadComponent,
    WoChildComponent,
    MapLocationProductComponent,
    WoCreateComponent,
  ],
  imports: [
    CommonModule,
    ManageInfomationRoutingModule,
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
    // another module
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
  ],
})
export class ManageInfomationModule { }
