import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { KeycloakService } from 'keycloak-angular';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CheckRoleService } from 'src/app/services/checkRole.service';
import { GDNService } from 'src/app/services/export-warehouse/GDNRequestService.service';
import { CommonService } from 'src/app/services/export-warehouse/commonService.service';
import { ExportRequestService } from 'src/app/services/export-warehouse/exportRequestService.service';
import { MessageService } from 'src/app/services/message.service';
import { TransferDataService } from 'src/app/services/transferData.service';
import jwt_decode from 'jwt-decode';
import { WarehouseTransferService } from 'src/app/services/warehouse-transfer/warehouse-transfer.service';

@Component({
  selector: 'app-list-warehouse-transfer-note',
  templateUrl: './list-warehouse-transfer-note.component.html',
  styleUrls: ['./list-warehouse-transfer-note.component.css'],
})
export class ListWarehouseTransferNoteComponent implements OnInit {
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
    private gdnService: GDNService,
    private warehouseTransferService: WarehouseTransferService
  ) {
    this.listStatus = [
      {
        text: 'Bản nháp',
        value: 0,
      },
      {
        text: ' Xuất kho chờ ký xác nhận',
        value: 1,
      },
      {
        text: 'Xuất kho đã ký xác nhận',
        value: 2,
      },
    ];
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
  dataFilter: any = {};
  listWarehouse: any[] = [];
  listStatus: any[] = [];
  listExportType: any[] = [
    {
      text: 'Xuất kho sản xuất',
      value: 1,
    },
    // {
    //   text: 'Xuất kho thành phẩm',
    //   value: 2,
    // },
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
    this.getListWTR();

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
        keyTitle: 'Số chứng từ',
        keyName: 'wtrCode',
        width: '180px',
        check: true,
      },
      {
        keyTitle: 'Mã yc chuyển kho',
        keyName: 'transferRequestCode',
        width: '180px',
        check: true,
      },
      {
        keyTitle: 'Loại chuyển kho',
        keyName: 'wtrType',
        width: '180px',
        check: false,
      },
      {
        keyTitle: 'sidebar.export.child.goodDeliveryNote.child.note',
        keyName: 'note',
        width: '180px',
        check: true,
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
        keyTitle: 'Người gửi',
        keyName: 'sender',
        width: '200px',
        check: true,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'sidebar.export.child.goodDeliveryNote.child.exportType',
        keyName: 'exportType',
        width: '180px',
        check: false,
      },
      {
        keyTitle: 'sidebar.export.child.goodDeliveryNote.child.warehouse',
        keyName: 'warehouseCode',
        width: '180px',
        check: false,
      },
      {
        keyTitle: 'sidebar.export.child.goodDeliveryNote.child.woCode',
        keyName: 'woCode',
        width: '180px',
        check: false,
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
        check: false,
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
        width: '150px',
        check: true,
      },
      {
        keyTitle: 'sidebar.export.child.goodDeliveryNote.child.updatedAt',
        keyName: 'updatedAt',
        width: '150px',
        check: true,
      },
      {
        keyTitle: 'Ngày trên giấy tờ',
        keyName: 'docDate',
        width: '150px',
        check: true,
      },
      {
        keyTitle: 'Ngày đăng lên',
        keyName: 'postDate',
        width: '150px',
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
        name: 'menu.manage.warehouse.transfer',
        route: ``,
      },
      {
        name: 'Danh sách phiếu chuyển kho',
        route: `/warehouse-transfer/list-warehouse-transfer`,
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
    this.getListWTR();
  }

  async getListWTR() {
    let data = {};
    try {
      this.loading.start();
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
            wtrCode: this.dataFilter.wtrCode,
            transferRequestCode: this.dataFilter.transferRequestCode,
            exportType: this.dataFilter.exportType,
            warehouseCode: this.dataFilter.warehouseCode,
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
            note: this.dataFilter.note,
            createdAt: this.dataFilter.createdAt[0],
            createdAt2: this.dataFilter.createdAt[1],
            createdBy: this.dataFilter.createdBy,
            updatedAt: this.dataFilter.updatedAt[0],
            updatedAt2: this.dataFilter.updatedAt[1],
            sender: this.dataFilter.sender
          },
          common: this.searchGeneral,
        };
      } else {
        data = {
          pageIndex: this.page - 1,
          pageSize: this.per_page,
          filter: {
            wtrCode: this.dataFilter.wtrCode,
            transferRequestCode: this.dataFilter.transferRequestCode,
            exportType: this.dataFilter.exportType,
            warehouseCode: this.dataFilter.warehouseCode,
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
            note: this.dataFilter.note,
            createdAt: this.dataFilter.createdAt[0],
            createdAt2: this.dataFilter.createdAt[1],
            createdBy: this.dataFilter.createdBy,
            updatedAt: this.dataFilter.updatedAt[0],
            updatedAt2: this.dataFilter.updatedAt[1],
            sender: this.dataFilter.sender
          },
          common: this.searchGeneral,
        };
      }

      let resp = await this.warehouseTransferService.listWTRNote(data);
      if (resp.result.responseCode == '00') {
        this.listData = resp.data;
        this.total = resp.dataCount;
      }
    } catch (error) {
    } finally {
      this.loading.stop();
    }
  }

  clearSearchGeneral() {
    this.searchGeneral = '';
    this.getListWTR();
  }
  searchGeneralFunc() {
    this.getListWTR();
  }

  onHandleAddNew() {
    this.router.navigate([
      './warehouse-transfer/list-warehouse-transfer/add-warehouse-transfer',
    ]);
  }

  onClickCheckBox(column: any) { }

  id = -1;
  onResize({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.columns[i].width = width + 'px';
    });
  }

  search() {
    this.getListWTR();
  }
  clear(row: any) {
    this.dataFilter[row.keyName] = '';
    this.getListWTR();
  }
  enterSearch($event: any) {
    if ($event.keyCode == 13) {
      this.getListWTR();
    }
  }
  rangeDate() {
    this.getListWTR();
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
    let resp = await this.gdnService.approveGDN(this.dataApprove.wtrCode);
    if (resp.result.responseCode == '00') {
      this.modalConfirmApprove = false;
      this.getListWTR();
      this.messageService.success(`${resp.result.message}`, ` Thành công`);
    } else {
      this.messageService.warning(`${resp.result.message}`, ` Thất bại`);
    }
  }

  onHandleView(row: any) {
    this.router.navigate([
      `/warehouse-transfer/list-warehouse-transfer-note/warehouse-transfer-note-detail/${row.wtrCode}`,
    ]);
  }

  // Xử lý modal thu hồi
  gdnRevoke: any = '';
  onHandleRecalL(row: any) {
    this.gdnRevoke = row.wtrCode;
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
      this.getListWTR();
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
