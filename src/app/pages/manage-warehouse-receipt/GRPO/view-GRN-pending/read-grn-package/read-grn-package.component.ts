import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { BarcodeItemService } from 'src/app/services/barcode-item/barcode-item.service';
import { MessageService } from 'src/app/services/message.service';
@Component({
  selector: 'app-read-grn-package',
  templateUrl: './read-grn-package.component.html',
  styleUrls: ['./read-grn-package.component.css'],
})
export class ReadGrnPackageComponent implements OnInit {
  @Input() productFromParent: any = {};
  @Input() listPackage: any[] = [];
  @Input() isView: boolean = false;
  @Input() importRequestCode: string = '';
  @Output() listPackageChange: EventEmitter<any> = new EventEmitter();
  constructor(
    private messageService: MessageService,
    private barcodeService: BarcodeItemService,
    private translateService: TranslateService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private loading: NgxUiLoaderService,
    private qrService: BarcodeItemService
  ) {}
  // Columns
  columns: Column[] = [];
  allChecked: boolean = true;
  indeterminate: boolean = false;
  // Table
  listUoM: any[] = [];
  datas: any[] = [];
  sortProperty: string = 'updatedAt';
  sortOrder: string = 'descend';
  page: number = 1;
  per_page: number = 10;
  total: number = 0;
  dataFilter: any = {};
  ngOnInit() {
    this.getLocation();
    this.calculateTotalTotalPackage();
    this.columns = [
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
        keyTitle: 'sidebar.barcodeItem.listQR.itemQuantity',
        keyName: 'itemQuantity',
        width: '160px',
        check: true,
        sortOrder: '',
      },
      {
        keyTitle: 'sidebar.barcodeItem.listQR.packageQuantity',
        keyName: 'packageQuantity',
        width: '160px',
        check: true,
        sortOrder: '',
      },
      {
        keyTitle: 'sidebar.barcodeItem.listQR.totalPackage',
        keyName: 'totalItem',
        width: '160px',
        check: true,
        sortOrder: '',
      },
    ];
    // if (this.listPackage.length == 0 && !this.isView) this.onHandleCreateNew();
  }

  idPackage: number = 1;
  onHandleCreateNew() {
    this.listPackage = [
      ...this.listPackage,
      {
        idPackage: this.idPackage,
        locationId: '',
        locationCode: '',
        locationName: '',
        status: 1,
        totalItem: 0,
        itemQuantity: 0,
        packageQuantity: 0,
        listLocationPackage: [],
      },
    ];
    this.idPackage++;
    this.calculateTotalTotalPackage();
    this.listPackageChange.emit(this.listPackage);
  }
  onHandleItemPackage(event: any) {
    event.totalItem =
      parseFloat(event.itemQuantity) * parseFloat(event.packageQuantity);
    this.calculateTotalTotalPackage();
    this.listPackageChange.emit(this.listPackage);
  }

  onHandlePackageQuantity(event: any) {
    event.totalItem =
      parseFloat(event.itemQuantity) * parseFloat(event.packageQuantity);
    this.calculateTotalTotalPackage();
    this.listPackageChange.emit(this.listPackage);
  }

  countTotalQuantity: number = 0;
  calculateTotalTotalPackage() {
    if (this.listPackage?.length <= 0) this.countTotalQuantity = 0;
    else
      this.countTotalQuantity = this.listPackage.reduce(
        (sum, item) => sum + parseFloat(item.totalItem),
        0
      );
    if (!this.isView)
      this.productFromParent.actualQuantity = this.countTotalQuantity;
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

  handleClick: any = {};
  visibleConfirmDelete: boolean = false;
  onHandleDelete(row: any) {
    this.listPackage = this.listPackage.filter(
      (item) => item.idPackage !== row.idPackage
    );
    this.calculateTotalTotalPackage();
    this.listPackageChange.emit(this.listPackage);
  }

  hidePopupDelete(event: any) {
    this.visibleConfirmDelete = event;
  }

  async confirmDelete(event: any) {
    let resp = await this.qrService.deletePackage(this.handleClick.id);
    if (resp.result.responseCode == '00') {
      this.messageService.success(`${resp.result.message}`, ` Thành công`);
      // this.getData();
    } else {
      this.messageService.error(`${resp.result.message}`, ` Lỗi`);
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

  dataRead: any = {};
  onHandleReadQR(row: any) {
    this.visibleRead = true;
    this.dataRead = {
      product: this.productFromParent,
      qrChild: row,
    };
    // console.log(this.dataRead)
  }

  // Modal open read QR
  visibleRead: boolean = false;
  onHandleCancelRead() {
    this.visibleRead = false;
  }

  onHandleReturnRead(event: any) {
    this.visibleRead = event;
  }

  expandSet = new Set<number>();
  isExpand: boolean = false;

  onClickIcon(element: any) {
    if (this.expandSet.has(element.idPackage)) {
      this.expandSet.delete(element.idPackage);
    } else {
      this.expandSet.add(element.idPackage);
    }
  }

  onHandleOpenLocation(row: any) {
    row.visible = true;
  }

  changeLocation(event: any, row: any) {
    row.visible = event;
  }

  listLocationFromBE: any[] = [];
  pageLocation: number = 0;
  perPageLocation: number = 10;
  totalLocation: number = 0;
  async getLocation() {
    let data = {
      pageIndex: this.pageLocation,
      pageSize: this.perPageLocation,
      filter: {
        locationCode: '',
        locationName: '',
        locationWarehouseCode: this.productFromParent.warehouseCode || '',
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
  onHandleChooseLocation(row: any, rowLocation: any) {
    row.locationName = rowLocation.locationName;
    row.locationCode = rowLocation.locationCode;
    row.locationId = rowLocation.id;
    row.visible = false;
    console.log('Đã chọn vị trí:', row.locationCode, row.locationName);
  }

  paginationLocation(event: any) {
    this.pageLocation = event.page;
    this.perPageLocation = event.size;
    this.getLocation();
  }
}

interface Column {
  keyTitle: any;
  keyName: any;
  width: any;
  check: any;
  sortOrder: any;
}
