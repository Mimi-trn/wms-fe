import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { BarcodeItemService } from 'src/app/services/barcode-item/barcode-item.service';
import { CommonService } from 'src/app/services/export-warehouse/commonService.service';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-list-location',
  templateUrl: './list-location.component.html',
  styleUrls: ['./list-location.component.css'],
})
export class ListLocationComponent implements OnInit {
  @Input() productFromParent: any = {};
  @Input() listLocationPackage: any[] = [];
  @Input() isView: boolean = false;
  @Input() productCode: any = '';
  @Output() listLocationPackageChange: EventEmitter<any> = new EventEmitter();
  constructor(
    private messageService: MessageService,
    private barcodeService: BarcodeItemService,
    private translateService: TranslateService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private loading: NgxUiLoaderService,
    private qrService: BarcodeItemService,
    private commonService: CommonService
  ) {}
  // Columns
  columns: Column[] = [];
  allChecked: boolean = true;
  indeterminate: boolean = false;
  // Table
  listUoM: any[] = [];
  listWarehouse: any[] = [];
  datas: any[] = [];
  sortProperty: string = 'updatedAt';
  sortOrder: string = 'descend';
  page: number = 1;
  per_page: number = 10;
  total: number = 0;
  dataFilter: any = {};

  async ngOnInit() {
    // if (!this.isView) {
    //   this.listLocationPackage = [
    //     ...this.listLocationPackage,
    //     {
    //       idLocationPackage: this.idLocationPackage,
    //       packageQuantity: 0,
    //     },
    //   ];
    // }
    // this.getData();
    // this.idLocationPackage++;
    await this.getLocation();
    if (this.listLocationPackage.length > 0) {
      this.idLocationPackage =
        this.listLocationPackage[this.listLocationPackage.length - 1]
          .idLocationPackage + 1;
      this.calculateTotalPackage();
    }
    this.columns = [
      {
        keyTitle: 'sidebar.location.warehouse',
        keyName: 'locationWarehouseName',
        width: '200px',
        check: true,
        sortOrder: '',
      },
      {
        keyTitle: 'sidebar.location.code',
        keyName: 'locationCode',
        width: '200px',
        check: true,
        sortOrder: '',
      },
      {
        keyTitle: 'sidebar.location.name',
        keyName: 'locationName',
        width: '200px',
        check: true,
        sortOrder: '',
      },
      {
        keyTitle: 'sidebar.location.packageQuantity',
        keyName: 'packageQuantity',
        width: '200px',
        check: true,
        sortOrder: '',
      },
    ];
    if (this.listLocationPackage.length == 0 && !this.isView) {
      let newLocationPackage = {
        locationWarehouseName: '',
        locationCode: '',
        locationName: '',
        locationId: '',
      };
      let resp = await this.qrService.getLocationByProduct(this.productCode);
      if (resp?.result?.responseCode == '00') {
        // let locationElement = undefined;
        const locationElement = resp.data
          .map((obj: any) =>
            this.listLocationFromBE.find(
              (item) => item.locationCode === obj?.locationCode
            )
          )
          .find((foundObj: any) => foundObj !== undefined);
        if (locationElement) {
          newLocationPackage.locationWarehouseName =
            locationElement.locationWarehouseName;
          newLocationPackage.locationCode = locationElement.locationCode;
          newLocationPackage.locationName = locationElement.locationName;
          newLocationPackage.locationId = locationElement.id;
        }
      }
      this.listLocationPackage = [
        ...this.listLocationPackage,
        {
          idLocationPackage: this.idLocationPackage,
          packageQuantity: this.productFromParent?.packageQuantity,
          locationWarehouseName: newLocationPackage.locationWarehouseName,
          locationCode: newLocationPackage.locationCode,
          locationName: newLocationPackage.locationName,
          locationId: newLocationPackage.locationId,
          visible: false,
        },
      ];
      this.idLocationPackage++;
      this.calculateTotalPackage();
      this.listLocationPackageChange.emit(this.listLocationPackage);
    }
  }

  async getData() {
    let data = {
      pageIndex: this.page - 1,
      pageSize: this.per_page,
      common: '',
      sortProperty: this.sortProperty,
      sortOrder: this.sortOrder,
      filter: {
        productCode: this.productFromParent.productCode,
        productName: null,
        uom: null,
        importDate: null,
        importDate2: null,
        expiredDate: null,
        expiredDate2: null,
        locationCode: this.dataFilter.locationCode,
        locationName: this.dataFilter.locationName,
        locationDesc: null,
        locationWarehouseName: this.dataFilter.warehouseCode,
      },
    };

    let resp = await this.qrService.getLocationInProduct(data);
    if (resp.result.responseCode == '00') {
      this.datas = resp.data;
      this.total = resp.dataCount;
      this.datas.forEach((element: any) => {
        element.totalQuantity = element.itemQuantity * element.packageQuantity;
      });
      this.calculateTotalTotalQuantity();
    } else {
      this.messageService.error(`${resp.result.message}`, 'Lỗi');
    }
  }
  locationWarehouseId: any = '';
  listLocation: any[] = [];
  async getLocation() {
    let data = {
      pageIndex: 0,
      pageSize: 0,
      filter: {
        locationCode: '',
        locationName: '',
        locationWarehouseCode: '',
        locationWarehouseName: '',
      },
      common: '',
      sortProperty: '',
      sortOrder: '',
    };
    let resp = await this.qrService.getSmallLocation(data);
    if (resp.result.responseCode == '00') {
      this.listLocationFromBE = resp.data;
      this.totalLocation = resp.dataCount;
    } else {
      this.messageService.error(`${resp.result.message}`, ` Lỗi`);
    }
  }

  listLocationFromBE: any[] = [];

  onHandleChangeWarehouseInRow(event: any, row: any) {
    if (event !== null) {
      this.locationWarehouseId = event;
      this.getLocation();
    } else {
      row.locationWarehouseId = '';
      this.listLocation = [];
      row.locationCode = '';
    }
    this.listLocationPackageChange.emit(this.listLocationPackage);
  }

  onHandlePackageQuantity(event: any) {
    this.calculateTotalPackage();
    this.listLocationPackageChange.emit(this.listLocationPackage);
  }

  onHandleChangeLocation(event: any, row: any) {
    console.log(event);
    console.log(row);
    this.listLocation.forEach((element) => {
      if (element.id == event) {
        row.locationName = element.description;
      }
    });
    this.listLocationPackageChange.emit(this.listLocationPackage);
  }

  idLocationPackage: number = 1;
  async onHandleCreateNew() {
    // this.visibleCreate = true;
    let newLocationPackage = {
      locationWarehouseName: '',
      locationCode: '',
      locationName: '',
      locationId: '',
    };
    this.listLocationPackage = [
      ...this.listLocationPackage,
      {
        idLocationPackage: this.idLocationPackage,
        packageQuantity: 1,
        locationWarehouseName: newLocationPackage.locationWarehouseName,
        locationCode: newLocationPackage.locationCode,
        locationName: newLocationPackage.locationName,
        locationId: newLocationPackage.locationId,
        visible: false,
      },
    ];
    this.idLocationPackage++;
    this.calculateTotalPackage();
    this.listLocationPackageChange.emit(this.listLocationPackage);
  }

  onHandleDelete(row: any) {
    // this.handleClick = row;
    // this.visibleConfirmDelete = true
    console.log(this.listLocationPackage);
    console.log(row);
    this.listLocationPackage = this.listLocationPackage.filter(
      (item) => item.idLocationPackage !== row.idLocationPackage
    );
    this.listLocationPackageChange.emit(this.listLocationPackage);
  }

  countPackageQuantity: number = 0;
  calculateTotalPackage() {
    this.countPackageQuantity = this.listLocationPackage.reduce(
      (sum, item) => sum + parseFloat(item.packageQuantity),
      0
    );
  }

  updateAllChecked(): void {
    this.indeterminate = false;
    if (this.allChecked) {
      this.columns = this.columns.map((item) => ({
        ...item,
        check: true,
      }));
    } else {
      this.columns = this.columns.map((item) => ({
        ...item,
        check: false,
      }));
    }
  }

  onClickCheckBox() {
    if (this.columns.every((item) => !item.check)) {
      this.allChecked = false;
      this.indeterminate = false;
    } else if (this.columns.every((item) => item.check)) {
      this.allChecked = true;
      this.indeterminate = false;
    } else {
      this.indeterminate = true;
    }
  }

  id = -1;
  onResize({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.columns[i].width = width + 'px';
    });
  }

  enterSearch($event: any) {
    if ($event.keyCode == 13) {
      this.getData();
    }
  }

  customSortFunction(sortColumn: any) {
    if (sortColumn.sortOrder == '' || sortColumn.sortOrder == 'ASC') {
      sortColumn.sortOrder = 'DESC';
    } else {
      sortColumn.sortOrder = 'ASC';
    }
    this.sortOrder = sortColumn.sortOrder;
    this.sortProperty = sortColumn.keyName;
    this.getData();
  }

  filterData() {
    this.getData();
  }

  // Hàm xử lý sự kiện phân trang
  pagination(event: any) {
    this.page = event.page;
    this.per_page = event.size;

    this.getData();
  }

  dataRead: any = {};
  onHandleReadQR(row: any) {
    this.visibleRead = true;
    this.dataRead = {
      product: this.productFromParent,
      qrChild: row,
    };
  }

  // Modal open create new
  visibleCreate: boolean = false;
  onHandleCancelCreate() {
    this.visibleCreate = false;
    this.getData();
  }

  // Modal open read QR
  visibleRead: boolean = false;
  onHandleCancelRead() {
    this.visibleRead = false;
  }

  hide(event: any) {
    this.visibleCreate = event;
    this.getData();
  }

  onHandleReturnRead(event: any) {
    this.visibleRead = event;
    this.getData();
  }

  countTotalQuantity: number = 0;
  calculateTotalTotalQuantity() {
    this.countTotalQuantity = this.datas.reduce(
      (sum, item) => sum + parseFloat(item.totalQuantity),
      0
    );
  }

  dataFilterLocation: any = {};
  visibleLocation: boolean = false;

  pageLocation: number = 1;
  perPageLocation: number = 10;
  totalLocation: number = 0;

  paginationLocation(event: any) {
    this.pageLocation = event.page;
    this.perPageLocation = event.size;
    this.getLocation();
  }

  onHandleChooseLocation(row: any, rowLocation: any) {
    console.log(row);
    console.log(rowLocation);

    row.locationName = rowLocation.locationName;
    row.locationCode = rowLocation.locationCode;
    row.locationWarehouseName = rowLocation.locationWarehouseName;
    row.locationId = rowLocation.id;
    row.visible = false;
    this.listLocationPackageChange.emit(this.listLocationPackage);
  }

  changeLocation(event: any, row: any) {
    row.visible = event;
  }

  onHandleOpenLocation(row: any) {
    row.visible = true;
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

interface Column {
  keyTitle: any;
  keyName: any;
  width: any;
  check: any;
  sortOrder: any;
}
