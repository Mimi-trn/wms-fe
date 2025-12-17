import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { InventoryService } from 'src/app/services/manage-inventory/inventory.service';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-refusal-inventory-request',
  templateUrl: './refusal-inventory-request.component.html',
  styleUrls: ['./refusal-inventory-request.component.css'],
})
export class RefusalInventoryRequestComponent implements OnInit {
  @Output() childOut: EventEmitter<any> = new EventEmitter();
  @Input() child: any;
  reason: any = '';
  isVisibleCancel: boolean = false;
  constructor(
    private messageService: MessageService,
    private router: Router,
    private inventoryService: InventoryService
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
        `Bạn phải nhập lý do thu hồi duyệt`,
        `Cảnh báo`
      );
    } else {
      let dataRequest = {
        id: this.child.id,
        refusalReason: this.reason,
        recallReason: null,
        content: this.child.content,
      };
      let resp = await this.inventoryService.revokeAndRefuseRequest(
        2,
        dataRequest
      );
      if (resp.result.responseCode == '00') {
        this.messageService.success(`${resp.result.message}`, `Thành công`);
        this.childOut.emit(false);
        this.router.navigate(['./manage-inventory/inventory-request']);
      } else {
        this.messageService.error(`${resp.result.message}`, `Lỗi`);
      }
    }
  }
}
