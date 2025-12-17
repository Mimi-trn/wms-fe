import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { KeycloakService } from 'keycloak-angular';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { PageFilter } from 'src/app/models/request/PageFilter.model';
import { CheckRoleService } from 'src/app/services/checkRole.service';
import { ReceiptCommonService } from 'src/app/services/import-warehouse/common/receipt-common.service';
import { ImportRequestService } from 'src/app/services/import-warehouse/import-request/import-request.service';
import { MessageService } from 'src/app/services/message.service';
import { TransferDataService } from 'src/app/services/transferData.service';
import jwt_decode from 'jwt-decode';

@Component({
  selector: 'app-list-warehouse-receipt',
  templateUrl: './list-warehouse-receipt.component.html',
  styleUrls: ['./list-warehouse-receipt.component.css'],
})
export class ListWarehouseReceiptComponent implements OnInit {
  constructor(
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    private loading: NgxUiLoaderService,
    private checkRole: CheckRoleService,
    private importRequestService: ImportRequestService,
    private receiptCommonService: ReceiptCommonService,
    private transferData: TransferDataService,
    private keyClockService: KeycloakService
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

  // Value
  userName: string = this.keyClockService.getUsername();
  isVisibleCancelRequest: boolean = false;
  isVisibleCancel: boolean = false;
  currentImportRequestCode: string = '';
  columns: any[] = [];
  data: any[] = [];
  isBreadcrumb: boolean = false;
  isHidden: boolean = true;
  breadcrumbs: Object[] = [];
  searchGeneral: string = '';
  page: number = 1;
  per_page: number = 10;
  filter: any = {};
  sort: Object[] = [];
  total: number = 0;
  dataFilter: any = {};
  choose: string = 'all';
  sortProperty: string = 'updatedAt';
  sortOrder: string = 'descend';
  isRole: string | null = this.checkRole.hasAnyRoleOf([
    'wms_buyer',
    'wms_keeper',
  ]);
  listImportType: any[] = [];
  pageFilter: PageFilter = {
    common: this.searchGeneral,
    pageIndex: this.page - 1,
    pageSize: this.per_page,
    filter: this.filter,
    sortProperty: 'updatedAt',
    sortOrder: 'descend',
  };

  pageFilterForWaitProcess: PageFilter = {
    common: this.searchGeneral,
    pageIndex: this.page,
    pageSize: this.per_page,
    filter: {},
    sortProperty: 'updatedAt',
    sortOrder: 'descend',
  };
  listWarehouse: any = [];
  listItems: any = [];
  dataDetail: any = {};
  listStatus: any = [
    {
      value: 5,
      label: 'importRequest.status.status_5',
    },
    {
      value: 8,
      label: 'importRequest.status.status_8',
    },
    {
      value: 9,
      label: 'importRequest.status.status_9',
    },
    {
      value: 10,
      label: 'importRequest.status.status_10',
    },
  ];
  isVisibleConfirmWithDraw: boolean = false;
  isVisibleConfirm: boolean = false;
  isVisibleCreateGrn: boolean = false;
  currentRow: any = {};
  getDecodedAccessToken(token: string): any {
    try {
      return jwt_decode(token);
    } catch (Error) {
      return null;
    }
  }

  async getToken() {
    this.token = await this.keyClockService.getToken();
  }
  token: any = '';
  checkGroupsInTokenQcer: boolean = false;
  checkGroupsInTokenKeeper: boolean = false;
  checkGroupsInTokenSaler: boolean = false;
  checkGroupsInTokenAdmin: boolean = false;
  ngOnInit() {
    this.loading.start();
    // this.translateService.get('menu.manage.receipt.list').subscribe((text) => {
    //   this.title.setTitle(text);
    // });
    this.setBreadcrumb();
    this.receiptCommonService.getWarehouse().then((response) => {
      this.listWarehouse = response.data;
      // Get list import type
      this.receiptCommonService.getImportType().then((response) => {
        this.listImportType = response.data.filter(
          (item: any) =>
            item.importTypeId == 1 ||
            item.importTypeId == 2 ||
            item.importTypeId == 5 ||
            item.importTypeId == 6
        );
        console.log(this.listImportType);
        //Get list import request
        this.importRequestService
          .getAllImportRequestAndType(this.pageFilter, false, 2)
          .then((response) => {
            this.data = response.data.map((data: any) => {
              let warehouseName = this.listWarehouse.find(
                (warehouse: any) =>
                  warehouse.warehouseCode == data.warehouseCode
              );
              return {
                ...data,
                warehouseName:
                  warehouseName != undefined
                    ? warehouseName.warehouseName
                    : 'none',
              };
            });
            console.log('data', this.data);
            this.total = response.dataCount;
          });
      });
    });
    const columnReceipt = sessionStorage.getItem(
      'column-list-warehouse-receipt'
    );
    this.columns = columnReceipt
      ? JSON.parse(columnReceipt)
      : [
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
          keyTitle: 'ui.receipt.required.importRequestCode',
          keyName: 'importRequestCode',
          width: '200px',
          check: true,
        },
        {
          keyTitle: 'ui.receipt.required.importTypeName',
          keyName: 'importType',
          listOfFilter: this.listImportType,
          width: '200px',
          check: true,
        },
        {
          keyTitle: 'ui.receipt.required.woCode',
          keyName: 'woCode',
          width: '200px',
          check: true,
        },
        {
          keyTitle: 'ui.receipt.required.poCode',
          keyName: 'poCode',
          width: '200px',
          check: true,
        },
        
        {
          keyTitle: 'table.note',
          keyName: 'note',
          width: '200px',
          check: true,
        },
        {
          keyTitle: 'Mô tả',
          keyName: 'importTypeId',
          width: '200px',
          check: true,
        },
        {
          keyTitle: 'ui.receipt.required.deliveryAt',
          keyName: 'deliveryAt',
          width: '200px',
          check: false,
        },
        {
          keyTitle: 'ui.receipt.required.informationDelivery',
          keyName: 'informationDelivery',
          width: '200px',
          check: false,
        },
        {
          keyTitle: 'ui.receipt.required.customerCode',
          keyName: 'customerCode',
          width: '200px',
          check: false,
        },
        {
          keyTitle: 'ui.receipt.required.customerName',
          keyName: 'customerName',
          width: '200px',
          check: false,
        },
        {
          keyTitle: 'ui.receipt.required.address',
          keyName: 'address',
          width: '200px',
          check: false,
        },
        {
          keyTitle: 'ui.receipt.required.phoneNumber',
          keyName: 'phoneNumber',
          width: '200px',
          check: false,
        },
        {
          keyTitle: 'ui.receipt.required.createContractAt',
          keyName: 'createContractAt',
          width: '200px',
          check: false,
        },
        {
          keyTitle: 'ui.receipt.required.qcNumber',
          keyName: 'qcCount',
          width: '200px',
          check: false,
          isSort: false,
        },
        {
          keyTitle: 'ui.receipt.required.createBy',
          keyName: 'createdBy',
          width: '200px',
          check: false,
        },
        {
          keyTitle: 'ui.receipt.required.createAt',
          keyName: 'createdAt',
          width: '200px',
          check: false,
        },
        {
          keyTitle: 'ui.receipt.required.updateAt',
          keyName: 'updatedAt',
          width: '200px',
          check: true,
        },
        {
          keyTitle: 'table.status',
          keyName: 'status',
          width: '200px',
          check: true,
        },
      ];

    this.loading.stop();
  }

  checkIsRole(role: string) {
    return this.checkRole.checkRole(role);
  }

  // Hàm xử lý sự kiện breadscrumb
  setBreadcrumb() {
    this.breadcrumbs = [
      {
        name: 'menu.manage.receipt',
        route: ``,
      },
      {
        name: 'menu.manage.receipt.list',
        route: `/manage-warehouse-receipt/required-receipt-warehouse`,
      },
    ];
    this.isBreadcrumb = true;
  }

  // Hàm tìm kiếm chung
  searchGeneralFunc() { }

  // Hàm thêm mới yêu cầu nhập kho
  onClickAddNew() {
    this.router.navigate([
      '/manage-warehouse-receipt/required-receipt-warehouse/create',
    ]);
  }

  // Hàm thêm cột
  onClickAddColumn() { }

  // Hàm xử lý checkbox
  onClickCheckBox(event: any) {
    sessionStorage.setItem(
      'column-list-warehouse-receipt',
      JSON.stringify(this.columns)
    );
  }

  // Hàm xử lý sự kiện onResize
  onResize({ width }: NzResizeEvent, col: any): void {
    this.columns = this.columns.map((e) =>
      e.keyTitle === col.keyTitle ? { ...e, width: `${width}px` } : e
    );
  }

  // Hàm xử lý xem chi tiết yêu cầu nhập kho
  onHandleView(row: any) {
    this.router.navigate([
      `/manage-warehouse-receipt/required-receipt-warehouse/view-detail-import-request/${row.importRequestCode}`,
    ]);
  }

  // Hàm xử lý sự kiện phân trang
  pagination(event: any) {
    this.page = event.page;
    this.per_page = event.size;
    this.getData(event.page, event.size);
  }

  async getData(page: any, per_page: any) {
    this.loading.start();

    if (this.filter.createdAt) {
      this.filter.createdAt2 = this.filter.createdAt.pop();
      this.filter.createdAt = this.filter.createdAt.pop();
    }
    if (this.filter.updatedAt) {
      this.filter.updatedAt2 = this.filter.updatedAt.pop();
      this.filter.updatedAt = this.filter.updatedAt.pop();
    }
    if (this.filter.contractCreateAt) {
      this.filter.contractCreateAt2 = this.filter.contractCreateAt.pop();
      this.filter.contractCreateAt = this.filter.contractCreateAt.pop();
    }
    if (this.filter.deliveryAt) {
      this.filter.deliveryAt2 = this.filter.deliveryAt.pop();
      this.filter.deliveryAt = this.filter.deliveryAt.pop();
    }

    this.pageFilter.pageIndex = page - 1;
    this.pageFilter.pageSize = per_page;
    this.pageFilter.filter = this.filter;
    this.pageFilter.common = this.searchGeneral;

    let resp = await this.importRequestService.getAllImportRequestAndType(
      this.pageFilter,
      false,
      2
    );
    if (resp.result.responseCode == '00') {
      // this.data = resp?.data?.map((data: any) => {
      //   return {
      //     ...data,
      //     warehouseName: this.listWarehouse.find(
      //       (warehouse: any) => warehouse.warehouseCode == data.warehouseCode
      //     ).warehouseName,
      //   };
      // });
      this.data = resp?.data?.map((data: any) => {
        const matchedWarehouse = this.listWarehouse.find(
          (warehouse: any) => warehouse.warehouseCode == data.warehouseCode
        );
        return {
          ...data,
          warehouseName: matchedWarehouse
            ? matchedWarehouse.warehouseName
            : null,
        };
      });
      this.total = resp.dataCount;
      this.loading.stop();
    } else {
      this.loading.stop();
    }
  }

  // Hàm xử lý sự kiện tìm kiếm ở các dòng
  search() {
    this.getData(this.page, this.per_page);
  }

  // Bắt sự kiện sort filter pagi
  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort, filter } = params;
    this.sort = sort;
    let resultFilter: any = {};
    filter.forEach((ele: any) => {
      resultFilter[ele.key] = ele.value;
    });
    this.filter = { ...this.filter, ...resultFilter };
  }

  // hàm xử lý hủy yêu cầu nhập kho
  onHandleWithDrawIqcRequest(row: any) {
    this.currentImportRequestCode = row.importRequestCode;
    this.isVisibleCancelRequest = true;
  }

  // onHandleIQC
  onHandleIQC(row: any) { }

  // onHandleCreateGRN
  onHandleCreateGRN() {
    let data = {
      listItem: {},
      fileList: {},
      dataInformation: {},
    };
    console.log(this.currentRow);

    if (
      this.currentRow.importType !== 'Nhập kho NVL dư thừa' &&
      this.currentRow.importType !== 'Nhập kho BTP / TP'
    ) {
      this.receiptCommonService
        .getListFile(this.currentRow.importRequestCode)
        .then((response) => {
          data.fileList = response.data;
        });
    }
    this.importRequestService
      .getImportRequestDetail(this.currentRow.importRequestCode)
      .then((response) => {
        data.dataInformation = response.data.importRequestDTO;
        data.listItem = response.data.listItem;
        this.transferData.setObjectFromImportRequest(data);
        this.router.navigate([
          './manage-warehouse-receipt/create-good-receipt-note',
        ]);
      });
  }

  cancelRequest() {
    this.isVisibleCancelRequest = true;
  }

  onCancelRequestPopup() {
    this.isVisibleCancel = true;
  }

  hideCancelRequest(event: any) {
    this.isVisibleCancelRequest = event;
    this.getData(this.page, this.per_page);
  }

  onHandleCancelPopup(event: any) {
    this.isVisibleCancelRequest = event;
    this.isVisibleCancel = event;
  }

  onSort(sortProperty: string, index: number) {
    if (sortProperty == 'warehouseName') {
      sortProperty = 'warehouseCode';
    }
    this.sortProperty = sortProperty;
    this.pageFilter.sortProperty = sortProperty;
    this.columns.forEach((e) => {
      if (e.keyName != sortProperty) {
        e.isSort = false;
      }
    });
    if (!this.columns[index].isSort) {
      this.sortOrder = 'descend';
      this.columns[index].isSort = true;
    } else {
      if (this.sortOrder == 'descend') {
        this.sortOrder = 'ascend';
      } else {
        this.sortOrder = 'descend';
      }
    }
    this.pageFilter.sortOrder = this.sortOrder;
    this.getData(this.page, this.per_page);
  }

  isVisibleRevoke: boolean = false;
  currentRevoke: any = {};
  onHandleRevoke(row: any) {
    this.isVisibleRevoke = true;
    this.currentRevoke = row.importRequestCode;
  }

  onHandleRevokeCancel(event: any) {
    this.isVisibleRevoke = event;
  }

  onHandleRevokeConfirm(event: any) {
    this.getData(this.page, this.per_page);
  }

  clearFilter(keyName: any) {
    console.log('keyName', keyName);
    this.filter[keyName] = '';
    this.search();
  }
}
