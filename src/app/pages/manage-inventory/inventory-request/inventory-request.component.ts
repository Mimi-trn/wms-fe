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
  selector: 'app-inventory-request',
  templateUrl: './inventory-request.component.html',
  styleUrls: ['./inventory-request.component.css'],
})
export class InventoryRequestComponent implements OnInit {
  token: any = '';
  checkGroupsInTokenKeeper: boolean = false;
  checkGroupsInTokenChiefAccountant: boolean = false;
  checkGroupsInTokenWarehouseManager: boolean = false;
  checkGroupsInTokenAdmin: boolean = false;
  checkGroupsInFcimAdmin: boolean = false;

  filterInventory: any = {
    requestAt: [],
    createdAt: [],
    updatedAt: [],
  };

  listInventoryRequest: any[] = [];
  listStatus: any[] = [];
  listWarehouse: any[] = [];
  listInventoryType: any[] = [];

  page: number = 1;
  perPage: number = 10;
  total: number = 0;
  searchGeneral: string = '';
  sortProperty: string = 'updatedAt';
  sortOrder: string = 'descend';

  breadcrumbs: Object[] = [
    {
      name: 'sidebar.inventory.name',
      route: ``,
    },
    {
      name: 'sidebar.inventory.child.inventoryRequest.name',
      route: `/manage-inventory/inventory-request`,
    },
  ];

  allChecked: boolean = false;
  indeterminate: boolean = true;

  visibleRevoke: boolean = false;
  visibleRefusal: boolean = false;
  isShowPopupConfirmRevoke: boolean = false;
  isShowPopupConfirmRefusal: boolean = false;

  dataInformation: any = {};

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
      this.checkGroupsInTokenChiefAccountant = encodedToken.groups.includes(
        '/WMS_GROUP_CHIEF-ACCOUNTANT'
      );
      this.checkGroupsInTokenWarehouseManager = encodedToken.groups.includes(
        '/WMS_GROUP_WAREHOUSE-MANAGER'
      );
      this.checkGroupsInTokenAdmin =
        encodedToken.groups.includes('/WMS_GROUP_ADMIN');
      this.checkGroupsInFcimAdmin = encodedToken.groups.includes('/FCIM_ADMIN');
    });
    this.listStatus = [
      {
        text: 'Bản nháp',
        value: 0,
      },
      {
        text: 'Đã yêu cầu kiểm kê',
        value: 1,
      },
      {
        text: 'Đã từ chối yêu cầu',
        value: 2,
      },
      {
        text: 'Đang kiểm kê',
        value: 3,
      },
      {
        text: 'Đã kiểm kê',
        value: 4,
      },
    ];
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
  }

  ngOnInit() {
    this.getListWarehouse();
    this.onHandleFetchData();
  }

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
    this.page = 1;
    let dataRequest = {
      pageIndex: this.page - 1,
      pageSize: this.perPage,
      filter: {
        ...this.filterInventory,
        requestAt: this.filterInventory.requestAt[0],
        requestAt2: this.filterInventory.requestAt[1],
        createdAt: this.filterInventory.createdAt[0],
        createdAt2: this.filterInventory.createdAt[1],
        updatedAt: this.filterInventory.updatedAt[0],
        updatedAt2: this.filterInventory.updatedAt[1],
      },
      common: this.searchGeneral.trim(),
      sortProperty: this.sortProperty,
      sortOrder: this.sortOrder,
    };
    let res = await this.inventoryService.getListIventoryRequest(dataRequest);
    if (res.result.responseCode == '00') {
      this.listInventoryRequest = res.data;
      this.total = res.dataCount;
    }
  }

  onHandleSearchCommon() {
    this.onHandleFetchData();
  }

  onHandleEnterSearch($event: any) {
    if ($event.keyCode == 13) {
      this.onHandleFetchData();
    }
  }

  onHandleClickSearch() {
    this.onHandleFetchData();
  }

  onHandlePagination(event: any) {
    this.page = event.page;
    this.perPage = event.size;
    this.onHandleFetchData();
  }

  onHandleClearInput(keyName: string) {
    this.filterInventory[keyName] = '';
    this.onHandleFetchData();
  }

  onHandleRefuseInventoryRequest(row: any) {
    this.dataInformation = row;
    this.visibleRefusal = true;
  }

  onHandleCreateNewSheetInventory(row: any) {
    let data = row
    this.transferData.setInventory(data);
    this.router.navigate(['./manage-inventory/new-inventory-sheet-list']);
  }

  onHandleReadInventoryRequest(row: any) {
    this.router.navigate([
      `./manage-inventory/inventory-request/${row.inventoryRequestCode}`,
    ]);
  }

  onHandleRevokeInventoryRequest(row: any) {
    this.dataInformation = row;
    this.visibleRevoke = true;
  }

  onHandleCreateNewInventoryRequest() {
    this.router.navigate(['./manage-inventory/inventory-request/new']);
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
      sortColumn.sortOrder = 'descend';
    } else {
      sortColumn.sortOrder = 'ascend';
    }
    this.sortOrder = sortColumn.sortOrder;
    this.sortProperty = sortColumn.keyName;
    this.onHandleFetchData();
  }

  onHandleRevoke() {
    this.visibleRevoke = true;
  }

  onHandleRefusal() {
    this.visibleRefusal = true;
  }

  onHandleCreateInventory() { }

  onHandleCancelReason() {
    this.isShowPopupConfirmRevoke = true;
  }
  onHandleCancelReasonRefusal() {
    this.isShowPopupConfirmRefusal = true;
  }
  onHandleCloseModalRevoke(data: any) {
    if (!data) {
      this.visibleRevoke = data;
      this.onHandleFetchData();
    }
  }
  onHandleCloseModalRefusal(data: any) {
    if (!data) {
      this.visibleRefusal = data;
      this.onHandleFetchData();
    }
  }
  onHandleCancelPopup(event: any) {
    this.isShowPopupConfirmRevoke = event;
  }
  onHandleCancelPopupRefusal(event: any) {
    this.isShowPopupConfirmRefusal = event;
  }
  onHandleConfirmPopup(event: any) {
    this.visibleRevoke = event;
  }
  onHandleConfirmPopupRefusal(event: any) {
    this.visibleRefusal = event;
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
        'sidebar.inventory.child.inventoryRequest.list.inventoryRequestCode',
      keyName: 'inventoryRequestCode',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.inventory.child.inventoryRequest.list.inventoryType',
      keyName: 'inventoryType',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.inventory.child.inventoryRequest.list.warehouseName',
      keyName: 'warehouseName',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'Nội dung yêu cầu',
      keyName: 'content',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.inventory.child.inventoryRequest.list.requesterName',
      keyName: 'requesterName',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.inventory.child.inventoryRequest.list.requestAt',
      keyName: 'requestAt',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.inventory.child.inventoryRequest.list.createdAt',
      keyName: 'createdAt',
      width: '200px',
      check: false,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.inventory.child.inventoryRequest.list.updatedAt',
      keyName: 'updatedAt',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.inventory.child.inventoryRequest.list.status',
      keyName: 'status',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
  ];


}
