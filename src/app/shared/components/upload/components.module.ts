import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { IconsProviderModule } from '../../../icons-provider.module';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { LoadingComponent } from '../loading/loading.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { EmptyComponent } from '../empty/empty.component';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzFormModule } from 'ng-zorro-antd/form';
import { ButtonComponent } from '../button/button.component';
import { TextavatarComponent } from '../textavatar/textavatar.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { SelectComponent } from '../select/select.component';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { DatePickerComponent } from '../date-picker/date-picker.component';
import { LabelHorizontalComponent } from '../labels/label-horizontal/label-horizontal.component';
import { TranslateModule } from '@ngx-translate/core';
import { PopupDeleteComponent } from '../popup-delete/popup-delete.component';
import { PopupCancelComponent } from '../popup-cancel/popup-cancel.component';
import { UploadFileComponent } from './upload-file/upload-file.component';
import { PopupConfirmComponent } from '../popup-confirm/popup-confirm.component';
import { PopupWithdrawComponent } from '../popup-withdraw/popup-withdraw.component';
import { ModalConfirmComponent } from '../modal-confirm/modal-confirm.component';
import { RadioGroupButtonComponent } from '../radio-group-button/radio-group-button.component';
import { ConfirmDeleteComponent } from '../confirm-delete/confirm-delete.component';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { UploadFileTwoComponent } from './upload-file-two/upload-file-two.component';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { PopupUploadFileComponent } from './popup-upload-file/popup-upload-file.component';

@NgModule({
  declarations: [
    BreadcrumbComponent,
    LoadingComponent,
    EmptyComponent,
    ButtonComponent,
    TextavatarComponent,
    PaginationComponent,
    SelectComponent,
    DatePickerComponent,
    LabelHorizontalComponent,
    PopupDeleteComponent,
    PopupCancelComponent,
    UploadFileComponent,
    PopupConfirmComponent,
    PopupWithdrawComponent,
    ModalConfirmComponent,
    RadioGroupButtonComponent,
    ConfirmDeleteComponent,
    UploadFileTwoComponent,
    PopupUploadFileComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    IconsProviderModule,
    NzSpinModule,
    NzModalModule,
    NzButtonModule,
    NzEmptyModule,
    NzPopoverModule,
    NzPopconfirmModule,
    NzMessageModule,
    NzIconModule,
    NzAvatarModule,
    NzSelectModule,
    FormsModule,
    NzPaginationModule,
    NzFormModule,
    NzDatePickerModule,
    NzInputModule,
    NzToolTipModule,
    NzDividerModule,
    TranslateModule,
    NzRadioModule,
    NzUploadModule,
  ],
  exports: [
    BreadcrumbComponent,
    LoadingComponent,
    EmptyComponent,
    ButtonComponent,
    TextavatarComponent,
    PaginationComponent,
    SelectComponent,
    PopupDeleteComponent,
    PopupCancelComponent,
    UploadFileComponent,
    PopupConfirmComponent,
    PopupWithdrawComponent,
    ModalConfirmComponent,
    RadioGroupButtonComponent,
    ConfirmDeleteComponent,
    UploadFileTwoComponent,
    PopupUploadFileComponent,
  ],
})
export class SharedModule {}
