import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CheckRoleService } from 'src/app/services/checkRole.service';
import { InventoryService } from 'src/app/services/manage-information/inventory-service/inventory.service';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-inventory-list',
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.css'],
})
export class InventoryListComponent implements OnInit {
  checkIsRole(role: string) {
    return this.checkRole.checkRole(role);
  }
  constructor(
    private messageService: MessageService,
    private checkRole: CheckRoleService,
    private translateService: TranslateService,
    private router: Router,
    private loading: NgxUiLoaderService,
    private activatedRoute: ActivatedRoute,
    private inventoryService: InventoryService
  ) {
    this.listStatus = [
      { text: 'Hoạt động', value: 1 },
      { text: 'Dừng hoạt động', value: 0 },
    ];
  }

  sortOrder: any = 'descend';
  sortProperty: any = 'updatedAt';
  // Get data;
  async getData(page: any, per_page: any) {
    this.loading.start();
    let data = {
      pageIndex: page - 1,
      pageSize: per_page,
      filter: {
        warehouseName: this.dataFilter.warehouseName,
        warehouseCode: this.dataFilter.warehouseCode,
        description: this.dataFilter.description,
        status: this.dataFilter.status,
      },
      common: this.searchGeneral,
      sortProperty: this.sortProperty,
      sortOrder: this.sortOrder,
    };
    let resp = await this.inventoryService.getInventoryList(data);
    if (resp.result.responseCode == '00') {
      this.loading.stop();
      this.total = resp.dataCount;
      this.datas = resp.data;
    } else {
      this.loading.stop();
    }
  }

  ngOnInit() {
    this.getData(this.page, this.per_page);
    // this.translateService
    //   .get('menu.manage.inventory.list')
    //   .subscribe((text) => {
    //     this.title.setTitle(text);
    //   });
    this.columns = [
      {
        keyTitle: 'manage.warehouse.code',
        keyName: 'warehouseCode',
        width: '200px',
        check: true,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'manage.warehouse.name',
        keyName: 'warehouseName',
        width: '200px',
        check: true,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'manage.warehouse.desc',
        keyName: 'description',
        width: '400px',
        check: true,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'table.status',
        keyName: 'status',
        listOfFilter: this.listStatus,
        width: '200px',
        check: true,
        count: 0,
        sortOrder: '',
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
        name: 'menu.manage.inventory.list',
        route: `/manage-info/manage-inventory-list`,
      },
    ];
    this.isBreadcrumb = true;
  }
  //  Hàm xử lý tìm kiếm chung
  searchGeneralFunc() {
    this.getData(this.page, this.per_page);
  }

  // Hàm xử lý tìm kiếm col
  search() {
    this.getData(this.page, this.per_page);
  }

  // Hàm xử lý thêm mới
  onClickAddNew() {
    this.visibleAddNew = true;
  }

  // Hàm xử lý checkbox
  onClickCheckBox(column: any) {}

  // Hàm xử lý thêm column
  onClickAddColumn() {}

  // Xử lý sự kiện sort filter pagi
  // onQueryParamsChange(params: NzTableQueryParams): void {
  //   const { pageSize, pageIndex, filter } = params;
  //   this.getData(this.page, this.per_page);
  // }

  // Hàm xử lý sự kiện onResize

  id = -1;
  onResize({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.columns[i].width = width + 'px';
    });
  }

  // deleteRecord
  handleClick: any = {};
  deleteRecord(record: any) {
    this.visibleConfirmDelete = true;
    this.handleClick = record;
  }

  async active(record: any) {
    this.loading.start();
    let resp = await this.inventoryService.activeInventory(
        this.handleClick.warehouseCode
      );
      if (resp.result.responseCode == '00') {
        this.getData(this.page, this.per_page);
        this.messageService.success(`${resp.result.message}`, `Thành công`);
      } else {
        this.messageService.warning(`${resp.result.message}`, `Thất bại`);
      }
    this.loading.stop();
  }

  // Hàm xử lý sự kiện phân trang
  pagination(event: any) {
    this.page = event.page;
    this.per_page = event.size;
    this.getData(event.page, event.size);
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
    this.getData(this.page, this.per_page);
  }

  // Hàm xử lý ẩn hiện modal
  hidePopupDelete(event: any) {
    this.visibleConfirmDelete = event;
  }

  async confirmDelete(event: any) {
    if (event) {
      let resp = await this.inventoryService.deleteInventory(
        this.handleClick.warehouseCode
      );
      if (resp.result.responseCode == '00') {
        this.getData(this.page, this.per_page);
        this.messageService.success(`${resp.result.message}`, `Thành công`);
      } else {
        this.messageService.warning(`${resp.result.message}`, `Thất bại`);
      }
    }
  }

  // sort
  countSort = 0;
  customSortFunction(sortColumn: any) {
    sortColumn.count = sortColumn.count + 1;
    // this.countSort = this.countSort + 1;
    if (sortColumn.count % 2 == 1) {
      sortColumn.sortOrder = 'descend';
    } else {
      sortColumn.sortOrder = 'ascend';
    }
    this.sortOrder = sortColumn.sortOrder;
    this.sortProperty = sortColumn.keyName;
    this.getData(this.page, this.per_page);
  }

  searchGeneral: any = '';
  isBreadcrumb: boolean = false;
  isHidden: boolean = true;
  breadcrumbs: Object[] = [];
  datas: any[] = [];
  columns: any[] = [];
  listStatus: any[] = [];
  page: number = 1;
  per_page: number = 10;
  total: number = 0;
  dataFilter: any = {};
  visibleAddNew: boolean = false;
  isVisibleCancel: boolean = false;
  visibleConfirmDelete: boolean = false;
}
