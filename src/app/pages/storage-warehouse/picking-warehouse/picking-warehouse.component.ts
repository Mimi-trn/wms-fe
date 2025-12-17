import {Component, OnInit} from '@angular/core';
import jwt_decode from "jwt-decode";
import {MessageService} from "../../../services/message.service";
import {TranslateService} from "@ngx-translate/core";
import {ActivatedRoute, Router} from "@angular/router";
import {NgxUiLoaderService} from "ngx-ui-loader";
import {ReceiptCommonService} from "../../../services/import-warehouse/common/receipt-common.service";
import {CommonService} from "../../../services/export-warehouse/commonService.service";
import {CheckRoleService} from "../../../services/checkRole.service";
import {GDNService} from "../../../services/export-warehouse/GDNRequestService.service";
import {KeycloakService} from "keycloak-angular";
import {NzResizeEvent} from "ng-zorro-antd/resizable";
import {TransferDataService} from "../../../services/transferData.service";
import {ExportRequestService} from "../../../services/export-warehouse/exportRequestService.service";

@Component({
  selector: 'app-picking-warehouse',
  templateUrl: './picking-warehouse.component.html',
  styleUrls: ['./picking-warehouse.component.css']
})
export class PickingWarehouseComponent implements OnInit{
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
    private exportRequestService: ExportRequestService,
    private gdnService: GDNService
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
        this.checkGroupsInFcimAdmin =
        encodedToken.groups.includes('/FCIM_ADMIN');

        this.listExportStatus = [
          {
            text: ' Chờ lấy hàng',
            value: 1,
          },
          {
            text: 'Đã lấy hàng',
            value: 2,
          },
        ];
    });
  }
  params: any = '';
  choose: any = '';
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
  listExportStatus: any[] = [];
  listExportType: any[] = [
    {
      text: 'Xuất kho sản xuất',
      value: 1,
    },
    {
      text: 'Xuất kho thành phẩm',
      value: 2,
    },
    {
      text: 'Xuất kho khác',
      value: 3,
    },
  ];
  total: number = 0;
  page: number = 1;
  per_page: number = 10;
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
  ngOnInit() {
    this.params = this.activatedRoute.snapshot.routeConfig?.path;
    if (this.params == 'list-GDN-pending') {
      this.choose = 'pending';
    } else {
      this.choose = 'all';
    }
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
    this.getListGDN();

    this.columns = [
      {
        keyTitle: 'sidebar.export.child.goodDeliveryNote.child.gdnCode',
        keyName: 'gdnCode',
        width: '180px',
        check: true,
      },
      {
        keyTitle:
          'sidebar.export.child.goodDeliveryNote.child.exportRequestCode',
        keyName: 'exportRequestCode',
        width: '180px',
        check: true,
      },
      {
        keyTitle: 'sidebar.export.child.goodDeliveryNote.child.exportType',
        keyName: 'exportType',
        width: '180px',
        check: true,
      },
      {
        keyTitle: 'sidebar.export.child.goodDeliveryNote.child.woCode',
        keyName: 'woCode',
        width: '180px',
        check: true,
      },
      {
        keyTitle: 'sidebar.export.child.goodDeliveryNote.child.totalLotNumber',
        keyName: 'totalLotNumber',
        width: '180px',
        check: false,
      },
      {
        keyTitle: 'sidebar.export.child.goodDeliveryNote.child.soCode',
        keyName: 'soCode',
        width: '180px',
        check: false,
      },
      {
        keyTitle: 'sidebar.export.child.goodDeliveryNote.child.customerCode',
        keyName: 'customerCode',
        width: '180px',
        check: false,
      },
      {
        keyTitle: 'sidebar.export.child.goodDeliveryNote.child.customerName',
        keyName: 'customerName',
        width: '180px',
        check: false,
      },
      // Chưa sửa
      {
        keyTitle: 'sidebar.export.child.goodDeliveryNote.child.orderDate',
        keyName: 'orderDate',
        width: '240px',
        check: false,
      },
      {
        keyTitle: 'sidebar.export.child.goodDeliveryNote.child.techFormCode',
        keyName: 'techFormCode',
        width: '180px',
        check: false,
      },
      {
        keyTitle: 'sidebar.export.child.goodDeliveryNote.child.techFormName',
        keyName: 'techFormName',
        width: '180px',
        check: false,
      },
      {
        keyTitle: 'sidebar.export.child.goodDeliveryNote.child.deliveryAt',
        keyName: 'deliveryAt',
        width: '240px',
        check: false,
      },
      {
        keyTitle: 'sidebar.export.child.goodDeliveryNote.child.receiverName',
        keyName: 'receiverName',
        width: '240px',
        check: false,
      },
      {
        keyTitle: 'sidebar.export.child.goodDeliveryNote.child.approvedBy',
        keyName: 'approverName',
        width: '240px',
        check: true,
      },
      {
        keyTitle: 'sidebar.export.child.goodDeliveryNote.child.createdBy',
        keyName: 'createdBy',
        width: '180px',
        check: false,
      },
      {
        keyTitle: 'sidebar.export.child.goodDeliveryNote.child.createdAt',
        keyName: 'createdAt',
        width: '240px',
        check: false,
      },
      {
        keyTitle: 'sidebar.export.child.goodDeliveryNote.child.updatedAt',
        keyName: 'updatedAt',
        width: '240px',
        check: false,
      },
      {
        keyTitle: 'sidebar.export.child.goodDeliveryNote.child.note',
        keyName: 'note',
        width: '180px',
        check: false,
      },
      {
        keyTitle: 'sidebar.export.child.goodDeliveryNote.child.exportStatus',
        keyName: 'exportStatus',
        width: '180px',
        check: true,
      },
    ];
  }
  checkIsRole(role: string) {
    return this.checkRole.checkRole(role);
  }
  setBreadcrumb() {
    this.breadcrumbs = [
      {
        name: 'storage.name',
        route: ``,
      },
      {
        name: 'storage.child.picking',
        route: `/manage-storage/picking`,
      },
    ];
    this.isBreadcrumb = true;
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

  pagination(event: any) {
    this.page = event.page;
    this.per_page = event.size;
    this.getListGDN();
  }

  async getListGDN() {
    let data = {};
    if (
      this.choose == 'pending' &&
      (this.checkGroupsInTokenAdmin ||
        this.checkGroupsInTokenQcer ||
        this.checkGroupsInTokenSaler)
    ) {
      data = {
        pageIndex: this.page - 1,
        pageSize: this.per_page,
        filter: {
          gdnCode: this.dataFilter.gdnCode,
          exportRequestCode: this.dataFilter.exportRequestCode,
          exportType: this.dataFilter.exportType,
          techFormCode: this.dataFilter.techFormCode,
          techFormName: this.dataFilter.techFormName,
          startAt: this.dataFilter.startAt[0],
          startAt2: this.dataFilter.startAt[1],
          endAt: this.dataFilter.endAt[0],
          endAt2: this.dataFilter.endAt[1],
          soCode: this.dataFilter.soCode,
          customerCode: this.dataFilter.customerCode,
          customerName: this.dataFilter.customerName,
          orderDate: this.dataFilter.orderDate[0],
          orderDate2: this.dataFilter.orderDate[1],
          deliveryAt: this.dataFilter.deliveryAt[0],
          deliveryAt2: this.dataFilter.deliveryAt[0],
          receiverName: this.dataFilter.receiverName,
          approverName: this.dataFilter.approverName,
          status: 1,
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
    } else {
      data = {
        pageIndex: this.page - 1,
        pageSize: this.per_page,
        filter: {
          gdnCode: this.dataFilter.gdnCode,
          exportRequestCode: this.dataFilter.exportRequestCode,
          exportType: this.dataFilter.exportType,
          techFormCode: this.dataFilter.techFormCode,
          techFormName: this.dataFilter.techFormName,
          startAt: this.dataFilter.startAt[0],
          startAt2: this.dataFilter.startAt[1],
          endAt: this.dataFilter.endAt[0],
          endAt2: this.dataFilter.endAt[1],
          soCode: this.dataFilter.soCode,
          customerCode: this.dataFilter.customerCode,
          customerName: this.dataFilter.customerName,
          orderDate: this.dataFilter.orderDate[0],
          orderDate2: this.dataFilter.orderDate[1],
          deliveryAt: this.dataFilter.deliveryAt[0],
          deliveryAt2: this.dataFilter.deliveryAt[0],
          receiverName: this.dataFilter.receiverName,
          approverName: this.dataFilter.approverName,
          status: this.dataFilter.status,
          exportStatus: this.dataFilter.exportStatus,
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
    }

    let resp = await this.gdnService.listGDN(data);
    if (resp.result.responseCode == '00') {
      this.listData = resp.data;
      this.total = resp.dataCount;
    }
  }

  clearSearchGeneral() {
    this.searchGeneral = '';
    this.getListGDN();
  }
  searchGeneralFunc() {
    this.getListGDN();
  }


  onClickCheckBox(column: any) {}

  id = -1;
  onResize({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.columns[i].width = width + 'px';
    });
  }

  customSortFunction(sortColumn: string) {
    this.countSort = this.countSort + 1;
    if (this.countSort % 2 == 1) {
      this.sortOrder = 'descend';
    } else {
      this.sortOrder = 'ascend';
    }
    this.sortProperty = sortColumn;
    this.getListGDN();
  }
  search() {
    this.getListGDN();
  }
  clear(row: any) {
    this.dataFilter[row.keyName] = '';
    this.getListGDN();
  }
  enterSearch($event: any) {
    if ($event.keyCode == 13) {
      this.getListGDN();
    }
  }
  rangeDate() {
    this.getListGDN();
  }

  dataApprove: any = {};
  modalConfirmApprove: boolean = false;
  onHandleApprove(row: any) {
    this.dataApprove = row;
    this.modalConfirmApprove = true;
  }

  onHandleModalCancelApprove(event: any) {
    this.modalConfirmApprove = false;
  }
  async onHandleModalConfirmApprove(event: any) {
    let resp = await this.gdnService.approveGDN(this.dataApprove.gdnCode);
    if (resp.result.responseCode == '00') {
      this.modalConfirmApprove = false;
      this.getListGDN();
      this.messageService.success(`${resp.result.message}`, ` Thành công`);
    } else {
      this.messageService.warning(`${resp.result.message}`, ` Thất bại`);
    }
  }

  onHandleView(row: any) {
    this.router.navigate([`./export/list-GDN/${row.gdnCode}`]);
  }

  // Xử lý modal thu hồi
  gdnRevoke: any = '';
  onHandleRecalL(row: any) {
    this.gdnRevoke = row.gdnCode;
    this.visibleRevoke = true;
  }

  isVisibleCancel: boolean = false;
  visibleRevoke: boolean = false;
  onClickCancelRevoke() {
    this.isVisibleCancel = true;
  }

  hide(data: any) {
    if (!data) {
      this.visibleRevoke = data;
      this.getListGDN();
    }
  }
  async onHandleSave(row: any) {
    let res = await this.gdnService.updatePickingStatus(row.gdnCode)
    if(res.result.responseCode == '00'){
      this.messageService.success(`${res.result.message}`, ` Thông báo`)
      this.getListGDN()
    }else{
      this.messageService.error(`${res.result.message}`, ` Thông báo`)
    }
  }
  onClickCancel() {
    this.isVisibleCancel = true;
  }
  onHandleCancelPopup(event: any) {
    this.isVisibleCancel = event;
  }

  onHandleConfirmPopup(event: any) {
    this.visibleRevoke = event;
  }
}


