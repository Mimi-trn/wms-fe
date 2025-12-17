import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CheckRoleService } from 'src/app/services/checkRole.service';
import { SoService } from 'src/app/services/manage-information/so/so.service';
import { MessageService } from 'src/app/services/message.service';
import { TransferDataService } from 'src/app/services/transferData.service';

@Component({
  selector: 'app-so-list',
  templateUrl: './so-list.component.html',
  styleUrls: ['./so-list.component.css'],
})
export class SoListComponent implements OnInit {
  // Breadscrumb
  isBreadcrumb: boolean = false;
  isHidden: boolean = true;
  breadcrumbs: Object[] = [];
  // Information
  listStatus: Select[] = [];
  // Search chung
  searchGeneral: string = '';
  // Column setting
  allChecked: boolean = false;
  indeterminate: boolean = true;
  columns: Column[] = [];
  // Table
  listData: any[] = [];
  // Table sort
  countSort: number = 0;
  sortOrder: string = 'descend';
  sortProperty: string = 'updatedAt';
  // Table filter
  dataFilter: any = {
    orderDate: [],
    deliveryAt: [],
  };
  // Table pagi
  total: number = 0;
  page: number = 1;
  per_page: number = 10;
  constructor(
    private messageService: MessageService,

    private translateService: TranslateService,
    private router: Router,
    private loading: NgxUiLoaderService,
    private activatedRoute: ActivatedRoute,
    private transferData: TransferDataService,
    private checkRole: CheckRoleService,
    private soService: SoService
  ) {}
  checkIsRole(role: string) {
    return this.checkRole.checkRole(role);
  }
  ngOnInit() {
    this.listStatus = [
      { text: 'Đóng', value: 0 },
      { text: 'Mở', value: 1 },
    ];
    this.columns = [
      {
        keyTitle: 'sidebar.information.child.listSO.child.soCode',
        keyName: 'productOrderCode',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'sidebar.information.child.listSO.child.customerCode',
        keyName: 'customerCode',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'sidebar.information.child.listSO.child.customerName',
        keyName: 'customerName',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'sidebar.information.child.listSO.child.customerAddress',
        keyName: 'customerAddress',
        width: '200px',
        check: false,
      },
      {
        keyTitle: 'sidebar.information.child.listSO.child.customerPhone',
        keyName: 'customerPhone',
        width: '200px',
        check: false,
      },
      {
        keyTitle: 'sidebar.information.child.listSO.child.orderDate',
        keyName: 'orderDate',
        width: '240px',
        check: true,
      },
      {
        keyTitle: 'sidebar.information.child.listSO.child.deliveryAt',
        keyName: 'deliveryAt',
        width: '240px',
        check: true,
      },
      {
        keyTitle: 'sidebar.information.child.listSO.child.note',
        keyName: 'note',
        width: '200px',
        check: false,
      },
      {
        keyTitle: 'sidebar.information.child.listSO.child.status',
        keyName: 'status',
        width: '200px',
        check: true,
      },
    ];
    this.setBreadcrumb();
    this.getListSO();
  }

  setBreadcrumb() {
    this.breadcrumbs = [
      {
        name: 'menu.manage.information',
        route: ``,
      },
      {
        name: 'sidebar.information.child.listSO.child.list',
        route: `/manage-info/list-so`,
      },
    ];
    this.isBreadcrumb = true;
  }

  // Tạo yêu cầu xuất kho
  onHandleCreateExportRequest(row: any) {
    let data = {
      dataObj: row,
      listItem: [],
    };
    this.transferData.setObjSo(data);
    this.router.navigate(['./export/list-request-export/new']);
  }

  // Xem chi tiết đơn hàng
  onHandleView(row: any) {
    this.router.navigate([`./manage-info/list-so/${row.productOrderCode}`]);
  }

  // Lấy danh sách đơn hàng
  async getListSO() {
    this.loading.start();
    let data = {
      pageIndex: this.page - 1,
      pageSize: this.per_page,
      common: this.searchGeneral,
      sortOrder: this.sortOrder,
      sortProperty: this.sortProperty,
      filter: {
        productOrderCode: this.dataFilter.productOrderCode,
        customerCode: this.dataFilter.customerCode,
        customerName: this.dataFilter.customerName,
        customerPhone: this.dataFilter.customerPhone,
        customerAddress: this.dataFilter.customerAddress,
        status: this.dataFilter.status,
        note: this.dataFilter.note,
        deliveryAt: this.dataFilter.deliveryAt[0],
        deliveryAt2: this.dataFilter.deliveryAt[1],
        orderDate: this.dataFilter.orderDate[0],
        orderDate2: this.dataFilter.orderDate[1],
      },
    };
    let resp = await this.soService.listSO(data);
    if (resp.result.responseCode == '00') {
      this.loading.stop();
      this.listData = resp.data;
      this.total = resp.dataCount;
    } else {
      this.loading.stop();
    }
  }

  // Xử lý tìm kiếm toàn bộ trong bảng
  searchGeneralFunc() {
    this.getListSO();
  }

  // Xử lý tìm kiếm theo trường
  search() {
    this.getListSO();
  }

  enterSearch($event: any) {
    if ($event.keyCode == 13) {
      this.getListSO();
    }
  }

  clear(keyName: any) {
    this.dataFilter[keyName] = '';
    this.getListSO();
  }

  // Phân trang bảng
  pagination(event: any) {
    this.page = event.page;
    this.per_page = event.size;
    this.getListSO();
  }

  // Cập nhật lại tất cả cột (ẩn/hiện)
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

  // Cập lại lại trạng thái của cột (ẩn/hiện)
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

  // Thay đổi kích thước của cột
  id = -1;
  onResize({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.columns[i].width = width + 'px';
    });
  }

  // Custome sắp xếp
  customSortFunction(sortColumn: string) {
    this.countSort = this.countSort + 1;
    if (this.countSort % 2 == 1) {
      this.sortOrder = 'descend';
    } else {
      this.sortOrder = 'ascend';
    }
    this.sortProperty = sortColumn;
    this.getListSO();
  }
}

interface Select {
  text: string;
  value: any;
}

interface Column {
  keyTitle: string;
  keyName: string;
  width: string;
  check: boolean;
}
