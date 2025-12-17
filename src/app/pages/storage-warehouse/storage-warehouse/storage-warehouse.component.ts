import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { KeycloakService } from 'keycloak-angular';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CheckRoleService } from 'src/app/services/checkRole.service';
import { GrnService } from 'src/app/services/import-warehouse/GRN/grn.service';
import { ReceiptCommonService } from 'src/app/services/import-warehouse/common/receipt-common.service';
import { MessageService } from 'src/app/services/message.service';
import jwt_decode from 'jwt-decode';

@Component({
  selector: 'app-storage-warehouse',
  templateUrl: './storage-warehouse.component.html',
  styleUrls: ['./storage-warehouse.component.css'],
})
export class StorageWarehouseComponent implements OnInit {
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
  token: any = '';
  checkGroupsInTokenQcer: boolean = false;
  checkGroupsInTokenKeeper: boolean = false;
  checkGroupsInTokenSaler: boolean = false;
  checkGroupsInFcimAdmin: boolean = false;
  checkGroupsInTokenAdmin: boolean = false;
  constructor(
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    private loading: NgxUiLoaderService,
    private activatedRoute: ActivatedRoute,
    private receiptCommonService: ReceiptCommonService,
    private checkRole: CheckRoleService,
    private grnService: GrnService,
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
    this.listStatus = [];
    this.listImportType = [
      { text: 'Nhập kho mua hàng', value: 1 },
      { text: 'Nhập kho thành phẩm', value: 2 },
      { text: 'Nhập kho NVL dư thừa', value: 3 },
      {
        text: 'Nhập kho hàng ký gửi',
        value: 4,
      },
      {
        text: 'Nhập kho hàng bán bị trả lại',
        value: 5,
      },
      { text: 'Nhập kho khác', value: 6 },
    ];
  }
  params: any = '';
  sortOrder: any = 'descend';
  sortProperty: any = 'updatedAt';

  checkIsRole(role: string) {
    return this.checkRole.checkRole(role);
  }

  async getWarehouse() {
    let resp = await this.receiptCommonService.getWarehouse();
    if (resp.result.responseCode == '00') {
      resp.data.forEach((element: any) => {
        this.listWarehouse.push({
          text: element.warehouseName,
          value: element.warehouseCode,
        });
      });
    } else {
      this.messageService.error(`${resp.result.message}`, `Lỗi`);
    }
  }

  async getData(page: any, per_page: any) {
    if (this.choose == 1) {
      this.loading.start();
      let data = {
        pageSize: per_page,
        pageIndex: page - 1,
        common: this.searchGeneral,
        sortOrder: this.sortOrder,
        sortProperty: this.sortProperty,
        filter: {
          grnCode: this.dataFilter.grnCode,
          importRequestCode: this.dataFilter.importRequestCode,
          importType: this.dataFilter.importType,
          poCode: this.dataFilter.poCode,
          deliveryAt: this.dataFilter.deliveryAt[0],
          deliveryAt2: this.dataFilter.deliveryAt[1],
          shipper: this.dataFilter.shipper,
          consignmentContractCode: this.dataFilter.consignmentContractCode,
          customerCode: this.dataFilter.customerCode,
          customerName: this.dataFilter.customerName,
          customerAddress: this.dataFilter.customerAddress,
          customerPhone: this.dataFilter.customerPhone,
          contractCreatedAt: this.dataFilter.contractCreatedAt[0],
          contractCreatedAt2: this.dataFilter.contractCreatedAt[1],
          numberOfWarehouse: this.dataFilter.numberOfWarehouse,
          returnReceiptCode: this.dataFilter.returnReceiptCode,
          soCode: this.dataFilter.soCode,
          woCode: this.dataFilter.woCode,
          createdAt: this.dataFilter.createdAt[0],
          createdAt2: this.dataFilter.createdAt[1],
          createdBy: this.dataFilter.createdBy,
          updatedAt: this.dataFilter.updatedAt[0],
          updatedAt2: this.dataFilter.updatedAt[1],
          updatedBy: this.dataFilter.updatedBy,
          note: this.dataFilter.note,
          status: this.dataFilter.status,
          approverName: this.dataFilter.approverName,
          approverCode: this.dataFilter.approverCode,
        },
      };
      let resp = await this.grnService.getPending(data);
      if (resp.result.responseCode == '00') {
        this.loading.stop();
        this.datas = resp.data;
        this.total = resp.dataCount;
      } else {
        this.loading.stop();
        this.messageService.error(`${resp.result.message}`, `Lỗi`);
        this.router.navigate(['./welcome']);
      }
    } else {
      this.loading.start();
      let data = {
        pageSize: per_page,
        pageIndex: page - 1,
        common: this.searchGeneral,
        sortOrder: this.sortOrder,
        sortProperty: this.sortProperty,
        filter: {
          grnCode: this.dataFilter.grnCode,
          importRequestCode: this.dataFilter.importRequestCode,
          importType: this.dataFilter.importType,
          poCode: this.dataFilter.poCode,
          deliveryAt: this.dataFilter.deliveryAt[0],
          deliveryAt2: this.dataFilter.deliveryAt[1],
          shipper: this.dataFilter.shipper,
          consignmentContractCode: this.dataFilter.consignmentContractCode,
          customerCode: this.dataFilter.customerCode,
          customerName: this.dataFilter.customerName,
          customerAddress: this.dataFilter.customerAddress,
          customerPhone: this.dataFilter.customerPhone,
          contractCreatedAt: this.dataFilter.contractCreatedAt[0],
          contractCreatedAt2: this.dataFilter.contractCreatedAt[1],
          numberOfWarehouse: this.dataFilter.numberOfWarehouse,
          returnReceiptCode: this.dataFilter.returnReceiptCode,
          soCode: this.dataFilter.soCode,
          woCode: this.dataFilter.woCode,
          createdAt: this.dataFilter.createdAt[0],
          createdAt2: this.dataFilter.createdAt[1],
          createdBy: this.dataFilter.createdBy,
          updatedAt: this.dataFilter.updatedAt[0],
          updatedAt2: this.dataFilter.updatedAt[1],
          updatedBy: this.dataFilter.updatedBy,
          note: this.dataFilter.note,
          status: this.dataFilter.status,
          approverName: this.dataFilter.approverName,
          approverCode: this.dataFilter.approverCode,
        },
      };
      let resp = await this.grnService.getList(data);
      if (resp.result.responseCode == '00') {
        this.loading.stop();
        this.datas = resp.data;
        this.total = resp.dataCount;
      } else {
        this.loading.stop();
        this.messageService.error(`${resp.result.message}`, `Lỗi`);
        this.router.navigate(['./welcome']);
      }
    }
  }

  ngOnInit() {
    this.params = this.activatedRoute.snapshot.routeConfig?.path;
    if (this.params == 'good-receipt-note-pending') {
      this.choose = 1;
    } else {
      this.choose = 0;
    }
    this.listStatus = [
      { text: 'Chờ lưu kho', value: 1 },
      { text: 'Lưu kho', value: 2 },
    ];

    // this.translateService.get('menu.manage.receipt.list').subscribe((text) => {
    //   this.title.setTitle(text);
    // });
    this.getWarehouse().then(() => {
      this.columns = [
        {
          keyTitle: 'ui.receipt.GRN.grn_code',
          keyName: 'grnCode',
          width: '160px',
          check: true,
          count: 0,
          sortOrder: '',
        },
        {
          keyTitle: 'ui.receipt.GRN.import_request_code',
          keyName: 'importRequestCode',
          width: '180px',
          check: true,
          count: 0,
          sortOrder: '',
        },
        {
          keyTitle: 'ui.receipt.GRN.import_type',
          keyName: 'importType',
          width: '200px',
          check: true,
          count: 0,
          sortOrder: '',
        },
        
        {
          keyTitle: 'ui.receipt.GRN.po_code',
          keyName: 'poCode',
          width: '140px',
          check: true,
          count: 0,
          sortOrder: '',
        },
        {
          keyTitle: 'ui.receipt.GRN.wo_code',
          keyName: 'woCode',
          width: '140px',
          check: true,
          count: 0,
          sortOrder: '',
        },
        {
          keyTitle: 'ui.receipt.GRN.po_arrived_at',
          keyName: 'poArrivedAt',
          width: '230px',
          check: false,
          count: 0,
          sortOrder: '',
        },
        {
          keyTitle: 'ui.receipt.GRN.shipper',
          keyName: 'shipper',
          width: '200px',
          check: false,
          count: 0,
          sortOrder: '',
        },
        {
          keyTitle: 'ui.receipt.GRN.contract_code',
          keyName: 'consignmentContractCode',
          width: '200px',
          check: true,
          count: 0,
          sortOrder: '',
        },
        {
          keyTitle: 'ui.receipt.GRN.customer_code',
          keyName: 'customerCode',
          width: '200px',
          check: false,
          count: 0,
          sortOrder: '',
        },
        {
          keyTitle: 'ui.receipt.GRN.customer_name',
          keyName: 'customerName',
          width: '200px',
          check: false,
          count: 0,
          sortOrder: '',
        },
        {
          keyTitle: 'ui.receipt.GRN.customer_address',
          keyName: 'customerAddress',
          width: '200px',
          check: false,
          count: 0,
          sortOrder: '',
        },
        {
          keyTitle: 'ui.receipt.GRN.customer_phonenumber',
          keyName: 'customerPhoneNumber',
          width: '200px',
          check: false,
          count: 0,
          sortOrder: '',
        },
        {
          keyTitle: 'ui.receipt.GRN.contract_createdAt',
          keyName: 'contractCreatedAt',
          width: '230px',
          check: false,
          count: 0,
          sortOrder: '',
        },
        {
          keyTitle: 'ui.receipt.GRN.create_by',
          keyName: 'createdBy',
          width: '200px',
          check: false,
          count: 0,
          sortOrder: '',
        },

        {
          keyTitle: 'ui.receipt.GRN.create_at',
          keyName: 'createdAt',
          width: '230px',
          check: false,
          count: 0,
          sortOrder: '',
        },
        {
          keyTitle: 'ui.receipt.GRN.update_at',
          keyName: 'updatedAt',
          width: '230px',
          check: false,
          count: 0,
          sortOrder: '',
        },
        {
          keyTitle: 'ui.receipt.GRN.approved_by',
          keyName: 'approverName',
          width: '180px',
          check: true,
          count: 0,
          sortOrder: '',
        },
        {
          keyTitle: 'ui.receipt.GRN.note',
          keyName: 'note',
          width: '200px',
          check: false,
          count: 0,
          sortOrder: '',
        },
        {
          keyTitle: 'table.status',
          keyName: 'status',
          width: '200px',
          check: true,
          count: 0,
          sortOrder: '',
        },
      ];
    });
    this.getData(this.page, this.per_page);

    this.setBreadcrumb();
  }
  // Hàm xử lý sự kiện breadscrumb
  setBreadcrumb() {
    this.breadcrumbs = [
      {
        name: 'menu.manage.receipt',
        route: ``,
      },
      {
        name: 'menu.manage.good.receipt.note',
        route: `/manage-warehouse-receipt/good-receipt-note`,
      },
    ];
    this.isBreadcrumb = true;
  }

  // Hàm tìm kiếm chung
  searchGeneralFunc() {
    this.getData(this.page, this.per_page);
  }

  // Hàm thêm mới yêu cầu nhập kho
  onClickAddNew() {
    this.router.navigate([
      './manage-warehouse-receipt/create-good-receipt-note',
    ]);
  }

  async rangeDate() {
    this.getData(this.page, this.per_page);
  }

  // Hàm thêm cột
  onClickAddColumn() {}

  // Hàm xử lý checkbox
  onClickCheckBox(event: any) {}

  // Hàm xử lý sự kiện onResize
  id = -1;
  onResize({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.columns[i].width = width + 'px';
    });
  }

  // Hàm xử lý xem chi tiết yêu cầu nhập kho
  onHandleView(row: any) {
    this.router.navigate([
      `./manage-warehouse-receipt/good-receipt-note/view-GRN/${row.grnCode}`,
    ]);
  }

  async onHandleSave(row: any) {
    let res = await this.grnService.changeStatus(row.grnCode);
    if (res.result.responseCode == '00') {
      this.messageService.success(`${res.result.message}`, ` Thông báo`);
      this.getData(this.page, this.per_page);
    } else {
      this.messageService.error(`${res.result.message}`, ` Thông báo`);
    }
  }

  grnRevoke: any = '';
  async onHandleRecall(row: any) {
    let resp = await this.grnService.reCall(row.grnCode, 0, {});
    if (resp.result.responseCode == '00') {
      this.messageService.success(`${resp.result.message}`, `Thành công`);
      this.getData(this.page, this.per_page);
    } else {
      this.messageService.error(`${resp.result.message}`, `Lỗi`);
    }
    this.visibleRevoke = true;
    this.grnRevoke = row.grnCode;
  }

  dataClick: any;
  async onHandleApproval(row: any) {
    this.dataClick = row;
    this.showModalApprove = true;
  }

  showModalApprove: boolean = false;

  clear(column: any) {
    this.dataFilter[column.keyName] = '';
    this.getData(this.page, this.per_page);
  }

  onHandleModalCancel(event: any) {
    this.showModalApprove = event;
  }

  async onHandleModalConfirm(event: any) {
    if (event) {
      let resp = await this.grnService.reCall(this.dataClick.grnCode, 2, {});
      if (resp.result.responseCode == '00') {
        this.messageService.success(`${resp.result.message}`, `Thành công`);
        this.getData(this.page, this.per_page);
      } else {
        this.messageService.error(`${resp.result.message}`, `Lỗi`);
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

  // hàm xử lý hủy yêu cầu nhập kho
  onHandleDestroy(row: any) {}

  // Hàm xử lý sự kiện phân trang
  pagination(event: any) {
    this.page = event.page;
    this.per_page = event.size;
    this.getData(event.page, event.size);
  }

  // Hàm xử lý sự kiện tìm kiếm ở các dòng
  search() {
    this.getData(this.page, this.per_page);
  }

  enterSearch($event: any) {
    if ($event.keyCode == 13) {
      this.getData(this.page, this.per_page);
    }
  }
  // Xử lý sự kiện sort filter pagi

  changeSelect(event: any) {
    this.choose = event;
    this.getData(this.page, this.per_page);
  }
  choose: any = 1;
  listImportType: any[] = [];
  listWarehouse: any[] = [];
  listStatus: any[] = [];

  // Value
  columns: any[] = [];
  datas: any[] = [];
  isBreadcrumb: boolean = false;
  isHidden: boolean = true;
  breadcrumbs: Object[] = [];
  searchGeneral: string = '';
  page: number = 1;
  per_page: number = 10;
  total: number = 0;
  dataFilter: any = {
    deliveryAt: [],
    contractCreatedAt: [],
    createdAt: [],
    updatedAt: [],
  };

  // Xử lý modal từ chối
  isVisibleCancel: boolean = false;
  // Hàm xử lý trả lại
  onClickCancel() {
    this.isVisibleCancel = true;
  }
  onHandleCancelPopup(event: any) {
    this.isVisibleCancel = event;
  }

  onHandleConfirmPopup(event: any) {
    this.visibleRevoke = event;
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

  // Xử lý modal thu hồi
  visibleRevoke: boolean = false;
  onClickCancelRevoke() {
    this.isVisibleCancel = true;
  }
}
