import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ReceiptCommonService } from 'src/app/services/import-warehouse/common/receipt-common.service';
import { MessageService } from 'src/app/services/message.service';
import { WarehouseDiagramService } from 'src/app/services/warehouse-diagram/warehouse-diagram.service';

@Component({
  selector: 'app-create-location',
  templateUrl: './create-location.component.html',
  styleUrls: ['./create-location.component.css'],
})
export class CreateLocationComponent implements OnInit {
  constructor(
    private commonReceiptService: ReceiptCommonService,
    private warehouseDiagramService: WarehouseDiagramService,
    private messageService: MessageService
  ) {}

  @Input() isVisible!: boolean;

  @Output() isVisibleChange: EventEmitter<boolean> = new EventEmitter();
  @Output() isSuccess: EventEmitter<boolean> = new EventEmitter();

  // Dữ liệu location
  locationData: any = {
    parent: 0,
  };
  // Danh sách kho
  warehouseList: any = [];
  // Ẩn hiện popup confirm
  isVisiblePopup: boolean = false;

  ngOnInit() {
    this.commonReceiptService.getWarehouse().then((response) => {
      this.warehouseList = response.data;
    });
  }

  handleCancel() {
    this.locationData = { parent: 0 };
    this.isVisible = false;
    this.isVisibleChange.emit(false);
  }

  createLocation() {
    if (
      !this.locationData.locationName ||
      !this.locationData.warehouseCode ||
      this.locationData.warehouseCode.length == 0
    ) {
      this.messageService.error('Hãy nhập đầy đủ thông tin', 'Lỗi');
    } else {
      console.log('locationData', this.locationData);
      this.warehouseDiagramService
        .createNewLocation(this.locationData)
        .then((response) => {
          if (response.result.responseCode == '00') {
            this.locationData = { parent: 0 };
            this.handleCancel();
            this.isSuccess.emit(true);
            this.messageService.success(
              'Thêm mới vị trí thành công',
              'Thành công'
            );
          } else {
            this.isSuccess.emit(false);
            this.messageService.error(response.result.message, 'Lỗi');
          }
        });
    }
  }
}
