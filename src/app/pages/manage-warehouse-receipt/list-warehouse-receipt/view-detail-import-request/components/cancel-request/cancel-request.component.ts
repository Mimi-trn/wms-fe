import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ImportRequestService } from 'src/app/services/import-warehouse/import-request/import-request.service';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-cancel-request',
  templateUrl: './cancel-request.component.html',
  styleUrls: ['./cancel-request.component.css'],
})
export class CancelRequestComponent {
  @Input() importRequestCode: string = '';
  @Output() childOut: EventEmitter<any> = new EventEmitter();

  constructor(
    private messageService: MessageService,
    private importRequestService: ImportRequestService,
    private router: Router
  ) {}

  isVisibleCancel: boolean = false;
  reasonCancelRequest: string = '';
  isVisibleConfirm: boolean = false;

  ngOnInit() {}

  onHandleCancel() {
    this.isVisibleCancel = true;
  }

  async onHandOk() {
    if (this.reasonCancelRequest !== '') {
      // let resp = await this.importRequestService.cancelRequest(
      //   this.importRequestCode,
      //   this.reasonCancelRequest
      // );
      let data = {
        importRequestCode: this.importRequestCode,
        grnCode: '',
        exportRequestCode: '',
        gdnCode: '',
        content: this.reasonCancelRequest,
      };
      let resp = await this.importRequestService.revokeImportRequest(data);
      if (resp.result.responseCode == '00') {
        this.childOut.emit(false);
        this.messageService.success(
          `Từ chối yêu cầu nhập kho thành công`,
          `Thành công`
        );
        this.router.navigate([
          './manage-warehouse-receipt/required-receipt-warehouse',
        ]);
      } else {
        this.messageService.warning(
          `Hủy yêu cầu nhập kho thất bại`,
          `Thất bại`
        );
      }
    } else {
      this.messageService.warning(
        `Bạn hãy nhập lý do hủy yêu cầu nhập kho`,
        `Cảnh báo`
      );
    }
  }

  onHandleCancelPopup(event: any) {
    this.isVisibleCancel = event;
  }

  onHandleConfirmPopup(event: any) {
    this.isVisibleCancel = event;
    this.childOut.emit(false);
  }
}
