import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BarcodeItemService } from 'src/app/services/barcode-item/barcode-item.service';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-create-package',
  templateUrl: './create-package.component.html',
  styleUrls: ['./create-package.component.css'],
})
export class CreatePackageComponent implements OnInit {
  @Input() product: any = {};
  @Output() childOut: EventEmitter<any> = new EventEmitter();
  dataInformation: any = {
    expiredDate: new Date(),
    importDate: new Date(),
  };
  constructor(
    private qrService: BarcodeItemService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.dataInformation = {
      ...this.product,
      expiredDate: new Date(this.product.expiredDate),
      importDate: new Date(this.product.importDate),
    };
  }

  onHandleCancel() {
    this.childOut.emit(false);
  }

  async onHandleCreate() {
    if (
      !this.dataInformation.itemQuantity ||
      !this.dataInformation.packageQuantity
    ) {
      this.messageService.warning(` Bạn phải nhập đầy đủ dữ liệu`, ` Cảnh báo`);
      return;
    } else {
      let data = {
        itemId: this.dataInformation.id,
        itemQuantity: this.dataInformation.itemQuantity,
        packageQuantity: this.dataInformation.packageQuantity,
        status: 1,
      };
      let resp = await this.qrService.createQR(data);
      if (resp.result.responseCode == '00') {
        this.messageService.success(`${resp.result.message}`, ` Thành công`);
        this.childOut.emit(false);
      } else {
        this.messageService.error(`${resp.result.message}`, ` Lỗi`);
      }
    }
  }
}
