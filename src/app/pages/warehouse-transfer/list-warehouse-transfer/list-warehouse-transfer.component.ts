import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { KeycloakService } from 'keycloak-angular';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CheckRoleService } from 'src/app/services/checkRole.service';
import { CommonService } from 'src/app/services/export-warehouse/commonService.service';
import { MessageService } from 'src/app/services/message.service';
import { TransferDataService } from 'src/app/services/transferData.service';
import { WarehouseTransferService } from 'src/app/services/warehouse-transfer/warehouse-transfer.service';

import jwt_decode from 'jwt-decode';

@Component({
  selector: 'app-list-warehouse-transfer',
  templateUrl: './list-warehouse-transfer.component.html',
  styleUrls: ['./list-warehouse-transfer.component.css'],
})
export class ListWarehouseTransferComponent implements OnInit {
  // Breadcrumb
  isBreadcrumb: boolean = false;
  isHidden: boolean = true;
  breadcrumbs: Object[] = [];
  // Search
  searchGeneral: any = '';
  // Table
  columns: any[] = [];
  listData: any[] = [];
  countSort = 0;
  sortOrder: any = 'descend';
  sortProperty: any = 'id';
  dataFilter: any = {};
  listWarehouse: any[] = [];
  listStatus: any[] = [];

  total: number = 0;
  page: number = 1;
  per_page: number = 10;
  token: any = '';
  checkGroupsInTokenQcer: boolean = false;
  checkGroupsInTokenKeeper: boolean = false;
  checkGroupsInTokenSaler: boolean = false;
  checkGroupsInTokenAdmin: boolean = false;
  constructor(
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private loading: NgxUiLoaderService,
    private checkRole: CheckRoleService,
    private transferData: TransferDataService,
    private keycloakService: KeycloakService,
    private commonService: CommonService,
    private warehouseTransferService: WarehouseTransferService
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
    });
  }

  checkIsRole(role: string) {
    return this.checkRole.checkRole(role);
  }

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

  ngOnInit() {
    this.dataFilter = {};
    this.setBreadcrumb();
    this.getWarehouse();
    this.getWtrRequest();
    this.listStatus = [
      {
        text: 'Yêu cầu mới',
        value: 1,
      },
      {
        text: 'Từ chối chuyển kho',
        value: 2,
      },
      {
        text: 'Đã chuyển kho',
        value: 3,
      },
      {
        text: 'Đang chuyển kho',
        value: 4,
      },
    ];

    const columnTransfer = sessionStorage.getItem(
      'column-list-warehouse-transfer'
    );
    this.columns = columnTransfer
      ? JSON.parse(columnTransfer)
      : [
          {
            keyTitle: 'Mã yêu cầu chuyển kho',
            keyName: 'transferRequestCode',
            width: '200px',
            check: true,
            count: 0,
            sortOrder: '',
          },
          {
            keyTitle: 'kho nguồn',
            keyName: 'fromWarehouseCode',
            width: '200px',
            check: true,
            count: 0,
            sortOrder: '',
          },
          {
            keyTitle: 'kho đích',
            keyName: 'toWarehouseCode',
            width: '200px',
            check: true,
            count: 0,
            sortOrder: '',
          },
          {
            keyTitle: 'Người gửi',
            keyName: 'sender',
            width: '200px',
            check: true,
            count: 0,
            sortOrder: '',
          },
          {
            keyTitle: 'Người nhận',
            keyName: 'receiver',
            width: '200px',
            check: true,
            count: 0,
            sortOrder: '',
          },
          {
            keyTitle: 'Mô tả',
            keyName: 'wtrTypeId',
            width: '200px',
            check: true,
            count: 0,
            sortOrder: '',
          },
          {
            keyTitle: 'sidebar.transfer.child.transferRequest.child.note',
            keyName: 'note',
            width: '200px',
            check: true,
            count: 0,
            sortOrder: '',
          },
          {
            keyTitle: 'sidebar.transfer.child.transferRequest.child.createdAt',
            keyName: 'createdAt',
            width: '200px',
            check: false,
            count: 0,
            sortOrder: '',
          },
          {
            keyTitle: 'Ngày gửi hàng',
            keyName: 'transferDate',
            width: '200px',
            check: true,
            count: 0,
            sortOrder: '',
          },
          {
            keyTitle: 'Ngày nhận hàng',
            keyName: 'receivedDate',
            width: '200px',
            check: true,
            count: 0,
            sortOrder: '',
          },
          {
            keyTitle: 'sidebar.transfer.child.transferRequest.child.updatedAt',
            keyName: 'updatedAt',
            width: '200px',
            check: false,
            count: 0,
            sortOrder: '',
          },
          {
            keyTitle: 'sidebar.transfer.child.transferRequest.child.status',
            keyName: 'status',
            width: '200px',
            check: true,
            count: 0,
            sortOrder: '',
          },
        ];
  }

  async getWtrRequest() {
    try {
      this.loading.start();
      let data = {
        pageIndex: this.page - 1,
        pageSize: this.per_page,
        filter: this.dataFilter,
        common: this.searchGeneral,
        sortProperty: this.sortProperty,
        sortOrder: this.sortOrder,
      };
      let resp = await this.warehouseTransferService.listWtrRequest(data);
      if (resp.result.responseCode == '00') {
        this.listData = resp.data?.content;
        this.total = resp.data.totalElements;
      }
    } catch (err) {
    } finally {
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

  searchGeneralFunc() {
    this.getWtrRequest();
  }

  onHandleAddNew() {
    this.router.navigate([
      './warehouse-transfer/list-warehouse-transfer/add-warehouse-transfer',
    ]);
  }

  allChecked: boolean = false;
  indeterminate: boolean = true;

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
    sessionStorage.setItem(
      'column-list-warehouse-transfer',
      JSON.stringify(this.columns)
    );
  }

  onHandleUpdateAllChecked(): void {
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

  enterSearch($event: any) {
    if ($event.keyCode == 13) {
      this.getWtrRequest();
    }
  }

  search() {
    this.getWtrRequest();
  }

  pagination(event: any) {
    this.page = event.page;
    this.per_page = event.size;
    this.getWtrRequest();
  }

  clear(row: any) {
    this.dataFilter[row.keyName] = '';
    this.getWtrRequest();
  }

  rangeDate() {}

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

    this.getWtrRequest();
  }

  // onResize({ width }: NzResizeEvent, col: any): void {
  //   this.columns = this.columns.map((e) =>
  //     e.keyTitle === col.keyTitle ? { ...e, width: `${width}px` } : e
  //   );
  // }
  id = -1;
  onResize({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.columns[i].width = width + 'px';
    });
  }

  setBreadcrumb() {
    this.breadcrumbs = [
      {
        name: 'sidebar.transfer.name',
        route: ``,
      },
      {
        name: 'sidebar.transfer.child.transferRequest.child.list',
        route: `/warehouse-transfer/list-warehouse-transfer`,
      },
    ];
    this.isBreadcrumb = true;
  }

  // Button
  onHandleRecalL(row: any) {
    this.visibleRevoke = true;
  }

  onHandleView(row: any) {
    this.router.navigate([
      `./warehouse-transfer/list-warehouse-transfer/warehouse-transfer-detail/${row.transferRequestCode}`,
    ]);
  }

  onHandleCreateGDN(row: any) {
    this.transferData.setInformationExportMaterial(row);
    this.router.navigate(['./warehouse-transfer/create-warehouse-transfer'], {
      queryParams: { transferRequestCode: row.transferRequestCode },
    });
  }

  isVisibleCancel: boolean = false;
  visibleRevoke: boolean = false;
  onClickCancelRevoke() {
    this.isVisibleCancel = true;
  }

  hide(data: any) {
    if (!data) {
      this.visibleRevoke = data;
      this.pagination({
        page: this.page,
        size: this.per_page,
      });
    }
  }

  onClickCancel() {
    this.isVisibleCancel = true;
    this.isVisibleRefuseCancel = true;
  }
  onHandleCancelPopup(event: any) {
    this.isVisibleCancel = event;
  }

  onHandleConfirmPopup(event: any) {
    this.visibleRevoke = event;
  }

  // Xử lý modal từ chối
  isVisibleRefuseCancel: boolean = false;
  visibleRefuse: boolean = false;
  onClickCancelRefuse() {
    this.isVisibleRefuseCancel = true;
  }

  hideRefuse(data: any) {
    if (!data) {
      this.visibleRefuse = data;
      this.getWtrRequest();
    }
  }

  onHandleCancelPopupRefuse(event: any) {
    this.isVisibleRefuseCancel = event;
  }

  isVisiblePopupRejectWtr: boolean = false;
  currentRejectWtr: any = {};
  onHandleRefuse(data: any) {
    this.currentRejectWtr = data;
    this.isVisiblePopupRejectWtr = true;
  }
  async rejectWtr() {
    try {
      this.loading.start();
      let res = await this.warehouseTransferService.rejectWtrRequest(
        this.currentRejectWtr?.transferRequestCode
      );
      if (res) {
        if (res.result.ok) {
          this.getWtrRequest();
          this.messageService.success(
            `Từ chối chuyển kho thành công`,
            `Thành công`
          );
        } else {
          this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
        }
      } else {
        this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
      }
    } catch (error) {
      this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
    } finally {
      this.loading.stop();
    }
  }
}
