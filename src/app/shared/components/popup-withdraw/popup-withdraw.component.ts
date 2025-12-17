import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ImportRequestService } from 'src/app/services/import-warehouse/import-request/import-request.service';
import { MessageService } from 'src/app/services/message.service';
import { ReasonService } from 'src/app/services/reason/reason.service';

@Component({
  selector: 'app-popup-withdraw',
  templateUrl: './popup-withdraw.component.html',
  styleUrls: ['./popup-withdraw.component.css'],
})
export class PopupWithdrawComponent {
  constructor(
    private reasonService: ReasonService,
    private messageService: MessageService,
    private importRequestService: ImportRequestService
  ) {}

  @Input() isVisible: any = '';
  @Input() importRequestCode: string = '';
  @Input() title: string = 'popup.withDraw.title';
  @Input() isAction: string = 'iqc';

  @Output() cancel: EventEmitter<boolean> = new EventEmitter();
  @Output() confirm: EventEmitter<boolean> = new EventEmitter();

  isVisibleCancel: boolean = false;
  reasonWithDrawRequest: string = '';
  isVisiblePopupConfirm: boolean = false;
  data: any = {};

  ngOnInit(): void {
    console.log(this.isAction);

    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
  }

  onCancel() {
    this.isVisible = false;
    this.cancel.emit(false);
  }

  onHandleConfirmPopup(event: any) {
    this.isVisibleCancel = event;
    this.cancel.emit(false);
  }

  onConfirm() {
    if (this.isAction == 'iqc') {
      this.data = {
        importRequestCode: this.importRequestCode,
        type: 2,
        content: this.reasonWithDrawRequest,
      };
      if (this.reasonWithDrawRequest === '' || this.importRequestCode === '') {
        this.messageService.error('Lý do thu hồi không được trống', 'Lỗi');
        this.isVisiblePopupConfirm = false;
      } else {
        this.importRequestService
          .withDrawIqcRequest(this.data)
          .then((response) => {
            if (response.result.responseCode == '00') {
              if (response.result.responseCode == '00') {
                this.messageService.success(
                  'Thu hồi yêu cầu IQC thành công',
                  'Thành công'
                );
                this.isVisible = false;
                this.isVisiblePopupConfirm = false;
                this.cancel.emit(false);
              } else {
                this.messageService.error(
                  'Thu hồi yêu cầu IQC thất bại',
                  'Lỗi'
                );
                this.isVisiblePopupConfirm = false;
              }
            } else {
              this.messageService.success(
                'Thu hồi yêu cầu IQC thất bại',
                'Lỗi'
              );
              this.isVisiblePopupConfirm = false;
            }
          });
      }
    }

    if (this.isAction == 'IR') {
      this.data = {
        importRequestCode: this.importRequestCode,
        content: this.reasonWithDrawRequest,
      };
      if (this.reasonWithDrawRequest === '' || this.importRequestCode === '') {
        this.messageService.error('Lý do thu hồi không được trống', 'Lỗi');
        this.isVisiblePopupConfirm = false;
      } else {
        this.importRequestService.revoke(this.data).then((response) => {
          if (response.result.responseCode == '00') {
            if (response.result.responseCode == '00') {
              this.messageService.success(
                'Thu hồi yêu cầu nhập kho thành công',
                'Thành công'
              );
              this.isVisible = false;
              this.isVisiblePopupConfirm = false;
              this.confirm.emit(true);
              this.cancel.emit(false);
            } else {
              this.messageService.error(
                'Thu hồi yêu cầu nhập kho thất bại',
                'Lỗi'
              );
              this.isVisiblePopupConfirm = false;
            }
          } else {
            this.messageService.success(
              'Thu hồi yêu cầu nhập kho thất bại',
              'Lỗi'
            );
            this.isVisiblePopupConfirm = false;
          }
        });
      }
    }
  }
}
