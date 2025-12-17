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
import { SoService } from 'src/app/services/manage-information/so/so.service';
import { MessageService } from 'src/app/services/message.service';
import { TransferDataService } from 'src/app/services/transferData.service';
import { WarehouseTransferService } from 'src/app/services/warehouse-transfer/warehouse-transfer.service';
import jwt_decode from 'jwt-decode';
import * as moment from 'moment';
@Component({
  selector: 'app-add-warehouse-transfer',
  templateUrl: './add-warehouse-transfer.component.html',
  styleUrls: ['./add-warehouse-transfer.component.css'],
})
export class AddWarehouseTransferComponent implements OnInit {
  isBreadcrumb: boolean = false;
  isHidden: boolean = true;
  breadcrumbs: Object[] = [];
  dataInformation: any = {};
  listExportType: any[] = [];
  listWarehouse: any[] = [];
  showWoCode: boolean = false;
  listWo: any[] = [];
  dataFilterWoCode: any = {
    startAt: [],
    endAt: [],
    updatedAt: [],
  };
  dataFilterReceiverCode: any = {};

  totalReceiver: any = 0;
  pageReceiver: any = 1;
  perPageReceiver: any = 10;
  // Đơn hàng
  showProductOrderCode: boolean = false;
  listProductOrderCode: any[] = [];
  dataFilterProductOrderCode: any = {};
  totalProductOrderCode: any = 100;
  pageProductOrderCode: any = 1;
  perPageProductOrderCode: any = 10;
  // Danh sách hàng hóa
  columns: any[] = [];
  dataItems: any[] = [];
  countTotalQuantityUnexported: number = 0;
  countTotalQuantityRequest: number = 0;
  countTotalQuantityOpen: number = 0;
  dataFilterProduct: any = {};
  visiblePopup: boolean = false;
  listItem: any[] = [];
  checked = false;
  indeterminate = false;
  listOfCurrentPageData: readonly any[] = [];
  setOfCheckedId = new Set<any>();
  dataDraft: any[] = [];
  filterChildItems: any = {};
  pageItem: any = 1;
  perPageItem: any = 10;
  totalItem: any = 0;

  // Kiểm tra tồn tại quyền
  token: any = '';
  checkGroupsInTokenQCER: boolean = false;
  checkGroupsInTokenSaler: boolean = false;
  checkGroupsInTokenKeeper: boolean = false;
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
    private exportRequestService: ExportRequestService,
    private soService: SoService,
    private warehouseTransferService: WarehouseTransferService
  ) {}

  checkIsRole(role: string) {
    return this.checkRole.checkRole(role);
  }

  ngOnInit() {
    let data = this.transferData.getObj();
    if (Object.keys(data).length > 0) {
      this.dataInformation = data;
    }

    this.calculateTotalQuantityRequest();
    this.calculateTotalQuantityUnexported();
    this.calculateTotalQuantityRemain();
    this.setBreadcrumb();
    this.getListReceiver();
    this.getWarehouse();
    this.getItemsOfOtherExport();
    this.columns = [
      {
        keyTitle: 'Mã hàng hóa',
        keyName: 'itemCode',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'Tên hàng hóa',
        keyName: 'itemName',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'Kho nguồn',
        keyName: 'warehouseCode',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'Kho đích',
        keyName: 'toWarehouseCode',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'Đơn vị tính',
        keyName: 'unit',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'Số lượng yêu cầu',
        keyName: 'requestQuantity',
        width: '200px',
        check: true,
      },
    ];
  }

  listReceiver: any[] = [];
  async getListReceiver() {
    let dataRequest = {
      pageNumber: this.pageReceiver - 1,
      pageSize: this.perPageReceiver,
      filter: {
        receiverCode: this.dataFilterReceiverCode.receiverCode,
        receiverNode: this.dataFilterReceiverCode.receiverNode,
      },
      common: '',
      sortProperty: 'id',
      sortOrder: 'DESC',
    };
    let res = await this.exportRequestService.getListReceiver(dataRequest);
    if (res) {
      if (res.result.responseCode == '00') {
        console.log(res.data);

        this.listReceiver = res.data;
        this.totalReceiver = res.dataCount;
      } else {
        this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
      }
    } else {
      this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
    }
  }

  showReceiver: boolean = false;
  showReceiverList() {
    this.showReceiver = true;
    this.paginationReceiver({ page: 1, size: 10 });
  }
  showSender: boolean = false;
  showSenderList() {
    this.showSender = true;
    this.paginationReceiver({ page: 1, size: 10 });
  }
  isSender = true;
  popoverVisibleChangeReceiver(event: any) {
    this.showReceiver = event;
    this.isSender = false;
  }
  popoverVisibleChangeSender(event: any) {
    this.showSender = event;
    this.isSender = true;
  }

  filterSearchReceiver($event: any) {
    if ($event.keyCode == 13) {
      this.getListReceiver();
    } else if ($event.type == 'click') {
      this.getListReceiver();
    }
  }
  /** Xử ls chọn nhân viên*/
  chooseReceiver(data: any) {
    if (this.isSender) {
      this.dataInformation.senderCode = data.receiverCode;
      this.showSender = false;
      this.dataInformation.senderName = data.receiverName;
    } else {
      this.dataInformation.receiverCode = data.receiverCode;
      this.showReceiver = false;
      this.dataInformation.receiverName = data.receiverName;
    }
  }

  paginationReceiver(event: any) {
    this.pageReceiver = event.page;
    this.perPageReceiver = event.size;
    this.getListReceiver();
  }
  id = -1;
  onResize({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.columns[i].width = width + 'px';
    });
  }

  calculateTotalQuantityUnexported() {
    this.countTotalQuantityUnexported = this.dataItems.reduce(
      (sum, item) => sum + parseFloat(item.unexportedQuantity),
      0
    );
  }
  countTotalQuantityRemain: number = 0;
  calculateTotalQuantityRemain() {
    this.countTotalQuantityRemain = this.dataItems.reduce(
      (sum, item) => sum + parseFloat(item.remainQuantity),
      0
    );
  }

  calculateTotalQuantityRequest() {
    this.countTotalQuantityRequest = this.dataItems.reduce(
      (sum, item) => sum + parseFloat(item.requestQuantity),
      0
    );
  }
  countTotalQuantityRequestItemsProduct: number = 0;
  calculateTotalQuantityRequestItemsProduct() {
    this.countTotalQuantityRequest = this.dataItems.reduce(
      (sum, item) => sum + parseFloat(item.requestQuantity),
      0
    );
  }

  clear(keyName: any) {
    this.dataFilterProduct[keyName] = '';
  }

  onHandleQuantityRequest(row: any) {
    this.calculateTotalQuantityRequest();
  }

  onHandleVisiblePopup() {
    this.visiblePopup = true;
  }

  changeVisible(event: any) {
    this.visiblePopup = event;
  }

  updateCheckedSet(id: any, checked: boolean): void {
    let arrTemp: any[] = [];
    arrTemp = JSON.parse(JSON.stringify(this.dataItems));
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
      arrTemp = arrTemp.filter((element: any) => {
        return element.id != id;
      });
    }
    this.setOfCheckedId.forEach((element) => {
      this.listItem.forEach((item) => {
        if (
          item.id == element &&
          !arrTemp.find((ele: any) => {
            return ele.id == element;
          })
        ) {
          arrTemp.push({
            id: item.id,
            productCode: item.productCode,
            itemName: item.itemName,
            description: item.itemName,
            unit: item.uom,
            unexportedQuantity: item.unexportedQuantity,
            remainQuantity: item.remainQuantity,
            // requestQuantity: 0,
            requestQuantity: item.unexportedQuantity,
          });
        }
      });
    });
    this.dataItems = arrTemp;
    this.calculateTotalQuantityUnexported();
    this.calculateTotalQuantityRequest();
    this.calculateTotalQuantityRemain();
  }

  clickRow(item: any) {
    item.rowCheck = !item.rowCheck;
    this.updateCheckedSet(item.id, item.rowCheck);
    this.refreshCheckedStatus();
  }

  onItemChecked(item: any, checked: boolean): void {
    this.updateCheckedSet(item.id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(value: boolean): void {
    this.listOfCurrentPageData.forEach((item) => {
      this.updateCheckedSet(item.id, value);
    });
    this.refreshCheckedStatus();
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

  paginationItem(event: any) {
    this.pageItem = event.page;
    this.perPageItem = event.size;
    this.getItemsOfOtherExport();
  }

  close() {
    this.router.navigate(['./warehouse-transfer/list-warehouse-transfer']);
  }
  fromWarehouseCodeChange(event: any) {
    // if (this.dataInformation.fromWarehouseCode !== event.value) {
    //   this.pageItemsProduct = 1;
    //   // this.getItemsOfOtherExport();
    //   // this.dataItems = [];
    //   // this.setOfCheckedIdItemsProduct.clear();
    // }
  }
  itemCode = '';
  itemName = '';
  async getItemsOfOtherExport() {
    try {
      this.loading.start();
      let dataTemp: any = [];
      let data = {
        common: '',
        pageIndex: this.pageItemsProduct - 1,
        pageSize: this.perPageItemsProduct,
        sortProperty: '',
        sortOrder: '',
        filter: {
          itemCode: this.itemCode,
          itemName: this.itemName,
        },
      };
      let resp = await this.warehouseTransferService.getProduct(data);
      if (resp.result.responseCode == '00') {
        if (resp.data?.content?.length <= 0) {
          this.messageService.warning(`Kho không có hàng hóa`, `Cảnh báo`);
        }
        resp.data?.content?.forEach((element: any) => {
          dataTemp.push({
            ...element,
            unit: element.uom,
          });
        });
        this.listItemsProduct = dataTemp;
        this.totalItemsProduct = resp?.data?.totalElements;
      } else {
        this.messageService.warning(
          `Lấy danh sách hàng hóa thất bại`,
          `Cảnh báo`
        );
      }
    } catch (error) {
      this.messageService.warning(
        `Lấy danh sách hàng hóa thất bại`,
        `Cảnh báo`
      );
    } finally {
      this.loading.stop();
    }
  }

  modalConfirmSave: boolean = false;
  async save() {
    if (
      !this.dataInformation.fromWarehouseCode ||
      !this.dataInformation.toWarehouseCode ||
      !this.dataInformation.sendedDate ||
      !this.dataInformation.receivedDate ||
      !this.dataInformation.senderName ||
      !this.dataInformation.receiverName
    ) {
      this.messageService.warning(`Vui lòng nhập đầy đủ thông tin`, `Cảnh báo`);
      return;
    } else if (this.dataItems.length <= 0) {
      this.messageService.warning('Danh sách hàng hóa rỗng', `Cảnh báo`);
      return;
    } else if (
      this.dataInformation.fromWarehouseCode ==
      this.dataInformation.toWarehouseCode
    ) {
      this.messageService.warning(
        'Kho nguồn và kho đích phải khác nhau',
        `Cảnh báo`
      );
      return;
    } else {
      let check = true;
      this.dataItems.forEach((element) => {
        if (!element.requestQuantity || element.requestQuantity <= 0)
          check = false;
      });
      if (check) {
        this.modalConfirmSave = true;
      } else {
        this.messageService.warning(
          'Số lượng yêu cầu phải nhỏ hơn số lượng tồn kho',
          `Cảnh báo`
        );
      }
    }
  }

  onHandleModalCancelSave(event: any) {
    this.modalConfirmSave = event;
  }

  async onHandleModalConfirmSave() {
    try {
      this.loading.start();
      let dataItemSend: any[] = [];
      this.dataItems.forEach((element) => {
        dataItemSend.push({
          itemCode: element?.itemCode,
          itemName: element?.itemName,
          fromWarehouseCode: this.dataInformation?.fromWarehouseCode,
          toWarehouseCode: this.dataInformation?.toWarehouseCode,
          uom: element?.uom,
          requestQuantity: element?.requestQuantity,
        });
      });
      let data = {
        transferRequestDTO: {
          receiver: this.dataInformation?.receiverName,
          sender: this.dataInformation?.senderName,
          fromWarehouseCode: this.dataInformation?.fromWarehouseCode,
          toWarehouseCode: this.dataInformation?.toWarehouseCode,
          transferDate: this.dataInformation?.sendedDate,
          receivedDate: this.dataInformation?.receivedDate,
          note: this.dataInformation?.note || '',
          wtrTypeId: this.dataInformation?.wtrTypeId || '',
          createdBy: this.keycloakService.getUsername(),
        },
        items: dataItemSend,
      };
      let resp = await this.warehouseTransferService.newTransferRequest(data);
      if (resp.result.responseCode == '00') {
        this.messageService.success(`${resp.result.message}`, `Thành công`);
        this.router.navigate(['./warehouse-transfer/list-warehouse-transfer']);
        this.modalConfirmSave = false;
      } else {
        this.messageService.error(`${resp.result.message}`, `Lỗi`);
      }
    } catch (error) {
      this.messageService.error(error, ' Thông báo');
    } finally {
      this.loading.stop();
    }
  }

  deleteRecord(row: any) {
    this.clickRowItemsProduct(row);
  }

  setBreadcrumb() {
    this.breadcrumbs = [
      {
        name: 'sidebar.transfer.name',
        route: ``,
      },
      {
        name: 'sidebar.transfer.child.transferRequest.child.list',
        route: `/warehouse-transfer/list-warehouse-transfer`,
      },
      {
        name: 'sidebar.transfer.child.transferRequest.child.create',
        route: `/warehouse-transfer/list-warehouse-transfer/add-warehouse-transfer`,
      },
    ];
    this.isBreadcrumb = true;
  }

  async getWarehouse() {
    let res = await this.commonService.getWarehouse();
    if (res) {
      if (res.result.responseCode == '00') {
        res.data.forEach((element: any) => {
          let data = {
            text: element.warehouseName,
            value: element.warehouseCode,
          };
          this.listWarehouse.push(data);
        });
      } else {
        this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
      }
    } else {
      this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
    }
  }
  clearReceiver(keyName: string) {
    this.dataFilterReceiverCode[keyName] = '';
    this.getListReceiver();
  }
  /** Xử lý thông tin bảng khách hàng (Xuất kho thành phẩm)*/
  listCustomer: any[] = [];
  filterCustomer: any = {};
  totalCustomer: any = 0;
  pageCustomer: any = 1;
  perPageCustomer: any = 10;
  showCustomerCode: boolean = false;
  isShowListItemsProduct: boolean = false;
  listItemsProduct: any[] = [];
  dataItemsProduct: any[] = [];
  listOfCurrentPageDataItemsProduct: readonly any[] = [];
  checkedItemsProduct: boolean = false;
  indeterminateItemsProduct: boolean = false;
  setOfCheckedIdItemsProduct = new Set<any>();
  pageItemsProduct: any = 1;
  perPageItemsProduct: any = 10;
  totalItemsProduct: any = 0;
  filterItemsProduct: any = {
    startAt: [],
    endAt: [],
    deliveryAt: [],
  };

  /** Hàm xử lý sự kiện checkbox */
  updateCheckedSetItemsProduct(id: any, checked: boolean): void {
    if (checked) {
      const product = this.listItemsProduct.find((item: any) => item?.id == id);
      if (product) {
        this.setOfCheckedIdItemsProduct.add(id);
        this.dataItems = [...this.dataItems, product];
      }
    } else {
      this.setOfCheckedIdItemsProduct.delete(id);
      this.dataItems = this.dataItems.filter(
        (element: any) => element?.id != id
      );
    }
    this.calculateTotalQuantityRequestItemsProduct();
  }
  clickRowItemsProduct(item: any) {
    const checked = this.setOfCheckedIdItemsProduct.has(item.id);
    if (checked) {
      item['itemCheck'] = false;
      this.updateCheckedSetItemsProduct(item.id, false);
    } else {
      item['itemCheck'] = true;
      this.updateCheckedSetItemsProduct(item.id, true);
    }
    this.refreshCheckedStatusItemsProduct();
  }

  onItemCheckedItemsProduct(item: any, checked: boolean): void {
    this.updateCheckedSetItemsProduct(item.id, checked);
    this.refreshCheckedStatusItemsProduct();
  }
  onAllCheckedItemsProduct(value: boolean): void {
    this.listOfCurrentPageDataItemsProduct.forEach((item) => {
      this.updateCheckedSetItemsProduct(item.id, value);
    });
    this.refreshCheckedStatusItemsProduct();
  }
  onCurrentPageDataChangeItemsProduct($event: readonly any[]): void {
    this.listOfCurrentPageDataItemsProduct = $event;
    this.refreshCheckedStatusItemsProduct();
  }
  refreshCheckedStatusItemsProduct(): void {
    this.checkedItemsProduct = this.listOfCurrentPageDataItemsProduct.every(
      (item) => this.setOfCheckedIdItemsProduct.has(item.uid)
    );
    this.indeterminateItemsProduct =
      this.listOfCurrentPageDataItemsProduct.some((item) =>
        this.setOfCheckedIdItemsProduct.has(item.uid)
      ) && !this.checkedItemsProduct;
  }

  onHandleShowItemsProduct() {
    this.isShowListItemsProduct = true;
  }
  onHandleChangeShowItemsProduct(event: any) {
    this.isShowListItemsProduct = event;
  }
  async onHandleGetListCustomer() {
    let dataRequest = {
      pageNumber: this.pageCustomer - 1,
      pageSize: this.perPageCustomer,
      sortProperty: null,
      sortOrder: null,
      filter: {
        customerCode: this.filterCustomer.customerCode
          ? this.filterCustomer.customerCode
          : null,
        customerName: this.filterCustomer.customerName
          ? this.filterCustomer.customerName
          : null,
        customerPhone: this.filterCustomer.customerPhone
          ? this.filterCustomer.customerPhone
          : null,
        address: this.filterCustomer.address
          ? this.filterCustomer.address
          : null,
      },
    };
    let resp = await this.exportRequestService.getListCustomer(dataRequest);
    if (resp) {
      if (resp.result.responseCode == '00') {
        this.listCustomer = resp.data;
        this.totalCustomer = resp.dataCount;
      } else {
        this.messageService.error(` Có lỗi xảy ra`, ` Thông báo`);
      }
    } else {
      this.messageService.error(` Có lỗi xảy ra`, ` Thông báo`);
    }
  }
  filterSearchCustomer($event: any) {
    if ($event.keyCode == 13) {
      this.onHandleGetListCustomer();
    } else if ($event.type == 'click') {
      this.onHandleGetListCustomer();
    }
  }
  clearCustomer(keyName: any) {
    this.filterCustomer[keyName] = '';
    this.onHandleGetListCustomer();
  }
  chooseCustomer(row: any) {
    this.showCustomerCode = false;
    this.dataInformation.customerCode = row.customerCode;
    this.dataInformation.customerName = row.customerName;
    this.dataInformation.customerPhone = row.customerPhone;
    this.dataInformation.address = row.address;

    this.setOfCheckedId.clear();
    this.dataItems = [];
  }
  paginationCustomer(event: any) {
    this.pageCustomer = event.page;
    this.perPageCustomer = event.size;
    this.onHandleGetListCustomer();
  }
  paginationItemsProduct(event: any) {
    this.pageItemsProduct = event.page;
    this.perPageItemsProduct = event.size;
    this.getItemsOfOtherExport();
  }
  showPopoverCustomerCode() {
    this.showCustomerCode = true;
  }
  popoverVisibleChangeCustomerCode(event: any) {
    this.showCustomerCode = event;
  }
  listOfRadioButton: string[] = ['button.detail', 'Biên bản xác nhận'];
  choose: number = 1;
  changeSelect(event: any) {
    this.choose = event;
  }

  ngOnDestroy(): void {
    this.transferData.setObject({});
  }
}
