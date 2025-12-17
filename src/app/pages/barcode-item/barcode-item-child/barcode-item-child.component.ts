import { Component, OnInit, Input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { BarcodeItemService } from 'src/app/services/barcode-item/barcode-item.service';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-barcode-item-child',
  templateUrl: './barcode-item-child.component.html',
  styleUrls: ['./barcode-item-child.component.css'],
})
export class BarcodeItemChildComponent implements OnInit {
  @Input() productFromParent: any = {};
  // Columns
  columns: Column[] = [];
  allChecked: boolean = true;
  indeterminate: boolean = false;
  // Table
  datas: any[] = [];
  listUoM: any[] = [];
  sortProperty: string = 'updatedAt';
  sortOrder: string = 'descend';
  page: number = 1;
  per_page: number = 10;
  total: number = 0;
  dataFilter: any = {
    expiredDate: [],
    improtDate: [],
  };
  constructor(
    private messageService: MessageService,
    private barcodeService: BarcodeItemService,
    private translateService: TranslateService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private loading: NgxUiLoaderService,
    private qrService: BarcodeItemService
  ) {}

  ngOnInit() {
    this.getData();
    this.columns = [
      {
        keyTitle: 'sidebar.barcodeItem.listQR.productCode',
        keyName: 'productCode',
        width: '200px',
        check: true,
        sortOrder: '',
      },
      {
        keyTitle: 'sidebar.barcodeItem.listQR.itemName',
        keyName: 'itemName',
        width: '200px',
        check: true,
        sortOrder: '',
      },
      {
        keyTitle: 'sidebar.barcodeItem.listQR.description',
        keyName: 'description',
        width: '200px',
        check: true,
        sortOrder: '',
      },
      {
        keyTitle: 'sidebar.barcodeItem.listQR.uom',
        keyName: 'uom',
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
    ];
    this.dataRead = {
      product: this.productFromParent,
    };
  }

  async getData() {
    let data = {
      pageIndex: this.page - 1,
      pageSize: this.per_page,
      filter: {
        id: '',
        productCode: this.productFromParent.productCode,
        itemName: this.dataFilter.itemName,
        description: this.dataFilter.description,
        uom: this.dataFilter.uom,
        grnCode: this.productFromParent.grnCode,
        quantity: '',
        locationId: '',
        locationName: '',
      },
      common: '',
      sortProperty: this.sortProperty,
      sortOrder: this.sortOrder,
    };
    let resp = await this.qrService.getListQR(data);
    if (resp.result.responseCode == '00') {
      this.datas = resp.data;
      this.total = resp.dataCount;
    } else {
      this.messageService.error(`${resp.result.message}`, 'Lỗi');
    }
    this.calculateTotalItemQuantity();
    this.calculateTotalPackageQuantity();
  }

  async getDVT() {
    let resp = await this.qrService.getDVT();
    if (resp.result.responseCode == '00') {
      this.listUoM = resp.data;
    } else {
      this.messageService.error(`${resp.result.message}`, ` Lỗi`);
    }
  }

  onHandleCreateNew() {
    this.visibleCreate = true;
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

  customSortFunction(sortColumn: any) {
    if (sortColumn.sortOrder == '' || sortColumn.sortOrder == 'ascend') {
      sortColumn.sortOrder = 'descend';
    } else {
      sortColumn.sortOrder = 'ascend';
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

  dataRead: any = {
    product: this.productFromParent,
  };
  onHandleReadQR(row: any) {
    this.visibleRead = true;
    this.dataRead.qrChild = row;
  }

  // Modal open create new
  visibleCreate: boolean = false;
  onHandleCancelCreate() {
    this.visibleCreate = false;
  }

  // Modal open read QR
  visibleRead: boolean = false;
  onHandleCancelRead() {
    this.visibleRead = false;
  }

  onHandleClose(event: any) {
    this.visibleRead = event;
    this.getData();
  }

  onHandleCloseCreate(event: any) {
    this.visibleCreate = event;
    this.getData();
  }

  countItemQuantity: number = 0;
  calculateTotalItemQuantity() {
    this.countItemQuantity = this.datas.reduce(
      (sum, item) => sum + parseFloat(item.itemQuantity),
      0
    );
  }

  countPackageQuantity: number = 0;
  calculateTotalPackageQuantity() {
    this.countPackageQuantity = this.datas.reduce(
      (sum, item) => sum + parseFloat(item.packageQuantity),
      0
    );
  }

  handleClick: any = {};
  visibleConfirmDelete: boolean = false;
  onHandleDelete(row: any) {
    this.handleClick = row;
    this.visibleConfirmDelete = true;
  }

  hidePopupDelete(event: any) {
    this.visibleConfirmDelete = event;
  }

  async confirmDelete(event: any) {
    let resp = await this.qrService.deletePackage(this.handleClick.id);
    if (resp.result.responseCode == '00') {
      this.messageService.success(`${resp.result.message}`, ` Thành công`);
      this.getData();
    } else {
      this.messageService.error(`${resp.result.message}`, ` Lỗi`);
    }
  }

  onHandleRead(row: any) {
    this.visibleRead = true;
    this.dataRead = {
      product: this.productFromParent,
      qrChild: row,
    };
  }
}

interface Column {
  keyTitle: any;
  keyName: any;
  width: any;
  check: any;
  sortOrder: any;
}
