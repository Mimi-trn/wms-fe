import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { TransferDataService } from 'src/app/services/transferData.service';
import jwt_decode from 'jwt-decode';
import { KeycloakService } from 'keycloak-angular';
import { CheckRoleService } from 'src/app/services/checkRole.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'src/app/services/message.service';
import { InventoryService } from 'src/app/services/manage-inventory/inventory.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-read-inventory-request',
  templateUrl: './read-inventory-request.component.html',
  styleUrls: ['./read-inventory-request.component.css'],
})
export class ReadInventoryRequestComponent implements OnInit {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private transferData: TransferDataService,
    private checkRole: CheckRoleService,
    private keycloakService: KeycloakService,
    private loading: NgxUiLoaderService,
    private message: MessageService,
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
    this.param = this.activatedRoute.snapshot.params['id'];
    this.getListWarehouse();
  }

  token: any = {};
  checkGroupsInTokenKeeper: boolean = false;
  checkGroupsInTokenChiefAccountant: boolean = false;
  checkGroupsInTokenWarehouseManager: boolean = false;
  checkGroupsInTokenAdmin: boolean = false;
  checkGroupsInFcimAdmin: boolean = false;
  filterInventoryClient: any = {};
  filterInventoryServer: any = {};

  dataInformation: any = {};

  listItemFromClient: any[] = [];
  listItemFromServer: any[] = [];
  listInventoryType: any[] = [];
  listWarehouse: any[] = [];
  listStatus: any[] = [];

  visiblePopOver: boolean = false;
  checked = false;
  indeterminate = false;
  listOfCurrentPageData: readonly any[] = [];
  setOfCheckedId = new Set<any>();

  pageItem: number = 1;
  perPageItem: number = 10;
  totalItem: number = 10;
  hasRecall: boolean = false;
  hasRefusal: boolean = false;

  param: string = '';

  visibleRevoke: boolean = false;
  visibleRefusal: boolean = false;
  isShowPopupConfirmRevoke: boolean = false;
  isShowPopupConfirmRefusal: boolean = false;

  ngOnInit() {
    this.onHandleFetchData();
    this.getListItemWithInventoryFormCode();
  }

  async onHandleFetchData() {
    let dataRequest = {
      pageIndex: 0,
      pageSize: 0,
      filter: {
        inventoryRequestCode: this.param,
      },
      common: null,
      sortProperty: null,
      sortOrder: null,
    };
    let res = await this.inventoryService.getListIventoryRequest(dataRequest);
    if (res.result.responseCode == '00') {
      let dataResponse = res.data[0];
      if (dataResponse.requestAt) {
        this.dataInformation = {
          ...dataResponse,
          requestAt: new Date(dataResponse.requestAt),
          createdAt: new Date(dataResponse.createdAt),
          updatedAt: new Date(dataResponse.updatedAt),
        };
      } else {
        this.dataInformation = {
          ...dataResponse,
          requestAt: '',
          createdAt: new Date(dataResponse.createdAt),
          updatedAt: new Date(dataResponse.updatedAt),
        };
      }
      if (dataResponse.recallReason) {
        this.hasRecall = true;
      }
      if (dataResponse.refusalReason) {
        this.hasRefusal = true;
      }
      if (this.dataInformation.warehouseId) {
        this.getListItemWithWarheouse(this.dataInformation.warehouseId);
      }
    }
  }

  async getListItemWithInventoryFormCode() {
    let dataRequest = {
      pageIndex: 0,
      pageSize: 0,
      common: '',
      filter: {
        id: null,
        productCode: null,
        itemName: null,
        description: null,
        uom: null,
        inventoryRequestCode: this.param,
        inventoryFormCode: null,
        inventoryStatus: null,
      },
      sortOrder: 'DESC',
      sortProperty: 'createdAt',
    };
    let res = await this.inventoryService.getListItemWithInventoryFormCode(
      dataRequest
    );
    if (res.result.responseCode == '00') {
      console.log(res.data);

      this.listItemFromClient = res.data;
      this.listItemFromClient.forEach((element) => {
        this.setOfCheckedId.add(element.productCode);
      });
      this.onHandleTotalRemainQuantity();
    }
  }

  onHandleChangeSelectWarehouse($event: any) {
    this.getListItemWithWarheouse($event);
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

  async getListItemWithWarheouse(warehouse: any) {
    this.loading.start();
    if (this.dataInformation.warehouseId != warehouse) {
      this.listItemFromServer = [];
      this.listItemFromClient = [];
      this.setOfCheckedId.clear();
    }
    let dataRequest = {
      pageIndex: this.pageItem - 1,
      pageSize: this.perPageItem,
      common: '',
      filter: {
        productCode: this.filterInventoryServer.productCode,
        proName: this.filterInventoryServer.proName,
        techName: this.filterInventoryServer.proName,
        unit: this.filterInventoryServer.unit,
        warehouseId: warehouse,
      },
      sortOrder: null,
      sortProperty: null,
    };
    let res = await this.inventoryService.getListItemWithWarehouse(dataRequest);
    if (res.result.responseCode == '00') {
      this.listItemFromServer = res.data;
      this.totalItem = res.dataCount;
      this.loading.stop();
    } else {
      this.message.error(` Không có hàng hóa trong kho`, ` Thông báo`);
    }
  }

  onHandlePagination(event: any) {
    this.pageItem = event.page;
    this.perPageItem = event.size;
    this.getListItemWithWarheouse(this.dataInformation.warehouseId);
  }

  onHandleEnterSearchItem($event: any) {
    if ($event.keyCode == 13) {
      this.getListItemWithWarheouse(this.dataInformation.warehouseId);
    }
  }

  onHandleSearchItem() {
    this.getListItemWithWarheouse(this.dataInformation.warehouseId);
  }

  onHandleClearInputServer(keyName: string) {
    this.filterInventoryServer[keyName] = '';
    this.getListItemWithWarheouse(this.dataInformation.warehouseId);
  }

  onHandleClose() {
    this.router.navigate(['./manage-inventory/inventory-request']);
  }

  async onHandleDraft() {
    if (this.listItemFromClient.length == 0) {
      this.message.warning(` Bạn chưa chọn hàng hóa`, ` Cảnh báo`);
    } else {
      let dataRequest = {
        id: this.dataInformation.id,
        inventoryRequestCode: this.dataInformation.inventoryRequestCode,
        warehouseId: this.dataInformation.warehouseId,
        inventoryType: this.dataInformation.inventoryType,
        requesterId: null,
        requestAt: new Date(this.dataInformation.requestAt),
        refusalReason: null,
        recallReason: null,
        content: this.dataInformation.content,
        status: 0,
        itemList: this.listItemFromClient,
      };
      let res = await this.inventoryService.updateInventoryRequest(dataRequest);
      if (res.result.responseCode == '00') {
        this.message.success(` ${res.result.message}`, ` Thành công`);
        this.router.navigate(['./manage-inventory/inventory-request']);
      } else {
        this.message.error(` ${res.result.message}`, ` Lỗi`);
      }
    }
  }

  async onHandleSave() {
    if (this.listItemFromClient.length == 0) {
      this.message.warning(` Bạn chưa chọn hàng hóa`, ` Cảnh báo`);
    } else if (this.dataInformation.inventoryType == null) {
      this.message.warning(` Bạn chưa chọn loại kiểm kê`, ` Cảnh báo`);
    } else if (this.dataInformation.warehouseId == null) {
      this.message.warning(` Bạn chưa chọn kho`, ` Cảnh báo`);
    } else {
      let dataRequest = {
        id: this.dataInformation.id,
        inventoryRequestCode: this.dataInformation.inventoryRequestCode,
        warehouseId: this.dataInformation.warehouseId,
        inventoryType: this.dataInformation.inventoryType,
        requesterName: this.dataInformation.requesterName,
        requesterId: null,
        requestAt: new Date(this.dataInformation.requestAt),
        refusalReason: null,
        recallReason: null,
        content: this.dataInformation.content,
        status: 1,
        itemList: this.listItemFromClient,
      };
      let res = await this.inventoryService.updateInventoryRequest(dataRequest);
      if (res.result.responseCode == '00') {
        this.message.success(` ${res.result.message}`, ` Thành công`);
        this.router.navigate(['./manage-inventory/inventory-request']);
      } else {
        this.message.error(` ${res.result.message}`, ` Lỗi`);
      }
    }
  }

  onHandleRevoke() {
    this.visibleRevoke = true;
  }

  onHandleRefusal() {
    this.visibleRefusal = true;
  }

  onHandleSendInventory() {
    this.transferData.setInventory(this.dataInformation);
    this.router.navigate(['./manage-inventory/new-inventory-sheet-list']);
  }

  onHandleCancelReason() {
    this.isShowPopupConfirmRevoke = true;
  }
  onHandleCancelReasonRefusal() {
    this.isShowPopupConfirmRefusal = true;
  }
  onHandleCloseModalRevoke(data: any) {
    if (!data) {
      this.visibleRevoke = data;
    }
  }
  onHandleCloseModalRefusal(data: any) {
    if (!data) {
      this.visibleRefusal = data;
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
  onHandleExportExcel() {
    Swal.fire(
      'Thông báo',
      'Tạm thời chưa phát triển tính năng này',
      'question'
    );
  }

  onHandleDeleteItem(row: any) {
    this.totalRemainQuantity -= row.remainQuantity;
    this.setOfCheckedId.delete(row.productCode);
    return (this.listItemFromClient = this.listItemFromClient.filter(
      (obj) => obj.productCode !== row.productCode
    ));
  }

  onHandleClearInput(keyName: string) {
    this.filterInventoryClient[keyName] = '';
  }

  onHandleVisiblePopOver() {
    this.visiblePopOver = true;
  }

  onHandleChangeVisiblePopOver(event: any) {
    this.visiblePopOver = event;
  }

  id = -1;
  onResize({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.columns[i].width = width + 'px';
    });
  }

  totalRemainQuantity: number = 0;
  onHandleTotalRemainQuantity() {
    this.totalRemainQuantity = this.listItemFromClient.reduce(
      (sum, item) => sum + parseFloat(item.remainQuantity),
      0
    );
  }

  // Xử lý bảng danh sách hàng hóa lấy từ server
  idColumn = -1;
  onResizeItemFromServer({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.idColumn);
    this.idColumn = requestAnimationFrame(() => {
      this.columnItemFromServer[i].width = width + 'px';
    });
  }

  updateCheckedSet(id: any, checked: boolean): void {
    let arrTemp: any[] = [];
    arrTemp = JSON.parse(JSON.stringify(this.listItemFromClient));
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
      arrTemp = arrTemp.filter((element: any) => {
        return element.productCode != id;
      });
    }

    this.setOfCheckedId.forEach((element) => {
      this.listItemFromServer.forEach((item) => {
        if (
          item.productCode == element &&
          !arrTemp.find((ele: any) => {
            return ele.productCode == element;
          })
        ) {
          arrTemp.push({
            productCode: item.productCode,
            itemName: item.itemName,
            description: item.description,
            uom: item.uom,
            remainQuantity: item.remainQuantity,
          });
        }
      });
    });
    this.listItemFromClient = arrTemp;
    this.onHandleTotalRemainQuantity();
  }

  clickRow(item: any) {
    item.rowCheck = !item.rowCheck;
    this.updateCheckedSet(item.productCode, item.rowCheck);
    this.refreshCheckedStatus();
  }

  onItemChecked(item: any, checked: boolean): void {
    this.updateCheckedSet(item.productCode, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(value: boolean): void {
    this.listOfCurrentPageData.forEach((item) => {
      this.updateCheckedSet(item.productCode, value);
    });
    this.refreshCheckedStatus();
  }

  onCurrentPageDataChange($event: readonly any[]): void {
    this.listOfCurrentPageData = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfCurrentPageData.every((item) =>
      this.setOfCheckedId.has(item.productCode)
    );
    this.indeterminate =
      this.listOfCurrentPageData.some((item) =>
        this.setOfCheckedId.has(item.productCode)
      ) && !this.checked;
  }

  //
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

  breadcrumbs: Object[] = [
    {
      name: 'sidebar.inventory.name',
      route: ``,
    },
    {
      name: 'sidebar.inventory.child.inventoryRequest.name',
      route: `/manage-inventory/inventory-request`,
    },
    {
      name: 'sidebar.inventory.child.inventoryRequest.list.read',
      route: ``,
    },
  ];

  columns: any[] = [
    {
      keyTitle: 'listProduct.productCode',
      keyName: 'productCode',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'listProduct.productName',
      keyName: 'itemName',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    // {
    //   keyTitle: 'listProduct.description',
    //   keyName: 'description',
    //   width: '200px',
    //   check: true,
    //   count: 0,
    //   sortOrder: '',
    // },
    {
      keyTitle: 'listProduct.uom',
      keyName: 'uom',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'listProduct.inventory.remainQuantity',
      keyName: 'remainQuantity',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
  ];

  columnItemFromServer: any[] = [
    {
      keyTitle: 'listProduct.productCode',
      keyName: 'productCode',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'listProduct.productName',
      keyName: 'itemName',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'listProduct.description',
      keyName: 'description',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'listProduct.uom',
      keyName: 'uom',
      width: '140px',
      check: true,
      count: 0,
      sortOrder: '',
    },
  ];
}
