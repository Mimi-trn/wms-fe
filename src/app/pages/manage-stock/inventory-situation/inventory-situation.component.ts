import { Component, OnInit, ViewContainerRef, TemplateRef, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonService } from 'src/app/services/export-warehouse/commonService.service';
import { PoCommonService } from 'src/app/services/manage-information/common/po-common.service';
import { PoService } from 'src/app/services/manage-information/list-po-service/po.service';
import { StockService } from 'src/app/services/manage-information/stock-service/stock.service';
import { MessageService } from 'src/app/services/message.service';
import { TransferDataService } from 'src/app/services/transferData.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ExportStockComponent } from '../export-stock/export-stock.component';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

@Component({
  selector: 'app-inventory-situation',
  templateUrl: './inventory-situation.component.html',
  styleUrls: ['./inventory-situation.component.css'],
})
export class InventorySituationComponent implements OnInit {
  @ViewChild('modalContent') modalContent!: TemplateRef<any>;
  constructor(
    private messageService: MessageService,
    private vcr: ViewContainerRef,
    private modalService: NzModalService,
    private translateService: TranslateService,
    private router: Router,
    private loading: NgxUiLoaderService,
    private activatedRoute: ActivatedRoute,
    private transferData: TransferDataService,
    private stockService: StockService,
    private poCommonService: PoCommonService,
    private commonService: CommonService,
    private modal: NzModalService,
    private fb: FormBuilder,
  ) {
    this.dataFilter = {
      itemCode: '',
      itemName: '',
      itemGroup: null,
      uom: null,
      warehouseCode: null,
    };
    this.getListItemGroup();
    this.getListUom();
    this.getWarehouse();
  }

  ITEM_GROUP_MAP: any = {
    1: "Thành phẩm",
    2: "Nguyên vật liệu"
  };

  async getListItemGroup() {
    let res = await this.poCommonService.getItemGroup();

    this.listItemGroup = res.data.map((value: number) => ({
      value: value,
      text: this.ITEM_GROUP_MAP[value]
    }));
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

  listItemGroup = [
    { value: 1, text: "Thành phẩm" },
    { value: 2, text: "Nguyên vật liệu" }
  ];
  listUom: any[] = [];
  listWarehouse: any[] = [];

  async getListStock() {
    this.loading.start();
    let data = {
      pageIndex: this.page - 1, //number of page
      pageSize: this.per_page, //number of display elements per page
      filter: this.dataFilter,
      common: this.searchGeneral.trim(),
      sortProperty: this.sortProperty, //property want to sort
      sortOrder: this.sortOrder, //sort by ascending or descending
    };
    let resp = await this.stockService.getListStock(data);
    if (resp.result.responseCode == '00') {

      this.datas = resp.data;
      this.total = resp.dataCount;
      this.loading.stop();
    } else {
      this.loading.stop();
    }
  }

  async getWarehouse() {
    let resp = await this.commonService.getWarehouse();
    resp.data.forEach((element: any) => {
      let data = {
        text: element.warehouseName,
        value: element.warehouseCode,
      };
      this.listWarehouse.push(data);
    });
  }

  ngOnInit() {
    this.getListStock();
    this.columns = [
      {
        keyTitle: 'menu.manage.stock.itemCode',
        keyName: 'itemCode',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'menu.manage.stock.itemName',
        keyName: 'itemName',
        width: '180px',
        check: true,
      },
      {
        keyTitle: 'Mô tả',
        keyName: 'description',
        width: '180px',
        check: true,
      },
      {
        keyTitle: 'menu.manage.stock.warehouse',
        keyName: 'warehouseCode',
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
        keyTitle: 'menu.manage.stock.remainQuantity',
        keyName: 'totalStockQuantity',
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
  //  Hàm xử lý tìm kiếm chung
  searchGeneralFunc() {
    this.getListStock();
  }
  // Hàm xử lý tìm kiếm col
  search() {
    this.getListStock();
  }

  enterSearch($event: any) {
    if ($event.keyCode == 13) {
      this.getListStock();
    }
  }

  // Hàm xử lý import
  onHandleImportFile() { }
  // Xử lý sự kiện sort filter pagi

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
    this.getListStock();
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

  showDeclare: boolean = false;
  checked = false;
  indeterminate = false;
  listOfCurrentPageData: readonly any[] = [];
  listOfData: readonly any[] = [];
  setOfCheckedId = new Set<number>();

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }

    if (this.setOfCheckedId.size > 0) {
      this.showDeclare = true;
    } else {
      this.showDeclare = false;
    }
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(value: boolean): void {
    this.listOfCurrentPageData.forEach((item) =>
      this.updateCheckedSet(item.id, value)
    );
    this.refreshCheckedStatus();
  }

  onCurrentPageDataChange($event: readonly any[]): void {
    this.listOfCurrentPageData = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfCurrentPageData.every((item) =>
      this.setOfCheckedId.has(item.id)
    );
    this.indeterminate =
      this.listOfCurrentPageData.some((item) =>
        this.setOfCheckedId.has(item.id)
      ) && !this.checked;
  }

  allChecked: boolean = true;
  indeterminated: boolean = false;

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
  total: number = 100;
  dataFilter: any = {};
  visibleAddNew: boolean = false;
  isVisibleCancel: boolean = false;

  sortProperty: any = '';
  sortOrder: any = '';

  // Xử lý expand
  expandSet = new Set<number>();
  isExpand: boolean = false;

  onClickIcon(element: any) {
    if (this.expandSet.has(element.id)) {
      this.expandSet.delete(element.id);
    } else {
      this.expandSet.add(element.id);
    }
  }

  showExportStockModal(): void {
    const modal = this.modalService.create<ExportStockComponent, any>({
      nzTitle: 'Xuất file Excel',
      nzContent: ExportStockComponent,
      nzViewContainerRef: this.vcr,
      nzStyle: { width: '80%' },
      nzOkText: 'Xuất',
      nzCancelText: 'Hủy bỏ',
      nzOnOk: (instance) => {
        instance.exportToExcel();
      },
    });
    modal.afterClose.subscribe((result) =>
      console.log('[afterClose] The result is:', result)
    );
  }
  onHandleView(row: any) {
    this.router.navigate(['/manage-stock/inventory-detail'], {
      queryParams: { ...row },
    });
  }

  formItemNew!: FormGroup;

  // Hàm xử lý thêm mới
  onClickAddNew() {
    this.formItemNew = this.fb.group({
      itemName: ['', Validators.required],
      uom: ['', Validators.required],
      itemGroupName: ['', Validators.required],
      description: ['', Validators.required],
    });

    this.modal.create({
      nzTitle: 'Thêm mới item',
      nzContent: this.modalContent,
      nzFooter: null,
      nzWidth: 600
    });
  }

  createItem() {
    const payload = {
      itemCode: this.formItemNew.get('productCode')?.value,
      itemName: this.formItemNew.get('itemName')?.value,
      unit: this.formItemNew.get('uom')?.value,
      itemGroupName: this.formItemNew.get('itemGroupName')?.value,
      description: this.formItemNew.get('description')?.value,
    };

    // Gọi API
    this.stockService.createItem(payload).subscribe({
      next: (res: any) => {
        if (res?.result?.responseCode === '00') {
          this.messageService.success('Tạo Item thành công', 'Thành công');
          this.modal.closeAll();
          this.formItemNew.reset();
          this.getListStock();
        } else {
          this.messageService.error('Tạo Item thất bại', res?.result?.message || '');
        }
      },
      error: (err) => {
        console.error('Lỗi khi tạo item', err);
        this.messageService.error('Lỗi kết nối tới máy chủ!', 'lỗi');
      }
    });
  }
}
