import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { KeycloakService } from 'keycloak-angular';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CheckRoleService } from 'src/app/services/checkRole.service';
import { CommonService } from 'src/app/services/export-warehouse/commonService.service';
import { ExportRequestService } from 'src/app/services/export-warehouse/exportRequestService.service';
import { MessageService } from 'src/app/services/message.service';
import { TransferDataService } from 'src/app/services/transferData.service';
import jwt_decode from 'jwt-decode';

@Component({
  selector: 'app-list-request-export',
  templateUrl: './list-request-export.component.html',
  styleUrls: ['./list-request-export.component.css'],
})
export class ListRequestExportComponent implements OnInit {
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
  sortProperty: any = 'updatedAt';
  dataFilter: any = {};
  listWarehouse: any[] = [];
  listStatus: any[] = [];
  listExportType: any[] = [];
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
    private exportRequestService: ExportRequestService
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
    this.dataFilter = {
      orderDate: [],
      deliveryAt: [],
      startAt: [],
      endAt: [],
      createdAt: [],
      updatedAt: [],
    };
    this.setBreadcrumb();
    this.getWarehouse();
    this.getExportRequest();
    this.listExportType = [
      {
        text: 'Xuất kho sản xuất',
        value: 1,
      },
      {
        text: 'Xuất kho khác',
        value: 3,
      },
    ];

    if (
      this.checkIsRole('wms_export-request_view') &&
      (this.checkGroupsInTokenAdmin ||
        this.checkGroupsInTokenQcer ||
        this.checkGroupsInTokenSaler)
    ) {
      this.listStatus = [
        {
          text: 'Yêu cầu mới',
          value: 1,
        },
        {
          text: 'Đã từ chối xuất kho',
          value: 2,
        },
        {
          text: 'Đang xuất kho',
          value: 3,
        },
        {
          text: 'Đã xuất kho',
          value: 4,
        },
      ];
    } else if (
      this.checkIsRole('wms_export-request_view') &&
      (this.checkGroupsInTokenAdmin || this.checkGroupsInTokenKeeper)
    ) {
      this.listStatus = [
        {
          text: 'Yêu cầu mới',
          value: 1,
        },
        {
          text: 'Đã từ chối xuất kho',
          value: 2,
        },
        {
          text: 'Đang xuất kho',
          value: 3,
        },
        {
          text: 'Đã xuất kho',
          value: 4,
        },
      ];
    } else
      this.listStatus = [
        {
          text: 'Yêu cầu mới',
          value: 1,
        },
        {
          text: 'Đã từ chối xuất kho',
          value: 2,
        },
        {
          text: 'Đang xuất kho',
          value: 3,
        },
        {
          text: 'Đã xuất kho',
          value: 4,
        },
      ];
    this.columns = [
      {
        keyTitle: 'Mã sản xuất',
        keyName: 'productCode',
        width: '200px',
        check: false,
      },
      {
        keyTitle: 'Mã đơn hàng',
        keyName: 'soCode',
        width: '200px',
        check: false,
      },
      {
        keyTitle: 'Tên sản phẩm',
        keyName: 'productName',
        width: '200px',
        check: false,
      },
      {
        keyTitle: 'Tên khách hàng',
        keyName: 'customerName',
        width: '200px',
        check: false,
      },
      {
        keyTitle: 'sidebar.export.child.exportRequest.child.exportRequestCode',
        keyName: 'exportRequestCode',
        width: '180px',
        check: true,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'sidebar.export.child.exportRequest.child.exportType',
        keyName: 'exportType',
        width: '180px',
        check: true,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'sidebar.export.child.exportRequest.child.customerCode',
        keyName: 'customerCode',
        width: '180px',
        check: false,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'sidebar.export.child.exportRequest.child.customerName',
        keyName: 'customerName',
        width: '180px',
        check: false,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'sidebar.export.child.exportRequest.child.orderDate',
        keyName: 'orderDate',
        width: '240px',
        check: false,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'sidebar.export.child.exportRequest.child.woCode',
        keyName: 'woCode',
        width: '200px',
        check: true,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'sidebar.export.child.exportRequest.child.note',
        keyName: 'note',
        width: '180px',
        check: true,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'sidebar.export.child.exportRequest.child.startDate',
        keyName: 'startAt',
        width: '240px',
        check: false,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'sidebar.export.child.exportRequest.child.endDate',
        keyName: 'endAt',
        width: '240px',
        check: false,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'sidebar.export.child.exportRequest.child.deliveryAt',
        keyName: 'deliveryAt',
        width: '240px',
        check: false,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'sidebar.export.child.exportRequest.child.createdBy',
        keyName: 'createdBy',
        width: '180px',
        check: false,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'sidebar.export.child.exportRequest.child.createdAt',
        keyName: 'createdAt',
        width: '240px',
        check: true,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'sidebar.export.child.exportRequest.child.updatedAt',
        keyName: 'updatedAt',
        width: '240px',
        check: false,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'sidebar.export.child.exportRequest.child.status',
        keyName: 'status',
        width: '180px',
        check: true,
        count: 0,
        sortOrder: '',
      },
    ];
  }

  async getExportRequest() {
    try {
      this.loading.start();
      let data = {
        pageIndex: this.page - 1,
        pageSize: this.per_page,
        filter: {
          productCode: this.dataFilter?.productCode,
          productName: this.dataFilter?.productName,
          exportRequestCode: this.dataFilter.exportRequestCode,
          exportType: this.dataFilter.exportType,
          // warehouseCode: this.dataFilter.warehouseCode,
          lotId: this.dataFilter.lotId,
          lotNumber: this.dataFilter.lotNumber,
          // techFormCode: this.dataFilter.techFormCode,
          techFormName: this.dataFilter.techFormName,
          startAt: this.dataFilter.startAt[0],
          startAt2: this.dataFilter.startAt[1],
          endAt: this.dataFilter.endAt[0],
          endAt2: this.dataFilter.endAt[1],
          soCode: this.dataFilter.soCode,
          woCode: this.dataFilter.woCode,
          totalLotNumber: this.dataFilter.totalLotNumber,
          customerCode: this.dataFilter.customerCode,
          customerName: this.dataFilter.customerName,
          orderDate: this.dataFilter.orderDate[0],
          orderDate2: this.dataFilter.orderDate[1],
          deliveryAt: this.dataFilter.deliveryAt[0],
          deliveryAt2: this.dataFilter.deliveryAt[1],
          status: this.dataFilter.status,
          note: this.dataFilter.note,
          createdAt: this.dataFilter.createdAt[0],
          createdAt2: this.dataFilter.createdAt[1],
          createdBy: this.dataFilter.createdBy,
          updatedAt: this.dataFilter.updatedAt[0],
          updatedAt2: this.dataFilter.updatedAt[1],
        },
        common: this.searchGeneral,
        sortProperty: this.sortProperty,
        sortOrder: this.sortOrder,
      };
      let resp = await this.exportRequestService.listExportRequest(data);
      if (resp.result.responseCode == '00') {
        this.listData = resp.data;
        this.total = resp.dataCount;
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
    this.getExportRequest();
  }

  onHandleAddNew() {
    this.router.navigate(['./export/list-request-export/new']);
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
      this.getExportRequest();
    }
  }

  search() {
    this.getExportRequest();
  }

  pagination(event: any) {
    this.page = event.page;
    this.per_page = event.size;
    this.getExportRequest();
  }

  clear(row: any) {
    this.dataFilter[row.keyName] = '';
  }

  rangeDate() { }

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

    this.getExportRequest();
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
        name: 'sidebar.export.name',
        route: ``,
      },
      {
        name: 'sidebar.export.child.exportRequest.child.list',
        route: `/export/list-request-export`,
      },
    ];
    this.isBreadcrumb = true;
  }

  // Button
  exportRequestRevoke: any = '';
  onHandleRecalL(row: any) {
    this.visibleRevoke = true;
    this.exportRequestRevoke = row.exportRequestCode;
  }

  onHandleView(row: any) {
    this.router.navigate([
      `./export/list-request-export/${row.exportRequestCode}`,
    ]);
    // this.router.navigate([
    //   `./export/list-request-export/${row.exportRequestCode}`,
    // ]);
  }

  onHandleCreateGDN(row: any) {
    this.transferData.setInformationExportMaterial(row);
    this.router.navigate(['./export/new-GDN']);
  }

  onHandleRefuse(row: any) {
    this.visibleRefuse = true;
    this.exportRequestRevoke = row.exportRequestCode;
  }

  // Xử lý modal thu hồi
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
      this.getExportRequest();
    }
  }

  onHandleCancelPopupRefuse(event: any) {
    this.isVisibleRefuseCancel = event;
  }

  onHandleConfirmPopupRefuse(event: any) {
    this.visibleRefuse = event;
  }
}
