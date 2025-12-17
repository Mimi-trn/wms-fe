import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CheckRoleService } from 'src/app/services/checkRole.service';
import { InventoryService } from 'src/app/services/manage-inventory/inventory.service';
import { MessageService } from 'src/app/services/message.service';
import { TransferDataService } from 'src/app/services/transferData.service';

@Component({
  selector: 'app-create-inventory-request',
  templateUrl: './create-inventory-request.component.html',
  styleUrls: ['./create-inventory-request.component.css'],
})
export class CreateInventoryRequestComponent implements OnInit {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private transferData: TransferDataService,
    private inventoryService: InventoryService,
    private loading: NgxUiLoaderService,
    private message: MessageService,
    private checkRole: CheckRoleService
  ) {
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

  filterInventoryClient: any = {};
  filterInventoryServer: any = {};

  dataInformation: any = {};

  listItemFromClient: any[] = [];
  listItemFromServer: any[] = [];

  listInventoryType: any[] = [];
  listWarehouse: any[] = [];

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
      name: 'sidebar.inventory.child.inventoryRequest.list.new',
      route: `/manage-inventory/inventory-request/new`,
    },
  ];

  visiblePopOver: boolean = false;
  checked = false;
  indeterminate = false;
  listOfCurrentPageData: readonly any[] = [];
  setOfCheckedId = new Set<any>();

  pageItem: number = 1;
  perPageItem: number = 10;
  totalItem: number = 0;

  ngOnInit() {
    this.getListWarehouse();
  }
  checkIsRole(role: string) {
    return this.checkRole.checkRole(role);
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
    const warehouseCode = this.listWarehouse.find((item) => item.warehouseId === warehouse)?.warehouseCode;
    if (this.dataInformation.warehouse != warehouse) {
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
        itemName: this.filterInventoryServer.itemName,
        description: this.filterInventoryServer.description,
        uom: this.filterInventoryServer.uom,
        warehouseCode: warehouseCode,
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
    this.getListItemWithWarheouse(this.dataInformation.warehouse);
  }

  onHandleEnterSearchItem($event: any) {
    if ($event.keyCode == 13) {
      this.getListItemWithWarheouse(this.dataInformation.warehouse);
    }
  }

  onHandleSearchItem() {
    this.getListItemWithWarheouse(this.dataInformation.warehouse);
  }

  onHandleClearInputServer(keyName: string) {
    this.filterInventoryServer[keyName] = '';
    this.getListItemWithWarheouse(this.dataInformation.warehouse);
  }

  onHandleClose() {
    this.router.navigate(['./manage-inventory/inventory-request']);
  }

  async onHandleDraft() {
    if (this.listItemFromClient.length == 0) {
      this.message.warning(` Bạn chưa chọn hàng hóa`, ` Cảnh báo`);
    } else {
      let dataRequest = {
        inventoryRequestCode: null,
        warehouseId: this.dataInformation.warehouse,
        inventoryType: this.dataInformation.inventoryType,
        requesterId: null,
        requestAt: this.dataInformation.requestAt,
        refusalReason: null,
        recallReason: null,
        content: this.dataInformation.content,
        status: 0,
        itemList: this.listItemFromClient,
      };
      let res = await this.inventoryService.createNewInventoryRequest(
        dataRequest
      );
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
    } else if (this.dataInformation.warehouse == null) {
      this.message.warning(` Bạn chưa chọn kho`, ` Cảnh báo`);
    } else {
      let dataRequest = {
        inventoryRequestCode: null,
        warehouseId: this.dataInformation.warehouse,
        inventoryType: this.dataInformation.inventoryType,
        requesterId: null,
        requestAt: new Date(this.dataInformation.requestAt),
        refusalReason: null,
        recallReason: null,
        content: this.dataInformation.content,
        status: 1,
        itemList: this.listItemFromClient,
      };
      let res = await this.inventoryService.createNewInventoryRequest(
        dataRequest
      );
      if (res.result.responseCode == '00') {
        this.message.success(` ${res.result.message}`, ` Thành công`);
        this.router.navigate(['./manage-inventory/inventory-request']);
      } else {
        this.message.error(` ${res.result.message}`, ` Lỗi`);
      }
    }
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
      keyTitle: 'Tồn kho theo hệ thống',
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
      width: '140px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'Tồn kho theo hệ thống',
      keyName: 'remainQuantity',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
  ];
}
