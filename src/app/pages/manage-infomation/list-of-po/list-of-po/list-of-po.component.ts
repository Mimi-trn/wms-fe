import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CheckRoleService } from 'src/app/services/checkRole.service';
import { PoService } from 'src/app/services/manage-information/list-po-service/po.service';
import jwt_decode from 'jwt-decode';
import { MessageService } from 'src/app/services/message.service';
import { TransferDataService } from 'src/app/services/transferData.service';
import { KeycloakService } from 'keycloak-angular';
@Component({
  selector: 'app-list-of-po',
  templateUrl: './list-of-po.component.html',
  styleUrls: ['./list-of-po.component.css'],
})
export class ListOfPoComponent implements OnInit {
  checkIsRole(role: string) {
    return this.checkRole.checkRole(role);
  }
  constructor(
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    private loading: NgxUiLoaderService,
    private activatedRoute: ActivatedRoute,
    private poService: PoService,
    private transferData: TransferDataService,
    private checkRole: CheckRoleService,
    private keycloakService: KeycloakService
  ) {
    let encodedToken;
    this.getToken().then(() => {
      encodedToken = this.getDecodedAccessToken(this.token);
      this.checkGroupsInTokenQcer =
        encodedToken.groups.includes('/WMS_GROUP_QCER');
      this.checkGroupsInTokenKeeper =
        encodedToken.groups.includes('/WMS_GROUP_KEEPER');
      this.checkGroupsInTokenAdmin =
        encodedToken.groups.includes('/WMS_GROUP_ADMIN');
      this.checkGroupsInTokenSaler =
        encodedToken.groups.includes('/WMS_GROUP_SALER');
      this.checkGroupsInFcimAdmin = encodedToken.groups.includes('/FCIM_ADMIN');
    });
    this.listStatus = [
      { text: 'Đóng', value: 1 },
      { text: 'Mở', value: 2 },
      { text: 'Bản nháp', value: 0 },
    ];
    this.listSource = [
      { text: 'Trong nước', value: 1 },
      { text: 'Quốc tế', value: 2 },
    ];
  }

  token: any = '';
  checkGroupsInTokenQcer: boolean = false;
  checkGroupsInTokenKeeper: boolean = false;
  checkGroupsInTokenSaler: boolean = false;
  checkGroupsInTokenAdmin: boolean = false;
  checkGroupsInFcimAdmin: boolean = false;
  getDecodedAccessToken(token: string): any {
    try {
      return jwt_decode(token);
    } catch (Error) {
      return null;
    }
  }

  async getToken() {
    this.token = await this.keycloakService.getToken();
  }

  // Get data
  sortProperty: any = 'updatedAt';
  sortOrder: any = 'descend';
  async getData(page: any, per_page: any) {
    let data = {
      pageIndex: page - 1,
      pageSize: per_page,
      filter: this.dataFilter,
      common: this.searchGeneral,
      sortProperty: this.sortProperty,
      sortOrder: this.sortOrder,
    };
    let resp = await this.poService.getListPO(data);
    if (resp.result.responseCode == '00') {
      this.loading.stop();
      this.datas = resp.data;
      this.total = resp.dataCount;
    } else {
    }
  }

  async rangeDate() {
    this.loading.start();
    let data = {
      pageIndex: this.page - 1,
      pageSize: this.per_page,
      filter: this.dataFilter,
      common: this.searchGeneral,
      sortProperty: this.sortProperty,
      sortOrder: this.sortOrder,
    };
    let resp = await this.poService.getListPO(data);
    if (resp.result.responseCode == '00') {
      this.loading.stop();
      this.datas = resp.data;
      this.total = resp.dataCount;
    } else {
      this.loading.stop();
    }
  }

  ngOnInit() {
    this.columns = [
      {
        keyTitle: 'menu.manage.po.poCode',
        keyName: 'poCode',
        width: '150px',
        check: true,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'menu.manage.po.source',
        keyName: 'source',
        width: '120px',
        check: true,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'menu.manage.po.createBy',
        keyName: 'createdBy',
        width: '150px',
        check: true,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'Nhà cung cấp',
        keyName: 'vendorName',
        width: '150px',
        check: true,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'menu.manage.po.createAt',
        keyName: 'createdAt',
        width: '240px',
        check: true,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'menu.manage.po.deliveryAt',
        keyName: 'deliveryAt',
        width: '240px',
        check: true,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'menu.manage.po.updateAt',
        keyName: 'updatedAt',
        width: '240px',
        check: false,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'menu.manage.po.documentAt',
        keyName: 'documentAt',
        width: '240px',
        check: false,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'table.status',
        keyName: 'status',
        width: '120px',
        check: false,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'menu.manage.po.note',
        keyName: 'note',
        width: '120px',
        check: true,
        count: 0,
        sortOrder: '',
      }
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
        name: 'menu.manage.po',
        route: `/manage-info/manage-list-po`,
      },
    ];
    this.isBreadcrumb = true;
  }
  //  Hàm xử lý tìm kiếm chung
  searchGeneralFunc() {
    this.page = 1;
    this.per_page = 10;
    this.getData(this.page, this.per_page);
  }

  // Hàm xử lý tìm kiếm col
  search() {
    this.getData(this.page, this.per_page);
  }

  enterSearch($event: any) {
    if ($event.keyCode == 13) {
      this.getData(this.page, this.per_page);
    }
  }

  // Hàm xử lý thêm mới
  onClickAddNew() {
    this.transferData.changeMessage({});
    this.router.navigate(['./manage-info/manage-list-po/new']);
  }
  // Hàm xử lý import
  onHandleImportFile() { }
  // Hàm xử lý checkbox

  // Hàm xử lý thêm column
  onClickAddColumn() { }

  // Xử lý sự kiện sort filter pagi
  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, filter, sort } = params;

    if (sort.length !== 0) {
      this.sortProperty = sort[0].key;
      this.sortOrder = sort[0].value;
    }
    if (!this.sortProperty) this.sortProperty = 'status';
    if (!this.sortOrder) this.sortOrder = 'descend';

    filter.forEach((element: any) => {
      this.dataFilter[element.key] = element.value;
    });

    this.getData(this.page, this.per_page);
  }

  // Hàm xử lý sự kiện onResize
  id = -1;
  onResize({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.columns[i].width = width + 'px';
    });
  }

  // Hàm xử lý sự kiện phân trang
  pagination(event: any) {
    console.log('event', event);
    this.page = event.page;
    this.per_page = event.size;

    // this.getData(event.page, event.size);
  }

  // onHandleView
  onHandleView(row: any) {
    if (row.status == 0) {
      this.transferData.changeMessage(row);
      this.router.navigate([`./manage-info/manage-list-po/new`]);
    } else {
      this.router.navigate([`./manage-info/manage-list-po/${row.poCode}`]);
    }
  }

  // onHandleNewIQC
  onHandleNewIQC(row: any) {
    this.transferData.setObjectFromPO(row);
    this.router.navigate(['./manage-warehouse-receipt/create-iqc-request']);
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

  // Filter

  allChecked: boolean = false;
  indeterminate: boolean = true;
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
