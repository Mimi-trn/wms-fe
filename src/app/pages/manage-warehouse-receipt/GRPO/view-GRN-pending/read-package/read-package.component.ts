import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { BarcodeItemService } from 'src/app/services/barcode-item/barcode-item.service';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-read-package',
  templateUrl: './read-package.component.html',
  styleUrls: ['./read-package.component.css'],
})
export class ReadPackageComponent implements OnInit {
  @ViewChild('download', { static: false }) download!: ElementRef;
  @Input() product: any = {};
  @Output() childOut: EventEmitter<any> = new EventEmitter();

  dataInformation: any = {
    expiredDate: new Date(),
    importDate: new Date(),
  };
  uuidQR: string = '';
  listStatus: any[] = [
    {
      text: 'Chưa có vị trí',
      value: 1,
    },
    {
      text: 'Đã có vị trí',
      value: 2,
    },
  ];
  constructor(
    private qrService: BarcodeItemService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.dataInformation = {
      ...this.product.product,
      ...this.product.qrChild,
      status: this.product.qrChild.status,
      expiredDate: new Date(this.product.product.expiredDate),
      importDate: new Date(this.product.product.importDate),
    };
    this.uuidQR = this.product.qrChild.id.toString();
    console.log(this.product);

  }

  onHandleCancel() {
    this.childOut.emit(false);
  }

  onHandlePrint() {
    const canvas = document
      .getElementById('download')
      ?.querySelector<HTMLCanvasElement>('canvas');
    if (canvas) {
      this.download.nativeElement.href = canvas.toDataURL('image/png');
      this.download.nativeElement.download = `QR code`;
      const event = new MouseEvent('click');
      this.download.nativeElement.dispatchEvent(event);
    }
  }

  // async onHandleUpdate() {
  //   if (
  //     !this.dataInformation.itemQuantity ||
  //     !this.dataInformation.packageQuantity
  //   ) {
  //     this.messageService.warning(` Bạn phải nhập đầy đủ dữ liệu`, ` Cảnh báo`);
  //     return;
  //   } else {
  //     let data = {
  //       id: this.product.qrChild.id,
  //       itemQuantity: this.dataInformation.itemQuantity,
  //       packageQuantity: this.dataInformation.packageQuantity,
  //     };
  //     let resp = await this.qrService.updatePackage(data);
  //     if (resp.result.responseCode == '00') {
  //       this.messageService.success(`${resp.result.message}`, ` Thành công`);
  //       this.childOut.emit(false);
  //     } else {
  //       this.messageService.error(`${resp.result.message}`, ` Lỗi`);
  //     }
  //   }
  // }
}
