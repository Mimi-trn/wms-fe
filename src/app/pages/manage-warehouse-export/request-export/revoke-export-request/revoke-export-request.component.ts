import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/export-warehouse/commonService.service';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-revoke-export-request',
  templateUrl: './revoke-export-request.component.html',
  styleUrls: ['./revoke-export-request.component.css'],
})
export class RevokeExportRequestComponent implements OnInit {
  @Output() childOut: EventEmitter<any> = new EventEmitter();
  @Input() child: any;
  reason: any = '';
  isVisibleCancel: boolean = false;
  constructor(
    private messageService: MessageService,
    private reasonService: CommonService,
    private router: Router
  ) {}

  ngOnInit() {}

  cancel() {
    this.isVisibleCancel = true;
  }

  onHandleCancelPopup(event: any) {
    this.isVisibleCancel = event;
  }

  onHandleConfirmPopup(event: any) {
    this.isVisibleCancel = event;
    this.childOut.emit(false);
  }

  async confirm() {
    if (!this.reason) {
      this.messageService.warning(
        `Bạn phải nhập lý do thu hồi`,
        `Cảnh báo`
      );
    } else {
      let resp = await this.reasonService.createRevokeExportRequest(
        this.child,
        this.reason
      );
      if (resp.result.responseCode == '00') {
        this.messageService.success(`${resp.result.message}`, `Thành công`);
        this.router.navigate(['./export/list-request-export']);
        this.childOut.emit(false);
      } else {
        this.messageService.error(`${resp.result.message}`, `Lỗi`);
      }
    }
  }
}
