import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { InventoryService } from 'src/app/services/manage-information/inventory-service/inventory.service';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-create-inventory',
  templateUrl: './create-inventory.component.html',
  styleUrls: ['./create-inventory.component.css'],
})
export class CreateInventoryComponent implements OnInit {
  @Output() childOut: EventEmitter<any> = new EventEmitter();

  constructor(
    private inventoryService: InventoryService,
    private messageService: MessageService
  ) {}

  ngOnInit() {}

  onHandleCancel() {
    this.isVisibleCancel = true;
  }

  async onHandleSave() {
    this.data.warehouseName = this.data.warehouseName.trim();
    if (this.data.warehouseName !== '') {
      let resp = await this.inventoryService.postInventory(this.data);
      if (resp.result.responseCode == '00') {
        this.childOut.emit(false);
        this.messageService.success(
          `Thêm mới kho ${this.data.warehouseName} thành công`,
          `Thành công`
        );
      } else {
        this.messageService.warning(
          `Thêm mới kho ${this.data.warehouseName} thất bại`,
          `Thất bại`
        );
      }
    } else {
      this.messageService.warning(
        `Bạn hãy nhập đầy đủ trường dữ liệu`,
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

  isVisibleCancel: boolean = false;
  data: any = {
    warehouseName: '',
    description: '',
  };
}
