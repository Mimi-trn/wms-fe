import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CheckRoleService } from 'src/app/services/checkRole.service';
import { InventoryService } from 'src/app/services/manage-inventory/inventory.service';
import { MessageService } from 'src/app/services/message.service';
import { TransferDataService } from 'src/app/services/transferData.service';

interface EmployeeDTOV2 {
  id: number;
  name: string;
  position?: string;
  department?: string;
  email?: string;
}

interface InventoryFormItemDTO {
  productCode: string;
  itemName: string;
  uom: string;
  totalStockQuantity: number;
  auditQuantity: number;
  diffQuantity?: number;
}

interface InventoryFormDTO {
  id?: number;
  inventoryFormCode?: string;
  inventoryRequestId?: number;
  inventoryRequestCode?: string;
  inventoryType?: number;
  requesterName?: string;
  requestAt?: string; // ISO string
  warehouseId?: number;
  warehouseCode?: string;
  warehouseName?: string;
  refusalReason?: string;
  content?: string;
  recallReason?: string;
  isProcessed?: boolean;
  conclusion?: string;
  status?: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: Date;
  participants?: EmployeeDTOV2[];
  itemList?: InventoryFormItemDTO[];
}
@Component({
  selector: 'app-create-inventory-sheet',
  templateUrl: './create-inventory-sheet.component.html',
  styleUrls: ['./create-inventory-sheet.component.css'],
})
export class CreateInventorySheetComponent implements OnInit {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private transferData: TransferDataService,
    private inventoryService: InventoryService,
    private loading: NgxUiLoaderService,
    private message: MessageService,
    private checkRole: CheckRoleService
  ) { }

  listInventoryType = [
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

  breadcrumbs: Object[] = [
    {
      name: 'Quản lý kiểm kê kho',
      route: ``,
    },
    {
      name: 'Danh sách phiếu kiểm kê',
      route: `/manage-inventory/inventory-sheet-list`,
    },
    {
      name: 'Khai báo kiểm kê',
      route: `/manage-inventory/new-inventory-sheet-list`,
    },
  ];

  dataInformation: any = {};
  filterInventoryClient: any = {};
  filterInventoryClientItem: any = {};
  filterParticipants: any = {};
  filterParticipantsFromDB: any = {};
  inventoryRequest: any = {};
  showRequestCode: boolean = false;
  listInventoryRequestCode: any[] = [];
  listItems: any[] = [];
  listWarehouse: any[] = [];
  listParticipants: any[] = [];
  listParticipantsFromDB: any[] = [];
  showListParticipants: boolean = false;
  checked = false;
  checkedEmployee = false;
  indeterminate = false;
  listOfCurrentPageData: readonly any[] = [];
  setOfCheckedId = new Set<any>();
  setOfCheckedIdEmployee = new Set<any>();
  pageItem: number = 1;
  perPageItem: number = 10;
  totalItem: number = 0;
  ngOnInit() {
    let data = this.transferData.getInventory();
    if (Object.keys(data).length > 0) {
      console.log(data);

      this.inventoryRequest = data;
      this.dataInformation = {
        ...data,
        inventoryRequestCode: data.inventoryRequestCode,
        inventoryType: data.inventoryType,
        warehouseId: data.warehouseId,
        content: data.content,
      };
      if (data.inventoryRequestCode) {
        this.getListItemWithInventoryFormCode();
      }
    }

    this.getListWarehouse();
    this.onHandleFetchData();
    this.onHandleGetListParticipant();
  }
  onHandleClose() {
    this.router.navigate(['./manage-inventory/inventory-sheet-list']);
  }

  async onHandleSave() {

    console.log(this.dataInformation);
    // 1. Tạo object InventoryFormDTO
    const inventoryForm: InventoryFormDTO = {
      id: this.dataInformation.id || null,
      inventoryType: this.dataInformation.inventoryType,
      requesterName: this.dataInformation.requesterName || null,
      requestAt: this.dataInformation.requestAt,
      warehouseId: this.dataInformation.warehouse || null,
      content: this.dataInformation.content || '',
      conclusion: this.dataInformation.conclusion || '',
      status: this.dataInformation.status || 0,
      updatedAt: new Date(),
      participants: [],
      itemList: []
    };

    // 2. Lấy danh sách thành viên tham gia
    if (this.listParticipants && this.listParticipants.length > 0) {
      console.log("Danh sách nhân viên: " + this.listParticipants.toString);
      inventoryForm.participants = this.listParticipants.map(p => ({
        id: p.employeeId,
        name: p.employeeName
      }));
    }

    // 3. Lấy danh sách hàng hóa kiểm kê
    if (this.listItemFromClient && this.listItemFromClient.length > 0) {
      inventoryForm.itemList = this.listItemFromClient.map(item => ({
        productCode: item.productCode,
        itemName: item.itemName,
        uom: item.uom,
        totalStockQuantity: item.totalStockQuantity,
        auditQuantity: item.auditQuantity,
        diffQuantity: item.totalStockQuantity - item.auditQuantity,
        // thêm các field khác nếu có
      }));
    }

    console.log('InventoryFormDTO:', inventoryForm);
    let res = await this.inventoryService.createInventorySheet(inventoryForm);
    if (res.result.responseCode == '00') {
      this.message.success(`${res.result.message}`, ` Thông báo`);
      this.router.navigate(['./manage-inventory/inventory-sheet-list']);
    } else {
      this.message.warning(`${res.result.message}`, ` Thông báo`);
    }
  }

  onHandlePagination(event: any) {
    this.pageItem = event.page;
    this.perPageItem = event.size;
    this.onHandleGetListParticipant();
  }
  onHandlePaginationItem(event: any) {
    this.pageItem = event.page;
    this.perPageItem = event.size;
    this.getListItemWithWarheouse(this.dataInformation.warehouse);
  }
  async onHandleGetListParticipant() {
    let dataRequest = {
      pageNumber: this.pageItem - 1,
      pageSize: this.perPageItem,
      common: '',
      sortProperty: null,
      sortOrder: 'DESC',
      filter: {
        employeeCode: this.filterParticipantsFromDB.employeeCode,
        employeeName: this.filterParticipantsFromDB.employeeName,
        employeePosition: 2,
        employeePhone: this.filterParticipantsFromDB.employeePhone,
        employeeEmail: this.filterParticipantsFromDB.employeeEmail,
      },
    };
    let res = await this.inventoryService.getListParticipant(dataRequest);
    if (res.result.responseCode == '00') {
      this.listParticipantsFromDB = res.data;
      this.totalItem = res.dataCount;
    }
  }
  onHandleEnterSearchParticipant($event: any) {
    if ($event.keyCode == 13) {
      this.onHandleGetListParticipant();
    }
  }
  onHandleSearchParticipant() {
    this.onHandleGetListParticipant();
  }
  onHandleClearInputServer(keyName: string) {
    this.filterParticipantsFromDB[keyName] = '';
    this.onHandleGetListParticipant();
  }
  onHandleClearInputServerItem(keyName: string) {
    this.filterInventoryServer[keyName] = '';
    this.getListItemWithWarheouse(this.dataInformation.warehouse);
  }
  updateEmployeeCheckedSet(row: any, checkedEmployee: boolean): void {
    if (checkedEmployee) {
      this.setOfCheckedIdEmployee.add(row.id);
      console.log("nvien", row.employeeId);

      // THÊM nếu chưa có
      if (!this.listParticipants.find(p => p.employeeId === row.id)) {
        this.listParticipants.push({
          id: row.id,
          employeeName: row.employeeName,
          employeeCode: row.employeeCode,
          employeeEmail: row.employeeEmail,
          employeePhone: row.employeePhone,
          teamGroup: row.teamGroup,
          position: row.position
        });
      }

    } else {
      this.setOfCheckedIdEmployee.delete(row.id);

      this.listParticipants = this.listParticipants.filter(
        p => p.id !== row.id
      );
    }
  }

  onEmployeeChecked(item: any, checkedEmployee: boolean): void {
    this.updateCheckedSetEmployee(item.employeeId, checkedEmployee);
    this.refreshCheckedStatusEmployee();
  }

  updateCheckedSetEmployee(id: any, checkedEmployee: boolean): void {
    let arrTemp: any[] = [];
    console.log("id", id);
    if (checkedEmployee) {
      this.setOfCheckedIdEmployee.add(id);
    } else {
      this.setOfCheckedIdEmployee.delete(id);
      arrTemp = arrTemp.filter((element: any) => {
        return element.employeeId != id;
      });
    }

    this.setOfCheckedIdEmployee.forEach((element) => {
      this.listParticipantsFromDB.forEach((item) => {
        if (
          item.employeeId == element &&
          !arrTemp.find((ele: any) => {
            return ele.employeeId == element;
          })
        ) {
          arrTemp.push({
            ...item,
            employeeName: item.employeeName,
            employeeCode: item.employeeCode,
            employeeEmail: item.employeeEmail,
            employeePhone: item.employeePhone,
          });
        }
      });
    });
    console.log(arrTemp);

    this.listParticipants = arrTemp;
  }

  refreshCheckedStatusEmployee(): void {
    this.checkedEmployee = this.listOfCurrentPageData.every((item) =>
      this.setOfCheckedIdEmployee.has(item.id)
    );
    this.indeterminate =
      this.listOfCurrentPageData.some((item) =>
        this.setOfCheckedIdEmployee.has(item.id)
      ) && !this.checkedEmployee;
  }

  onAllChecked(value: boolean): void {
    this.listOfCurrentPageData.forEach((item) => {
      this.updateCheckedSet(item.id, value);
    });
    this.refreshCheckedStatus();
  }

  onAllCheckedEmployee(value: boolean): void {
    this.listOfCurrentPageData.forEach((item) => {
      this.updateCheckedSetEmployee(item.id, value);
    });
    this.refreshCheckedStatusEmployee();
  }

  onCurrentPageDataChange($event: readonly any[]): void {
    this.listOfCurrentPageData = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfCurrentPageData.every((item) =>
      this.setOfCheckedId.has(item.id)
    );
    this.indeterminate =
      this.listOfCurrentPageData.some((item) =>
        this.setOfCheckedId.has(item.id)
      ) && !this.checked;
  }

  openListParticipant() {
    this.showListParticipants = true;
  }

  closeListParticipant(event: any) {
    this.showListParticipants = event;
  }

  onHandleDeleteItem(row: any) {
    this.updateCheckedSet(row.id, false);
    this.refreshCheckedStatus();
  }

  onHandleDeleteEmployee(row: any) {
    this.updateCheckedSetEmployee(row.employeeId, false);
    this.refreshCheckedStatusEmployee();
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
        inventoryFormCode: this.dataInformation.inventoryFormCode,
        inventoryStatus: null,
      },
      sortOrder: 'DESC',
      sortProperty: 'createdAt',
    };
    let res = await this.inventoryService.getListItemWithInventoryFormCode(
      dataRequest
    );
    if (res.result.responseCode == '00') {
      this.listItems = res.data.map((item: any) => ({
        ...item,
        auditQuantity: 0,
        diffQuantity: -item.totalStockQuantity,
      }));
      this.onHandleTotalRemainQuantity();
      this.onHandleTotalDiffQuantity();
      this.onHandleTotalauditQuantity();
    }
  }

  changeauditQuantity(event: any, row: any) {
    row.diffQuantity = row.auditQuantity - row.totalStockQuantity;
    this.onHandleTotalDiffQuantity();
    this.onHandleTotalauditQuantity();
  }

  totalRemainQuantity: number = 0;
  onHandleTotalRemainQuantity() {
    this.totalRemainQuantity = this.listItems.reduce(
      (sum, item) => sum + parseFloat(item.totalStockQuantity),
      0
    );
  }

  totalauditQuantity: number = 0;
  onHandleTotalauditQuantity() {
    this.totalauditQuantity = this.listItems.reduce(
      (sum, item) => sum + parseFloat(item.auditQuantity),
      0
    );
  }

  totalDiffQuantity: number = 0;
  onHandleTotalDiffQuantity() {
    this.totalDiffQuantity = this.listItems.reduce(
      (sum, item) => sum + parseFloat(item.diffQuantity),
      0
    );
  }

  chooseInventoryRequestCode(event: any) {
    this.dataInformation = {
      ...event,
      inventoryRequestCode: event.inventoryRequestCode,
      inventoryType: event.inventoryType,
      warehouseId: event.warehouseId,
      content: event.content,
    };
    if (event.inventoryRequestCode) {
      this.getListItemWithInventoryFormCode();
    }
  }

  async onHandleFetchData() {
    let dataRequest = {
      pageIndex: 0,
      pageSize: 0,
      filter: {
        status: 1,
      },
      common: '',
      sortProperty: '',
      sortOrder: '',
    };
    let res = await this.inventoryService.getListIventoryRequest(dataRequest);
    if (res.result.responseCode == '00') {
      this.listInventoryRequestCode = res.data;
    }
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

  openTableRequestCode() {
    this.showRequestCode = true;
  }

  closeTableRequestCode(event: any) {
    this.showRequestCode = event;
  }

  compareFn = (o1: any, o2: any): boolean =>
    o1 && o2 ? o1.inventoryRequestCode === o2.inventoryRequestCode : o1 === o2;
  id = -1;
  onResize({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.columns[i].width = width + 'px';
    });
  }

  idPar = -1;
  onResizeParticipant({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.idPar);
    this.idPar = requestAnimationFrame(() => {
      this.columnParticipants[i].width = width + 'px';
    });
  }

  idParFromDB = -1;
  onResizeParticipantFromDB({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.idParFromDB);
    this.idParFromDB = requestAnimationFrame(() => {
      this.columnParticipantsFromDB[i].width = width + 'px';
    });
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
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'listProduct.inventory.remainQuantity',
      keyName: 'totalStockQuantity',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'Số lượng kiểm kê thực tế',
      keyName: 'auditQuantity',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'Số lượng chênh lệch',
      keyName: 'diffQuantity',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
  ];

  columnParticipants: any[] = [
    {
      keyTitle: 'Mã nhân viên',
      keyName: 'employeeCode',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'Tên nhân viên',
      keyName: 'employeeName',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'Vị trí',
      keyName: 'employeePosition',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'Số điện thoại',
      keyName: 'employeePhone',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'Mail',
      keyName: 'employeeEmail',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
  ];

  columnParticipantsFromDB: any[] = [
    {
      keyTitle: 'Mã nhân viên',
      keyName: 'employeeCode',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'Tên nhân viên',
      keyName: 'employeeName',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'Vị trí',
      keyName: 'employeePosition',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'Số điện thoại',
      keyName: 'employeePhone',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'Mail',
      keyName: 'employeeEmail',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
  ];

  ngOnDestroy(): void {

    this.transferData.setInventory({});
  }

  visiblePopOver: boolean = false;
  listItemFromServer: any[] = [];
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
      keyTitle: 'listProduct.uom',
      keyName: 'uom',
      width: '140px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'Tồn kho theo hệ thống',
      keyName: 'totalStockQuantity',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
  ];
  filterInventoryServer: any = {};
  listItemFromClient: any[] = [];
  auditQuantity: number = 0;

  onHandleVisiblePopOver() {
    this.visiblePopOver = true;
  }

  onHandleChangeVisiblePopOver(event: any) {
    this.visiblePopOver = event;
  }

  idColumn = -1;
  onResizeItemFromServer({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.idColumn);
    this.idColumn = requestAnimationFrame(() => {
      this.columnItemFromServer[i].width = width + 'px';
    });
  }

  onHandleChangeSelectWarehouse($event: any) {
    this.getListItemWithWarheouse($event);
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
      sortOrder: 'DESC',
      sortProperty: 'totalStockQuantity',
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

  onHandleClearInputItem(keyName: string) {
    this.filterInventoryClientItem[keyName] = '';
  }

  onHandleClearInput(keyName: string) {
    this.filterInventoryClient[keyName] = '';
  }

  onItemChecked(item: any, checked: boolean): void {
    this.updateCheckedSet(item.productCode, checked);
    this.refreshCheckedStatus();
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
            totalStockQuantity: item.totalStockQuantity,
          });
        }
      });
    });
    this.listItemFromClient = arrTemp;
    this.onHandleTotalRemainQuantity();
  }

  // Search item in pop up
  onHandleEnterSearchItem($event: any) {
    if ($event.keyCode == 13) {
      this.onHandleSearchItem(this.dataInformation.warehouse);
    }
  }
  onHandleSearchItem(warehouse: any) {
    this.getListItemWithWarheouse(warehouse);
  }
}
