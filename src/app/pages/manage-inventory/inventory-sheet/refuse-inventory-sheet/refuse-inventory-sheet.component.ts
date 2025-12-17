import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { InventoryService } from 'src/app/services/manage-inventory/inventory.service';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-refuse-inventory-sheet',
  templateUrl: './refuse-inventory-sheet.component.html',
  styleUrls: ['./refuse-inventory-sheet.component.css'],
})
export class RefuseInventorySheetComponent implements OnInit {
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
    console.log(this.child);

    if (!this.reason) {
      this.messageService.warning(
        `Bạn phải nhập lý do thu hồi duyệt`,
        `Cảnh báo`
      );
    } else {
      let dataRequest = {
        id: this.child.id,
        recallReason: null,
        refusalReason: this.reason,
        conclusion: this.child.conclusion,
      };
      let resp = await this.inventoryService.changeStatusInventorySheet(
        dataRequest,
        1
      );
      if (resp.result.responseCode == '00') {
        this.messageService.success(`${resp.result.message}`, `Thành công`);
        this.childOut.emit(false);
        this.router.navigate(['./manage-inventory/inventory-sheet-list']);
      } else {
        this.messageService.error(`${resp.result.message}`, `Lỗi`);
      }
    }
  }
}
