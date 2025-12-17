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
import jwt_decode from 'jwt-decode';
import * as moment from 'moment';
@Component({
  selector: 'app-create-request-export',
  templateUrl: './create-request-export.component.html',
  styleUrls: ['./create-request-export.component.css'],
})
export class CreateRequestExportComponent implements OnInit {
  // Breadcrumb
  isBreadcrumb: boolean = false;
  isHidden: boolean = true;
  breadcrumbs: Object[] = [];

  // Thông tin yêu cầu xuất kho
  dataInformation: any = {};
  listExportType: any[] = [];
  listWarehouse: any[] = [];
  selectedWarehouse: any = '';
  // // Phiếu công nghệ
  // listTechnincial: any[] = [];
  // dataFilterTechCode: any = {};
  // totalTechCode: any = 0;
  // pageTechCode: any = 1;
  // perPageTechCode: any = 10;
  // Lệnh sản xuất
  showWoCode: boolean = false;
  listWo: any[] = [];
  dataFilterWoCode: any = {
    startAt: [],
    endAt: [],
    updatedAt: [],
  };
  dataFilterReceiverCode: any = {};

  totalWoCode: any = 0;
  pageWoCode: any = 1;
  perPageWoCode: any = 10;

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
  listStatusOfWo: any[] = [
    {
      text: 'Chờ lĩnh NVL',
      value: 6,
    },
    {
      text: 'Chờ sản xuất',
      value: 7,
    },
    {
      text: 'Đang sản xuất',
      value: 8,
    },
    {
      text: 'Chờ nhập kho',
      value: 9,
    },
    {
      text: 'Hoàn thành sản xuất',
      value: 10,
    },
    {
      text: 'Hoàn thành giao hàng',
      value: 11,
    },
    {
      text: 'Dừng sản xuất',
      value: 12,
    },
  ];
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
    private soService: SoService
  ) {
    let encodedToken;
    this.getToken().then(() => {
      encodedToken = this.getDecodedAccessToken(this.token);
      this.checkGroupsInTokenQCER =
        encodedToken.roles.includes('WMS_GROUP_QCER');
      this.checkGroupsInTokenSaler =
        encodedToken.roles.includes('WMS_GROUP_SALER');
      this.checkGroupsInTokenKeeper =
        encodedToken.roles.includes('WMS_GROUP_KEEPER');
      this.checkGroupsInTokenAdmin =
        encodedToken.roles.includes('WMS_GROUP_ADMIN');
      this.listExportType = [
        {
          text: 'Xuất kho sản xuất',
          value: 1,
        },
        {
          text: 'Xuất kho khác',
          value: 3,
        },
      ];
      this.dataInformation.exportType = 1;
    });
  }

  checkIsRole(role: string) {
    return this.checkRole.checkRole(role);
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

  ngOnInit() {
    let data = this.transferData.getObj();
    if (Object.keys(data).length > 0) {
      this.dataInformation = {
        ...data,
        exportType: 1,
        startAt: data.startDate ? new Date(data.startDate) : '',
        endAt: data.endDate ? new Date(data.endDate) : '',
      };

      console.log('data', data);
      this.listWMmstatus = [6, 7];
      this.wmsIsExportCompleted = '';
      if (this.dataInformation.woCode) {
        this.getListItemsMaterial();
      }
    }

    console.log('Data', data);

    this.calculateTotalQuantityRequest();
    this.calculateTotalQuantityUnexported();
    this.calculateTotalQuantityRemain();
    this.setBreadcrumb();
    this.getListReceiver();
    this.getWarehouse();
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
        keyTitle: 'Kho',
        keyName: 'warehouseCode',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'Đơn vị tính',
        keyName: 'unit',
        width: '200px',
        check: true,
      },
      // {
      //   keyTitle: 'Số lượng tồn kho',
      //   keyName: 'stockQuantity',
      //   width: '200px',
      //   check: true,
      // },
      {
        keyTitle: 'Số lượng yêu cầu',
        keyName: 'requestQuantity',
        width: '200px',
        check: true,
      },
    ];
    if (this.dataInformation.exportType == 1) {
      this.listWMmstatus = [6, 7, 8];
      this.wmsIsExportCompleted = false;
    }
    if (this.dataInformation.exportType == 2) {
      this.listWMmstatus = [10];
      this.wmsIsExportCompleted = '';
    }
    this.onHandleFetchListWo();
    // this.onHandleGetListCustomer();
    // this.getListItemsProduct();
  }

  /**
   * Thông tin người nhân hàng
   */
  listReceiver: any[] = [];
  async getListReceiver() {
    let dataRequest = {
      pageNumber: this.pageReceiver - 1,
      pageSize: this.perPageReceiver,
      filter: {
        receiverCode: this.dataFilterReceiverCode.receiverCode,
        // receiverNode: this.dataFilterReceiverCode.receiverNode,
        receiverName: this.dataFilterReceiverCode.receiverName,
      },
      common: '',
      sortProperty: 'id',
      sortOrder: 'DESC',
    };

    let res = await this.exportRequestService.getListReceiver(dataRequest);
    if (res) {
      if (res.result.responseCode == '00') {
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
  }
  /** Lấy danh sách WO */
  listWMmstatus: any[] = [];
  wmsIsExportCompleted: any = '';
  async onHandleFetchListWo() {
    try {
      this.loading.start();

      let dataRequest = {
        pageNumber: this.pageWoCode - 1,
        pageSize: this.perPageWoCode,
        filter: {
          // workOrderParentId: -1,
          // statusList: [0, 1, 2],
          wmsIsExportCompleted: this.wmsIsExportCompleted,
          wmsStatusSearch: this.listWMmstatus,
          woCode: this.dataFilterWoCode.woCode,
          status: this?.dataFilterWoCode?.status || null,
          productCode: this.dataFilterWoCode.productCode,
          totalLotNumber: this.dataFilterWoCode.totalLotNumber,
          startDateFrom: this.dataFilterWoCode.startAt[0]
            ? moment(this.dataFilterWoCode.startAt[0]).format('YYYY-MM-DD')
            : '',
          startDateTo: this.dataFilterWoCode.startAt[1]
            ? moment(this.dataFilterWoCode.startAt[1]).format('YYYY-MM-DD')
            : '',
          endDateFrom: this.dataFilterWoCode.endAt[0]
            ? moment(this.dataFilterWoCode.endAt[0]).format('YYYY-MM-DD')
            : '',
          endDateTo: this.dataFilterWoCode.endAt[1]
            ? moment(this.dataFilterWoCode.endAt[1]).format('YYYY-MM-DD')
            : '',
          createdBy: this.dataFilterWoCode.createdBy,
          updateDateFrom: this.dataFilterWoCode.updatedAt[0],
          updateDateTo: this.dataFilterWoCode.updatedAt[1],
        },
        common: '',
        sortProperty: 'updatedAt',
        sortOrder: 'DESC',
      };

      console.log('Data infor', this.dataInformation);

      let res = await this.exportRequestService.getListWo(dataRequest);
      if (res) {
        if (res.result.responseCode == '00') {
          this.listWo = res.data.content;
          this.totalWoCode = res.data.totalElements;
        } else {
          this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
        }
      } else {
        this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
      }
    } catch (error) {
      this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
    } finally {
      this.loading.stop();
    }
  }

  /** Danh sách hàng hóa theo xuất kho sản xuất (NVL) */
  async getListItemsMaterial() {
    this.loading.start();
    try {
      let dataRequest = {
        pageIndex: this.pageItem - 1,
        pageSize: this.perPageItem,
        filter: {
          productCode: this.filterChildItems.productCode,
          itemName: this.filterChildItems.proName,
          description: this.filterChildItems.description,
          uom: this.filterChildItems.unit,
          woCode: this.dataInformation.woCode,
          // warehouseCode: this.dataInformation.warehouseCode
          exportTypeId: this.dataInformation.exportTypeId,
        },
        common: '',
        sortProperty: 'updatedAt',
        sortOrder: 'descend',
      };

      let res = await this.exportRequestService.getListItemWithExportMaterial(
        dataRequest
      );
      if (res) {
        if (res.result.responseCode == '00') {
          // this.listItem = res.data;
          this.listItem = res.data.map((x: any) => ({
            ...x,
            requestQuantity: x.quantity,
          }));
          this.totalItem = res.dataCount;
        } else {
          this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
        }
      } else {
        this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
      }
    } catch (error) {
      this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
    } finally {
      this.loading.stop();
    }
  }

  showPopoverWoCode() {
    this.showWoCode = true;
  }

  popoverVisibleChangeWoCode(event: any) {
    this.showWoCode = event;
    console.log('event', event);
  }
  popoverVisibleChangeReceiver(event: any) {
    this.showReceiver = event;
  }
  filterSearchWoCode($event: any) {
    if ($event.keyCode == 13) {
      this.onHandleFetchListWo();
    } else if ($event.type == 'click') {
      this.onHandleFetchListWo();
    }
  }

  onChangeSelectSearchWoCode($event: any) {
    if ($event.keyCode == 13) {
      this.onHandleFetchListWo();
    } else if ($event.type == 'click') {
      this.onHandleFetchListWo();
    }
  }

  filterSearchReceiver($event: any) {
    if ($event.keyCode == 13) {
      this.getListReceiver();
    } else if ($event.type == 'click') {
      this.getListReceiver();
    }
  }

  /** Xử lý chức năng chọn WO */
  chooseWoCode(row: any) {
    console.log("chose");
    this.showWoCode = false;
    this.dataInformation.id = row.id;
    this.dataInformation.woCode = row.woCode;
    this.dataInformation.lotId = row.lotId;
    this.dataInformation.lotNumber = row.lotNumber;
    this.dataInformation.productCode = row.productCode;
    this.dataInformation.productName = row.productName;
    this.dataInformation.quantity = row.quantity;
    this.dataInformation.startAt = row.startDate ? new Date(row.startDate) : '';
    this.dataInformation.endAt = row.endDate ? new Date(row.endDate) : '';
    this.dataInformation.customerName = row.customerName;

    this.dataItems = [];
    this.setOfCheckedId.clear();
    if (this.dataInformation.exportType == 1) {
      this.getListItemsMaterial();
    } else if (this.dataInformation.exportType == 2) {
      this.getListItemsProduct();
    }
  }

  /** Xử ls chọn nhân viên*/
  chooseReceiver(data: any) {
    this.dataInformation.receiverCode = data.receiverCode;
    this.showReceiver = false;
    this.dataInformation.receiverName = data.receiverName;
    console.log('data information', this.dataInformation);
  }

  rangeDate() { }
  paginationReceiver(event: any) {
    this.pageReceiver = event.page;
    this.perPageReceiver = event.size;
    this.getListReceiver();
  }
  paginationWoCode(event: any) {
    this.pageWoCode = event.page;
    this.perPageWoCode = event.size;
    this.onHandleFetchListWo();
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

  updateCheckedSet(productCode: any, checked: boolean): void {
    if (checked) {
      const product = this.listItem.find(
        (item: any) => item?.itemCode == productCode
      );
      if (product) {
        this.setOfCheckedId.add(productCode);
        this.dataItems = [
          ...this.dataItems,
          { ...product, proName: product.itemName, unit: product?.uom },
        ];
      }
    } else {
      this.setOfCheckedId.delete(productCode);
      this.dataItems = this.dataItems.filter(
        (element: any) => element?.itemCode != productCode
      );
    }
    this.calculateTotalQuantityUnexported();
    this.calculateTotalQuantityRequest();
    this.calculateTotalQuantityRemain();
  }

  clickRow(item: any) {
    const checked = this.setOfCheckedId.has(item.itemCode);
    if (checked) {
      item['itemCheck'] = false;
      this.updateCheckedSet(item.itemCode, false);
    } else {
      item['itemCheck'] = true;
      this.updateCheckedSet(item.itemCode, true);
    }
    this.refreshCheckedStatus();
  }

  onItemChecked(item: any, checked: boolean): void {
    this.updateCheckedSet(item.itemCode, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(value: boolean): void {
    this.listOfCurrentPageData.forEach((item) => {
      this.updateCheckedSet(item.itemCode, value);
    });
    this.refreshCheckedStatus();
  }

  onCurrentPageDataChange($event: readonly any[]): void {
    this.listOfCurrentPageData = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfCurrentPageData.every((item) =>
      this.setOfCheckedId.has(item.itemCode)
    );
    this.indeterminate =
      this.listOfCurrentPageData.some((item) =>
        this.setOfCheckedId.has(item.itemCode)
      ) && !this.checked;
  }

  filterSearchItem($event: any) {
    if (this.dataInformation.exportType == 3) {
      if ($event.keyCode == 13) {
        this.getItemsOfOtherExport();
      } else if ($event.type == 'click') {
        this.getItemsOfOtherExport();
      }
    } else if (this.dataInformation.exportType == 2) {
      if ($event.keyCode == 13) {
        this.getListItemsProduct();
      } else if ($event.type == 'click') {
        this.getListItemsProduct();
      }
    } else if (this.dataInformation.exportType == 1) {
      if ($event.keyCode == 13) {
        this.getListItemsMaterial();
      } else if ($event.type == 'click') {
        this.getListItemsMaterial();
      }
    }
  }

  clearFilterProduct(keyName: any) {
    this.filterChildItems[keyName] = '';
    this.getListItemsMaterial();
  }

  paginationItem(event: any) {
    this.pageItem = event.page;
    this.perPageItem = event.size;
    if (this.dataInformation.exportType == 3) {
      this.getItemsOfOtherExport();
    }
    if (this.dataInformation.exportType == 1) {
      this.getListItemsMaterial();
    }
  }

  close() {
    this.router.navigate(['./export/list-request-export']);
  }

  // Lấy danh sách sản phẩm từ xuất kho khác
  async getItemsOfOtherExport() {
    try {
      this.loading.start();
      let dataTemp: any = [];
      let data = {
        common: '',
        pageIndex: this.pageItemsProduct - 1,
        pageSize: this.perPageItemsProduct,
        filter: {
          itemGroupName: 'NVL'
        },
      };

      let resp = await this.exportRequestService.getItemsOfOtherExportNew(data);
      if (resp.result.responseCode === '00') {
        // Lấy danh sách từ content
        let list = resp.data.content || [];
        list.forEach((element: any) => {
          dataTemp.push({
            ...element,
            unit: element.unit, // bạn đã có field unit rồi
          });
        });
        // Gán dữ liệu đúng cấu trúc
        this.listItemsProduct = dataTemp;
        this.totalItemsProduct = resp.data.totalElements;
      } else {
        this.messageService.warning('Lấy danh sách hàng hóa thất bại', 'Cảnh báo');
      }
    } catch (error) {
      console.log(error);
      this.messageService.warning('Lấy danh sách hàng hóa thất bại', 'Cảnh báo');
    } finally {
      this.loading.stop();
    }
  }


  ngModelChangeExportType(event: any) {
    this.dataInformation.exportType = event;
    this.dataItems = [];
    // Xuất kho sản xuất
    if (this.dataInformation.exportType == 1) {
      this.listItem = [];
      this.setOfCheckedId.clear();
      this.dataInformation.woCode = '';
      this.listWMmstatus = [6, 7];
      this.wmsIsExportCompleted = false;
      this.onHandleFetchListWo();
      // this.getListItemsMaterial();
    }
    // Xuất kho thành phẩm
    if (this.dataInformation.exportType == 2) {
      this.listItemsProduct = [];
      this.setOfCheckedIdItemsProduct.clear();
      this.dataInformation.woCode = '';
      this.listWMmstatus = [10];
      this.wmsIsExportCompleted = '';
      this.onHandleFetchListWo();
      // this.onHandleGetListCustomer();
      // this.getListItemsProduct();
    }
    // Xuất kho khác
    if (this.dataInformation.exportType == 3) {
      this.listItemsProduct = [];
      this.setOfCheckedIdItemsProduct.clear();
      this.getItemsOfOtherExport();
    }
  }

  modalConfirmDraft: boolean = false;
  draft() {
    this.modalConfirmDraft = true;
  }

  onHandleModalCancelDraft(event: any) {
    this.modalConfirmDraft = event;
  }

  handleSelectWarehouse(event: any) {
    console.log('data Items:', this.dataItems);
    console.log(this.selectedWarehouse);
  }

  async onHandleModalConfirmDraft(event: any) {
    let dataItemSend: any[] = [];
    if (event) {
      if (this.dataInformation.exportType == 1) {
        this.dataItems.forEach((element) => {
          dataItemSend.push({
            ...element,
            woCode: this.dataInformation.woCode,
            id: element.id,
            productCode: element.productCode,
            itemName: element.itemName,
            description: element.description,
            uom: element.unit,
            unexportedQuantity: element.unexportedQuantity,
            remainQuantity: element.remainQuantity,
            requestQuantity: element.requestQuantity,
            // remainQuantity: element.remainQuantity,
          });
        });
      }
      if (this.dataInformation.exportType == 2) {
        this.dataItems.forEach((element) => {
          dataItemSend.push({
            ...element,
            productId: element.productId,
            woCode: element.woCode,
            productCode: element.productCode,
            itemName: element.itemName,
            description: element.description,
            uom: element.unit,
            requestQuantity: element.requestQuantity,
          });
        });
      }
      if (this.dataInformation.exportType == 3) {
        this.dataItems.forEach((element) => {
          dataItemSend.push({
            ...element,
            stockId: element.stockId,
            productCode: element.productCode,
            itemName: element.itemName,
            description: element.description,
            uom: element.unit,
            requestQuantity: element.requestQuantity,
          });
        });
      }
      let data = {
        exportRequestDTO: {
          exportRequestCode: '', //để trống là tạo mới, nếu không sẽ update
          exportType: this.dataInformation.exportType,
          // warehouseCode: this.dataInformation.warehouseCode,

          receiverCode: this.dataInformation.receiverCode,
          receiverName: this.dataInformation.receiverName,
          lotId: this.dataInformation.lotId ? this.dataInformation.lotId : null,
          lotNumber: this.dataInformation.lotNumber
            ? this.dataInformation.lotNumber
            : null,
          woCode: this.dataInformation.woCode
            ? this.dataInformation.woCode
            : null,
          totalLotNumber: this.dataInformation.totalLotNumber
            ? this.dataInformation.totalLotNumber
            : null,
          startAt: this.dataInformation.startAt
            ? this.dataInformation.startAt
            : null,
          endAt: this.dataInformation.endAt ? this.dataInformation.endAt : null,
          customerCode: this.dataInformation.customerCode
            ? this.dataInformation.customerCode
            : null,
          note: this.dataInformation.note ? this.dataInformation.note : null,
          exportTypeId: this.dataInformation?.exportTypeId,
          status: 1,
        },
        listItem: dataItemSend,
      };
      let resp = await this.exportRequestService.draftExportRequest(data);
      if (resp.result.responseCode == '00') {
        this.messageService.success(`${resp.result.message}`, `Thành công`);
        this.router.navigate(['./export/list-request-export']);
        this.modalConfirmDraft = false;
      } else {
        this.messageService.error(`${resp.result.message}`, `Lỗi`);
      }
    }
  }

  modalConfirmSave: boolean = false;
  async save() {
    if (!this.dataInformation.exportType) {
      this.messageService.warning(`Bạn chưa chọn loại xuất kho`, `Cảnh báo`);
      return;
    } else if (this.dataItems.length <= 0) {
      this.messageService.warning('Danh sách hàng hóa rỗng', `Cảnh báo`);
    }

    this.dataItems.forEach((item) => {
      if (!item.warehouseCode) {
        this.messageService.warning('Kho đang trống', `Cảnh báo`);
      } else {
        this.modalConfirmSave = true;
      }
    });
  }

  onHandleModalCancelSave(event: any) {
    this.modalConfirmSave = event;
  }

  async onHandleModalConfirmSave(event: any) {
    try {
      this.loading.start();
      let dataItemSend: any[] = [];
      if (event) {
        if (this.dataInformation.exportType == 1) {
          this.dataItems.forEach((element) => {
            dataItemSend.push({
              ...element,
              woCode: this.dataInformation.woCode,
              id: element.id,
              itemCode: element.itemCode,
              itemName: element.itemName,
              note: element.note,
              uom: element.unit,
              unexportedQuantity: element.unexportedQuantity,
              remainQuantity: element.remainQuantity,
              requestQuantity: element.requestQuantity,
              warehouseCode: element.warehouseCode,
            });
          });

          console.log('data item send', dataItemSend);
        }
        if (this.dataInformation.exportType == 3) {
          this.dataItems.forEach((element) => {
            dataItemSend.push({
              ...element,
              stockId: element.stockId,
              itemCode: element.itemCode  ,
              itemName: element.itemName,
              uom: element.unit,
              requestQuantity: element.requestQuantity,
              warehouseCode: element.warehouseCode,
            });
          });
        }
        let data = {
          exportRequestDTO: {
            exportRequestCode: '', //để trống là tạo mới, nếu không sẽ update
            exportType: this.dataInformation.exportType,
            receiverCode: this.dataInformation.receiverCode,
            receiverName: this.dataInformation.receiverName,
            woCode:
              this.dataInformation.woCode &&
                this.dataInformation?.exportType !== 3
                ? this.dataInformation.woCode
                : null,
            soCode:
              this.dataInformation.soCode &&
                this.dataInformation?.exportType !== 3
                ? this.dataInformation.soCode
                : null,
            productCode:
              this.dataInformation.productCode &&
                this.dataInformation?.exportType !== 3
                ? this.dataInformation.productCode
                : null,
            productName:
              this.dataInformation.productName &&
                this.dataInformation?.exportType !== 3
                ? this.dataInformation.productName
                : null,
            customerName:
              this.dataInformation.customerName &&
                this.dataInformation?.exportType !== 3
                ? this.dataInformation.customerName
                : null,
            lotId: this.dataInformation.lotId
              ? this.dataInformation.lotId
              : null,
            lotNumber: this.dataInformation.lotNumber
              ? this.dataInformation.lotNumber
              : null,
            startAt: this.dataInformation.startAt
              ? this.dataInformation.startAt
              : null,
            endAt: this.dataInformation.endAt
              ? this.dataInformation.endAt
              : null,
            customerCode: this.dataInformation.customerCode
              ? this.dataInformation.customerCode
              : null,
            note: this.dataInformation.note ? this.dataInformation.note : null,
            exportTypeId: this.dataInformation?.exportTypeId,
            status: 1,
          },
          listItem: dataItemSend,
        };

        console.log('last data', data);

        let resp = await this.exportRequestService.newExportRequest(data);
        if (resp.result.responseCode == '00') {
          this.messageService.success(`${resp.result.message}`, `Thành công`);
          this.router.navigate(['./export/list-request-export']);
          this.modalConfirmSave = false;
        } else {
          this.messageService.error(`${resp.result.message}`, `Lỗi`);
        }
      }
    } catch (error) {
      this.messageService.error(error, ' Thông báo');
    } finally {
      this.loading.stop();
    }
  }

  deleteRecord(row: any) {
    if (this.dataInformation.exportType == 1) {
      this.updateCheckedSet(row.productCode, false);
      this.listItem.find((item: any) => {
        if (item.productCode == row.productCode) {
          item.rowCheck = false;
        }
      });
    } else if (this.dataInformation.exportType == 2) {
      this.updateCheckedSetItemsProduct(row.productId, false);
      this.listItemsProduct.find((item: any) => {
        if (item.productCode == row.productId) {
          item.itemCheck = false;
        }
      });
    } else if (this.dataInformation.exportType == 3) {
      this.updateCheckedSetItemsProduct(row.productCode, false);
      this.listItemsProduct.find((item: any) => {
        if (item.productCode == row.productCode) {
          item.itemCheck = false;
        }
      });
    }
  }

  setBreadcrumb() {
    this.breadcrumbs = [
      {
        name: 'sidebar.export.name',
        route: ``,
      },
      {
        name: 'sidebar.export.child.exportRequest.child.list',
        route: `/export/list-request-export`,
      },
      {
        name: 'sidebar.export.child.exportRequest.child.create',
        route: `/export/list-request-code/new`,
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

    console.log('list warehouse', this.listWarehouse);
  }
  clearWoCode(keyName: string) {
    this.dataFilterWoCode[keyName] = '';
    this.onHandleFetchListWo();
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
  updateCheckedSetItemsProduct(productCode: any, checked: boolean): void {
    console.log('2: ', productCode);
    if (checked) {
      const product = this.listItemsProduct.find(
        (item: any) => item?.itemCode == productCode
      );
      if (product) {
        this.setOfCheckedIdItemsProduct.add(productCode);
        this.dataItems = [...this.dataItems, product];
      }
    } else {
      this.setOfCheckedIdItemsProduct.delete(productCode);
      this.dataItems = this.dataItems.filter(
        (element: any) => element?.itemCode != productCode
      );
    }
    this.calculateTotalQuantityRequestItemsProduct();
  }
  clickRowItemsProduct(item: any) {
    const checked = this.setOfCheckedIdItemsProduct.has(item.itemCode);
    if (checked) {
      item['itemCheck'] = false;
      this.updateCheckedSetItemsProduct(item.itemCode, false);
    } else {
      item['itemCheck'] = true;
      this.updateCheckedSetItemsProduct(item.itemCode, true);
    }
    this.refreshCheckedStatusItemsProduct();
  }

  onItemCheckedItemsProduct(item: any, checked: boolean): void {
    console.log('1: ', item);
    this.updateCheckedSetItemsProduct(item.itemCode, checked);
    this.refreshCheckedStatusItemsProduct();
  }
  onAllCheckedItemsProduct(value: boolean): void {
    this.listOfCurrentPageDataItemsProduct.forEach((item) => {
      this.updateCheckedSetItemsProduct(item.itemCode, value);
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
  /** Danh sách hàng hóa theo xuất kho thành phẩm (TP) */
  async getListItemsProduct() {
    this.loading.start();
    try {
      let dataRequest = {
        pageIndex: this.pageItemsProduct - 1,
        pageSize: this.perPageItemsProduct,
        filter: {
          woCode: this.dataInformation.woCode,
          soCode: this.filterItemsProduct.soCode,
          productCode: this.filterItemsProduct.productCode,
          itemName: this.filterItemsProduct.proName,
          startAt: this.filterItemsProduct.startAt[0]
            ? this.filterItemsProduct.startAt[0]
            : null,
          startAt2: this.filterItemsProduct.startAt[1]
            ? this.filterItemsProduct.startAt[1]
            : null,
          endAt: this.filterItemsProduct.endAt[0]
            ? this.filterItemsProduct.endAt[0]
            : null,
          endAt2: this.filterItemsProduct.endAt[1]
            ? this.filterItemsProduct.endAt[1]
            : null,
          deliveryAt: this.filterItemsProduct.deliveryAt[0]
            ? this.filterItemsProduct.deliveryAt[0]
            : null,
          deliveryAt2: this.filterItemsProduct.deliveryAt[1]
            ? this.filterItemsProduct.deliveryAt[1]
            : null,
          isExport: false,
          // warehouseCode: this.dataInformation.warehouseCode
        },
        common: '',
        sortProperty: 'updatedAt',
        sortOrder: 'descend',
      };

      let res = await this.exportRequestService.getListItemWithExportProduct(
        dataRequest
      );
      if (res) {
        if (res.result.responseCode == '00') {
          this.listItemsProduct = res.data.map((x: any) => ({
            ...x,
          }));
          this.totalItemsProduct = res.dataCount;
        } else {
          this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
        }
      } else {
        this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
      }
    } catch (error) {
      this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
    } finally {
      this.loading.stop();
    }
  }
  /**Xóa tìm kiếm và gọi lại danh sách */
  clearItemsProduct(keyName: any) {
    this.filterItemsProduct[keyName] = '';
    if (this.dataInformation.exportType == 2) {
      this.getListItemsProduct();
    }
    if (this.dataInformation.exportType == 3) {
      this.getItemsOfOtherExport();
    }
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
