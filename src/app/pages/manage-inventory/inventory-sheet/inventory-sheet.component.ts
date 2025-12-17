import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { KeycloakService } from 'keycloak-angular';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CheckRoleService } from 'src/app/services/checkRole.service';
import { MessageService } from 'src/app/services/message.service';
import { TransferDataService } from 'src/app/services/transferData.service';
import jwt_decode from 'jwt-decode';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { InventoryService } from 'src/app/services/manage-inventory/inventory.service';

@Component({
  selector: 'app-inventory-sheet',
  templateUrl: './inventory-sheet.component.html',
  styleUrls: ['./inventory-sheet.component.css'],
})
export class InventorySheetComponent implements OnInit {
  param: string | undefined = '';
  choose: string = '';
  token: any = '';
  checkGroupsInTokenKeeper: boolean = false;
  checkGroupsInTokenAdmin: boolean = false;
  checkGroupsInTokenChiefAccountant: boolean = false;
  checkGroupsInTokenWarehouseManager: boolean = false;

  filterInventory: any = {
    requestAt: [],
    createdAt: [],
    updatedAt: [],
  };

  listInventory: any[] = [];

  listStatus: any[] = [];
  listWarehouse: any[] = [];
  listInventoryType: any[] = [];
  listProcessed: any[] = [];

  page: number = 1;
  perPage: number = 10;
  total: number = 1;
  searchGeneral: string = '';
  sortProperty: string = 'updatedAt';
  sortOrder: string = 'DESC';

  breadcrumbs: Object[] = [
    {
      name: 'sidebar.inventory.name',
      route: ``,
    },
    {
      name: 'sidebar.inventory.child.inventorySheetList.name',
      route: `/manage-inventory/inventory-sheet-list`,
    },
  ];

  allChecked: boolean = false;
  indeterminate: boolean = true;

  constructor(
    private messageService: MessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private loading: NgxUiLoaderService,
    private checkRole: CheckRoleService,
    private transferData: TransferDataService,
    private keycloakService: KeycloakService,
    private inventoryService: InventoryService
  ) {
    let encodedToken;
    this.getToken().then(() => {
      encodedToken = this.getDecodedAccessToken(this.token);
      this.checkGroupsInTokenKeeper =
        encodedToken.groups.includes('/WMS_GROUP_KEEPER');
      this.checkGroupsInTokenAdmin =
        encodedToken.groups.includes('/WMS_GROUP_ADMIN');
      this.checkGroupsInTokenChiefAccountant = encodedToken.groups.includes(
        '/WMS_GROUP_CHIEF-ACCOUNTANT'
      );
      this.checkGroupsInTokenWarehouseManager = encodedToken.groups.includes(
        '/WMS_GROUP_WAREHOUSE-MANAGER'
      );

      this.listStatus = [
        {
          text: 'Từ chối',
          value: 1,
        },
        {
          text: 'Chờ xử lý',
          value: 2,
        },
        {
          text: 'Đã xử lý',
          value: 3,
        },
      ];
    }
    );
    this.listInventoryType = [
      {
        text: 'Kiểm kê định kỳ',
        value: 0,
      },
      {
        text: 'Kiểm kê hàng tuần',
        value: 1,
      },
      {
        text: 'Kiểm kê hàng ngày',
        value: 2,
      },
      {
        text: 'Kiểm kê hàng tháng',
        value: 3,
      },
      {
        text: 'Kiểm kê hàng quý',
        value: 4,
      },
      {
        text: 'Kiểm kê hàng năm',
        value: 5,
      },
    ];
    this.listProcessed = [
      {
        text: 'Đã xử lý',
        value: true,
      },
      {
        text: 'Chưa xử lý',
        value: false,
      },
    ];
    this.param = this.activatedRoute.snapshot.routeConfig?.path;
    if (this.param == 'inventory-sheet-list-pending') {
      this.choose = 'pending';
      this.onHandleFetchDataPending();
    } else {
      this.choose = 'all';
      this.onHandleFetchData();
    }
  }

  ngOnInit(): void { this.getListWarehouse() }

  async getListWarehouse() {
    let dataRequest = {
      pageIndex: 0,
      pageSize: 0,
      common: '',
      filter: {
        warehouseId: null,
        warehouseCode: null,
        warehouseName: null,
        description: null,
        status: null,
      },
      sortOrder: 'DESC',
      sortProperty: 'createdAt',
    };
    let res = await this.inventoryService.getListWarehouse(dataRequest);
    if (res.result.responseCode == '00') {
      this.listWarehouse = res.data;
    }
  }

  async onHandleFetchData() {
    this.loading.start();
    let dataRequest = {
      pageIndex: this.page - 1,
      pageSize: this.perPage,
      common: this.searchGeneral,
      filter: {
        ...this.filterInventory,
        requestAt: this.filterInventory.requestAt
          ? this.filterInventory.requestAt[0]
          : null,
        requestAt2: this.filterInventory.requestAt
          ? this.filterInventory.requestAt[1]
          : null,
        createdAt: this.filterInventory.createdAt
          ? this.filterInventory.createdAt[0]
          : null,
        createdAt2: this.filterInventory.createdAt
          ? this.filterInventory.createdAt[1]
          : null,
        updatedAt: this.filterInventory.updatedAt
          ? this.filterInventory.updatedAt[0]
          : null,
        updatedAt2: this.filterInventory.updatedAt
          ? this.filterInventory.updatedAt[0]
          : null,
      },
      sortOrder: this.sortOrder,
      sortProperty: this.sortProperty,
    };
    let res = await this.inventoryService.getListInventorySheet(dataRequest);
    if (res.result.responseCode == '00') {
      this.loading.stop();
      this.listInventory = res.data;
      this.total = res.dataCount;
    } else {
      this.loading.stop();
    }
  }

  async onHandleFetchDataPending() {
    this.loading.start();
    let dataRequest = {
      pageIndex: this.page - 1,
      pageSize: this.perPage,
      common: this.searchGeneral,
      filter: {
        ...this.filterInventory,
        requestAt: this.filterInventory.requestAt
          ? this.filterInventory.requestAt[0]
          : null,
        requestAt2: this.filterInventory.requestAt
          ? this.filterInventory.requestAt[1]
          : null,
        createdAt: this.filterInventory.createdAt
          ? this.filterInventory.createdAt[0]
          : null,
        createdAt2: this.filterInventory.createdAt
          ? this.filterInventory.createdAt[1]
          : null,
        updatedAt: this.filterInventory.updatedAt
          ? this.filterInventory.updatedAt[0]
          : null,
        updatedAt2: this.filterInventory.updatedAt
          ? this.filterInventory.updatedAt[0]
          : null,
        status: 2,
      },
      sortOrder: this.sortOrder,
      sortProperty: this.sortProperty,
    };
    let res = await this.inventoryService.getListInventorySheet(dataRequest);
    if (res.result.responseCode == '00') {
      this.loading.stop();
      this.listInventory = res.data;
      this.total = res.dataCount;
    } else {
      this.loading.stop();
    }
  }

  onHandleSearchCommon() {
    if (this.choose == 'all') {
      this.onHandleFetchData();
    } else {
      this.onHandleFetchDataPending();
    }
  }

  onHandleEnterSearch($event: any) {
    if ($event.keyCode == 13) {
      if (this.choose == 'all') {
        this.onHandleFetchData();
      } else {
        this.onHandleFetchDataPending();
      }
    }
  }

  onHandleClickSearch() {
    if (this.choose == 'all') {
      this.onHandleFetchData();
    } else {
      this.onHandleFetchDataPending();
    }
  }

  onHandlePagination(event: any) {
    this.page = event.page;
    this.perPage = event.size;
    if (this.choose == 'all') {
      this.onHandleFetchData();
    } else {
      this.onHandleFetchDataPending();
    }
  }

  onHandleClearInput(keyName: string) {
    this.filterInventory[keyName] = '';
    if (this.choose == 'all') {
      this.onHandleFetchData();
    } else {
      this.onHandleFetchDataPending();
    }
  }

  clearSearchGeneral() {
    this.searchGeneral = '';
    if (this.choose == 'all') {
      this.onHandleFetchData();
    } else {
      this.onHandleFetchDataPending();
    }
  }

  onHandleCreateNewSheetInventory() {
    this.router.navigate(['./manage-inventory/new-inventory-sheet-list']);
  }

  onHandleReadInventory(row: any) {
    this.router.navigate([`./manage-inventory/inventory-sheet-list/${row.inventoryFormCode}`]);
  }

  onHandleApproveInventory(row: any) {
    this.dataInformation = row;
    this.isOpenConfirmApproval = true;
  }

  visibleRevoke: boolean = false;
  dataInformation: any = {};
  onHandleRevokeInventory(row: any) {
    this.dataInformation = row;
    this.visibleRevoke = true;
  }
  isShowPopupConfirmRevoke: boolean = false;
  onHandleCancelReason() {
    this.isShowPopupConfirmRevoke = true;
  }
  onHandleCancelPopup(event: any) {
    this.isShowPopupConfirmRevoke = event;
  }
  onHandleCloseModalRevoke(data: any) {
    if (!data) {
      this.visibleRevoke = data;
      this.onHandleFetchData();
    }
  }
  visibleRefusal: boolean = false;
  onHandleRefuseInventoryRequest(row: any) {
    this.dataInformation = row;
    this.visibleRefusal = true;
  }
  isShowPopupConfirmRefusal: boolean = false;
  onHandleCancelReasonRefusal() {
    this.isShowPopupConfirmRefusal = true;
  }
  onHandleCloseModalRefusal(data: any) {
    if (!data) {
      this.visibleRefusal = data;
      this.onHandleFetchData();
    }
  }
  onHandleConfirmPopup(event: any) {
    this.visibleRevoke = event;
  }
  onHandleConfirmPopupRefusal(event: any) {
    this.visibleRefusal = event;
  }
  onHandleCancelPopupRefusal(event: any) {
    this.isShowPopupConfirmRefusal = event;
  }

  isOpenConfirmApproval: boolean = false;
  async onConfirmOrderProcessing() {
    let dataRequest = {
      id: this.dataInformation.id,
      recallReason: '',
      refusalReason: '',
      conclusion: this.dataInformation.conclusion,
    };
    let res = await this.inventoryService.changeStatusInventorySheet(
      dataRequest,
      3
    );
    if (res.result.responseCode == 0) {
      this.router.navigate(['./manage-inventory/inventory-sheet-list']);
      this.onHandleFetchData();
    }
  }
  onHandleClickCheckBox() {
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

  id = -1;
  onResize({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.columns[i].width = width + 'px';
    });
  }

  customSortFunction(sortColumn: any) {
    sortColumn.count = sortColumn.count + 1;
    // this.countSort = this.countSort + 1;
    if (sortColumn.count % 2 == 1) {
      sortColumn.sortOrder = 'DESC';
    } else {
      sortColumn.sortOrder = 'ASC';
    }
    this.sortOrder = sortColumn.sortOrder;
    this.sortProperty = sortColumn.keyName;
    this.onHandleFetchData();
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

  checkIsRole(role: string) {
    return this.checkRole.checkRole(role);
  }

  columns: any[] = [
    {
      keyTitle:
        'sidebar.inventory.child.inventorySheetList.list.inventoryFormCode',
      keyName: 'inventoryFormCode',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.inventory.child.inventorySheetList.list.inventoryType',
      keyName: 'inventoryType',
      width: '180px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.inventory.child.inventorySheetList.list.warehouseName',
      keyName: 'warehouseName',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.inventory.child.inventorySheetList.list.requesterName',
      keyName: 'requesterName',
      width: '200px',
      check: false,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.inventory.child.inventorySheetList.list.conclusion',
      keyName: 'conclusion',
      width: '200px',
      check: false,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.inventory.child.inventorySheetList.list.isProcessed',
      keyName: 'isProcessed',
      width: '200px',
      check: false,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.inventory.child.inventorySheetList.list.createdBy',
      keyName: 'createdBy',
      width: '200px',
      check: false,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.inventory.child.inventorySheetList.list.createdAt',
      keyName: 'createdAt',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.inventory.child.inventorySheetList.list.updatedAt',
      keyName: 'updatedAt',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    }
  ];
}
