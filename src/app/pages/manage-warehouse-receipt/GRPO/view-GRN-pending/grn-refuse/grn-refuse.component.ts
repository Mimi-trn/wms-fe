import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/services/message.service';
import { ReasonService } from 'src/app/services/reason/reason.service';

@Component({
  selector: 'app-grn-refuse',
  templateUrl: './grn-refuse.component.html',
  styleUrls: ['./grn-refuse.component.css'],
})
export class GrnRefuseComponent implements OnInit {
  @Output() childOut: EventEmitter<any> = new EventEmitter();
  @Input() child: any;
  reason: any = '';
  isVisibleCancel: boolean = false;
  constructor(
    private messageService: MessageService,
    private reasonService: ReasonService,
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
        `Bạn phải nhập lý do từ chối duyệt`,
        `Cảnh báo`
      );
    } else {
      let data = {
        grnCode: this.child,
        content: this.reason,
      };
      let resp = await this.reasonService.postReason(data);
      if (resp.result.responseCode == '00') {
        this.messageService.success(`${resp.result.message}`, `Thành công`);
        this.childOut.emit(false);
        this.router.navigate(['./manage-warehouse-receipt/good-receipt-note']);
      } else {
        this.messageService.error(`${resp.result.message}`, `Lỗi`);
      }
    }
  }
}
