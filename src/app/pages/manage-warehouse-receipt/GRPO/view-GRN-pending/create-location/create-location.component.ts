import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BarcodeItemService } from 'src/app/services/barcode-item/barcode-item.service';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-create-location',
  templateUrl: './create-location.component.html',
  styleUrls: ['./create-location.component.css'],
})
export class CreateLocationComponent implements OnInit {
  @Input() product: any = {};
  @Output() childOut: EventEmitter<any> = new EventEmitter();
  constructor(
    private qrService: BarcodeItemService,
    private messageService: MessageService
  ) {}

  dataInformation: any = {};
  datas: any[] = [];
  listWarehouse: any[] = [];
  listItemQuantity: any[] = [];
  listLocation: any[] = [];
  i = 0;
  dataFilter: any = {};
  dataFilterLocation: any = {};
  visibleLocation: boolean = false;
  locationWarehouseId: any = '';
  pageLocation: number = 1;
  perPageLocation: number = 10;
  totalLocation: number = 0;
  ngOnInit() {
    this.dataInformation = {
      ...this.product,
      expiredDate: new Date(this.product.expiredDate),
    };
    this.getWarehouse();
    this.getPackage();
    this.onHandleCreateNewLocation();
  }

  async getWarehouse() {
    let data = {
      pageIndex: 0,
      pageSize: 0,
      common: '',
      sortProperty: 'updatedAt',
      sortOrder: 'DESC',
      filter: {
        description: null,
        locationCode: null,
        locationName: null,
        isLocked: null,
        hasChild: null,
        parent: 0,
        storeId: null,
      },
    };
    let resp = await this.qrService.getWarehouseInLocation(data);
    if (resp.result.responseCode == '00') {
      this.listWarehouse = resp.data;
    } else {
      this.messageService.error(`${resp.result.message}`, ` Lỗi`);
    }
  }

  async getLocation() {
    let data = {
      pageIndex: this.pageLocation - 1,
      pageSize: this.perPageLocation,
      common: '',
      sortProperty: 'updatedAt',
      sortOrder: 'DESC',
      filter: {
        description: this.dataFilterLocation.description,
        locationCode: this.dataFilterLocation.locationCode,
        locationName: null,
        isLocked: null,
        hasChild: false,
        parent: null,
        storeId: this.locationWarehouseId,
      },
    };
    let resp = await this.qrService.getLocationInCreateNewLocation(data);
    if (resp.result.responseCode == '00') {
      this.listLocation = resp.data;
      this.totalLocation = resp.dataCount;
    } else {
      this.messageService.error(`${resp.result.message}`, ` Lỗi`);
    }
  }

  async getPackage() {
    let data = {
      pageIndex: 0,
      pageSize: 0,
      filter: {
        id: '',
        productCode: this.product.productCode,
        itemName: '',
        description: '',
        uom: '',
        grnCode: this.product.grnCode,
        quantity: '',
        locationId: '',
        locationName: '',
      },
      common: '',
      sortProperty: '',
      sortOrder: '',
    };
    let resp = await this.qrService.getListQR(data);
    if (resp.result.responseCode == '00') {
      this.listItemQuantity = resp.data;
    } else {
      this.messageService.error(`${resp.result.message}`, ` Lỗi`);
    }
  }

  deleteRecord(row: any) {
    this.datas = this.datas.filter((d) => d.count !== row.count);
  }

  onHandleChangeWarehouse() {}

  onHandleChangeWarehouseInRow(event: any, row: any) {
    console.log(event);

    if (event !== null) {
      row.locationWarehouseId = event;
    } else {
      row.locationWarehouseId = '';
      this.listLocation = [];
      this.totalLocation = 0;
      row.locationCode = '';
    }
  }

  onHandleChangeItemQuantity(row: any) {
    const object = this.listItemQuantity.find(
      (obj) => obj.id === row.packageId
    );
    row.totalQuantity = object.itemQuantity * row.packageQuantity;
    this.calculateTotalTotalQuantity();
  }

  onHandleChangePackageQuantity(event: any, row: any) {
    const object = this.listItemQuantity.find(
      (obj) => obj.id === row.packageId
    );
    row.totalQuantity = object.itemQuantity * row.packageQuantity;
    this.calculateTotalTotalQuantity();
  }

  onHandleCancel() {
    this.childOut.emit(false);
  }

  async onHandleAddNew() {
    let checkLocationWarehouseId = true;
    let checkLocationId = true;
    let checkPackageId = true;
    let checkPackageQuantity = true;

    this.datas.forEach((element) => {
      if (!element.locationWarehouseId) {
        checkLocationWarehouseId = false;
        this.messageService.warning(`Kho không được để trống`, ` Cảnh báo`);
      }
      if (!element.locationId) {
        checkLocationId = false;
        this.messageService.warning(
          `Mã vị trí không được để trống`,
          ` Cảnh báo`
        );
      }
      if (!element.packageId) {
        checkPackageId = false;
        this.messageService.warning(
          `Số lượng hàng mỗi kiện không được để trống`,
          ` Cảnh báo`
        );
      }
      if (!element.packageQuantity) {
        checkPackageQuantity = false;
        this.messageService.warning(
          `Số lượng kiện hàng không được để trống`,
          ` Cảnh báo`
        );
      }
    });

    if (
      checkLocationId &&
      checkLocationWarehouseId &&
      checkPackageId &&
      checkPackageQuantity
    ) {
      let resp = await this.qrService.createLocation(this.datas);
      if (resp.result.responseCode == '00') {
        this.messageService.success(`${resp.result.message}`, ` Thành công`);
        this.childOut.emit(false);
      } else {
        this.messageService.error(`${resp.result.message}`, ` Lỗi`);
      }
    } else {
      return;
    }
  }

  onHandleCreateNewLocation() {
    this.datas = [
      ...this.datas,
      { count: `${this.i}`, totalQuantity: 0, packageQuantity: 0 },
    ];
    this.i++;
  }

  paginationLocation(event: any) {
    this.pageLocation = event.page;
    this.perPageLocation = event.size;
    this.getLocation();
  }

  onHandleChooseLocation(row: any, rowLocation: any) {
    row.locationName = rowLocation.locationName;
    row.locationCode = rowLocation.locationCode;
    row.locationId = rowLocation.id;
    row.visible = false;
  }

  changeLocation(event: any, row: any) {
    row.visible = event;
  }

  onHandleOpenLocation(row: any) {
    row.visible = true;
    this.locationWarehouseId = row.locationWarehouseId;
    if (this.locationWarehouseId) {
      this.getLocation();
    }
  }

  countTotalQuantity: number = 0;
  calculateTotalTotalQuantity() {
    this.countTotalQuantity = this.datas.reduce(
      (sum, item) => sum + parseFloat(item.totalQuantity),
      0
    );
  }

  searchLocation(row: any) {
    this.locationWarehouseId = row.locationWarehouseId;
    if (this.locationWarehouseId) this.getLocation();
  }

  enterSearchLocation($event: any, row: any) {
    this.locationWarehouseId = row.locationWarehouseId;
    if ($event.keyCode == 13) {
      if (this.locationWarehouseId) this.getLocation();
    }
  }
}
