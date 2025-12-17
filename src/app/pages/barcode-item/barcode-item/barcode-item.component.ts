import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { BarcodeItemService } from 'src/app/services/barcode-item/barcode-item.service';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-barcode-item',
  templateUrl: './barcode-item.component.html',
  styleUrls: ['./barcode-item.component.css'],
})
export class BarcodeItemComponent {
  // Breadscrumb
  breadcrumbs: Object[] = [];
  //
  searchGeneral: string = '';
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
  dataFilter: any = {
    expiredDate: [],
    importDate: [],
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

  ngOnInit(): void {
    this.breadcrumbs = [
      {
        name: 'sidebar.barcodeItem.name',
        route: ``,
      },
      {
        name: 'sidebar.barcodeItem.listQR.title',
        route: `/barcode-item`,
      },
    ];
    this.columns = [
      {
        keyTitle: 'sidebar.barcodeItem.listQR.productCode',
        keyName: 'productCode',
        width: '200px',
        check: true,
        sortOrder: '',
      },
      {
        keyTitle: 'sidebar.barcodeItem.listQR.grnCode',
        keyName: 'grnCode',
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
        keyTitle: 'sidebar.barcodeItem.listQR.importDate',
        keyName: 'importDate',
        width: '200px',
        check: true,
        sortOrder: '',
      },
      {
        keyTitle: 'sidebar.barcodeItem.listQR.expiredDate',
        keyName: 'expiredDate',
        width: '200px',
        check: true,
        sortOrder: '',
      },
    ];
    this.getDVT();
    this.getData();
  }

  async getData() {
    this.loading.start();
    let data = {
      pageIndex: this.page - 1,
      pageSize: this.per_page,
      filter: {
        id: null,
        productCode: this.dataFilter.productCode,
        importRequestCode: '',
        grnCode: this.dataFilter.grnCode,
        itemName: this.dataFilter.itemName,
        description: this.dataFilter.description,
        actualQuantity: '',
        uom: this.dataFilter.uom,
        importDate: this.dataFilter.importDate[0],
        importDate2: this.dataFilter.importDate[1],
        expiredDate: this.dataFilter.expiredDate[0],
        expiredDate2: this.dataFilter.expiredDate[1],
      },
      common: this.searchGeneral,
      sortProperty: this.sortProperty,
      sortOrder: this.sortOrder,
    };

    let resp = await this.qrService.getListItemQR(data);
    if (resp.result.responseCode == '00') {
      this.datas = resp.data;
      this.total = resp.dataCount;
      this.loading.stop();
    } else {
      this.messageService.error(`${resp.result.message}`, ` Lỗi`);
      this.loading.stop();
    }
  }

  async getDVT() {
    let resp = await this.qrService.getDVT();
    if (resp.result.responseCode == '00') {
      this.listUoM = resp.data;
    } else {
      this.messageService.error(`${resp.result.message}`, ` Lỗi`);
    }
  }

  searchGeneralFunc() {
    this.getData();
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

  enterSearch($event: any) {
    if ($event.keyCode == 13) {
      this.getData();
    }
  }

  // Hàm xử lý sự kiện phân trang
  pagination(event: any) {
    this.page = event.page;
    this.per_page = event.size;
    this.getData();
  }

  // Xử lý expand
  expandSet = new Set<any>();
  isExpand: boolean = false;

  onClickIcon(element: any) {
    if (this.expandSet.has(element.id)) {
      this.expandSet.delete(element.id);
    } else {
      this.expandSet.add(element.id);
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
