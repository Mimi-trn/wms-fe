import { Component, OnInit, Input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { PoCommonService } from 'src/app/services/manage-information/common/po-common.service';
import { PoService } from 'src/app/services/manage-information/list-po-service/po.service';
import { StockService } from 'src/app/services/manage-information/stock-service/stock.service';
import { MessageService } from 'src/app/services/message.service';
import { TransferDataService } from 'src/app/services/transferData.service';

@Component({
  selector: 'app-inventory-situation-detail',
  templateUrl: './inventory-situation-detail.component.html',
  styleUrls: ['./inventory-situation-detail.component.css'],
})
export class InventorySituationDetailComponent implements OnInit {
  @Input() productId: string = '';
  constructor(
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    private loading: NgxUiLoaderService,
    private activatedRoute: ActivatedRoute,
    private transferData: TransferDataService,
    private stockService: StockService,
    private poCommonService: PoCommonService
  ) {
    this.dataFilter = {
      productCode: '',
      itemName: '',
      description: '',
      itemGroup: null,
      uom: null,
      grnCode: '',
      expiredDate: [],
    };
    this.getListItemGroup();
    this.getListUom();
  }

  async getListItemGroup() {
    let res = await this.poCommonService.getItemGroup();
    res.data.forEach((element: any) => {
      this.listItemGroup.push({
        text: element,
        value: element,
      });
    });
  }

  async getListUom() {
    let res = await this.poCommonService.getUnit();
    res.data.forEach((element: any) => {
      this.listUom.push({
        text: element.paramDesc,
        value: element.paramValue,
      });
    });
  }

  listItemGroup: any[] = [];
  listUom: any[] = [];

  async getDetail(id: any) {
    this.loading.start();
    let data = {
      pageIndex: this.page - 1,
      pageSize: this.per_page,
      filter: {
        id: null,
        productCode: this.dataFilter.productCode,
        itemName: this.dataFilter.itemName,
        description: this.dataFilter.description,
        itemGroup: this.dataFilter.itemGroup,
        uom: this.dataFilter.uom,
        remainQuanitty: null,
        expiredDate: this.dataFilter.expiredDate[0],
        expiredDate2: this.dataFilter.expiredDate[1],
        grnCode: this.dataFilter.grnCode,
      },
      sortProperty: '',
      sortOrder: '',
    };
    let res = await this.stockService.getDetailStock(id, data);
    this.datas = res.data;
    this.total = res.dataCount;
    this.loading.stop();
  }

  ngOnInit() {
    if (this.productId) {
      this.getDetail(this.productId);
    }
    this.columns = [
      {
        keyTitle: 'menu.manage.stock.itemCode',
        keyName: 'productCode',
        width: '140px',
        check: true,
      },
      {
        keyTitle: 'menu.manage.stock.itemName',
        keyName: 'itemName',
        width: '180px',
        check: true,
      },
      {
        keyTitle: 'menu.manage.stock.description',
        keyName: 'description',
        width: '180px',
        check: true,
      },
      {
        keyTitle: 'menu.manage.stock.itemGroup',
        keyName: 'itemGroup',
        width: '170px',
        check: true,
      },
      {
        keyTitle: 'menu.manage.stock.uom',
        keyName: 'uom',
        width: '120px',
        check: true,
      },
      {
        keyTitle: 'menu.manage.stock.grnCode',
        keyName: 'grnCode',
        width: '140px',
        check: true,
      },
      {
        keyTitle: 'menu.manage.stock.expiredDate',
        keyName: 'expiredDate',
        width: '200px',
        check: true,
      },

      {
        keyTitle: 'menu.manage.stock.remainQuantity',
        keyName: 'remainQuantity',
        width: '140px',
        check: true,
      },
    ];
    this.setBreadcrumb();
  }

  // Hàm xử lý sự kiện breadscrumb
  setBreadcrumb() {
    this.breadcrumbs = [
      {
        name: 'menu.manage.information',
        route: ``,
      },
      {
        name: 'menu.manage.stock',
        route: `/manage-info/manage-stock-list`,
      },
    ];
    this.isBreadcrumb = true;
  }
  async rangeDate() {
    this.getDetail(this.productId);
  }
  //  Hàm xử lý tìm kiếm chung
  searchGeneralFunc() {
    this.getDetail(this.productId);
  }
  // Hàm xử lý tìm kiếm col
  search() {
    this.getDetail(this.productId);
  }

  enterSearch($event: any) {
    if ($event.keyCode == 13) {
      this.getDetail(this.productId);
    }
  }
  // Hàm xử lý thêm mới
  onClickAddNew() {}
  // Hàm xử lý import
  onHandleImportFile() {}
  // Hàm xử lý sự kiện onResize
  onResize({ width }: NzResizeEvent, col: any): void {
    this.columns = this.columns.map((e) =>
      e.keyTitle === col.keyTitle ? { ...e, width: `${width}px` } : e
    );
  }
  // Hàm xử lý sự kiện phân trang
  pagination(event: any) {
    this.page = event.page;
    this.per_page = event.size;
    this.getDetail(this.productId);
  }
  // onHandleView
  onHandleView(row: any) {
    this.router.navigate([`./manage-info/manage-list-po/${row.poCode}`]);
  }

  // onHandleNewIQC
  onHandleNewIQC(row: any) {
    this.transferData.changeMessage(row);
    this.router.navigate([
      './manage-warehouse-receipt/required-receipt-warehouse/create',
    ]);
  }

  // Hàm xử lý trả lại
  onClickCancel() {
    this.isVisibleCancel = true;
    // this.visibleAddNew = false;
  }

  onHandleCancelPopup(event: any) {
    this.isVisibleCancel = event;
  }

  onHandleConfirmPopup(event: any) {
    this.visibleAddNew = event;
  }

  // Hàm xử lý chức năng đóng modal
  hideAddNew(data: any) {
    this.visibleAddNew = data;
    // this.getData(this.page, this.per_page);
  }

  onClickCheckBox(column: any) {
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

  lastObject(obj: any) {
    if (obj == this.columns[this.columns.length - 1]) {
      return false;
    } else {
      return true;
    }
  }

  allChecked: boolean = true;
  indeterminate: boolean = false;

  searchGeneral: any = '';
  isBreadcrumb: boolean = false;
  isHidden: boolean = true;
  breadcrumbs: Object[] = [];
  datas: any[] = [];
  columns: any[] = [];
  listStatus: any[] = [];
  listSource: any[] = [];
  page: number = 1;
  per_page: number = 10;
  total: number = 0;
  dataFilter: any = {};
  visibleAddNew: boolean = false;
  isVisibleCancel: boolean = false;
}
