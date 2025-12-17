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
  selector: 'app-read-request-export',
  templateUrl: './read-request-export.component.html',
  styleUrls: ['./read-request-export.component.css'],
})
export class ReadRequestExportComponent implements OnInit {
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
        encodedToken.groups.includes('/WMS_GROUP_QCER');
      this.checkGroupsInTokenSaler =
        encodedToken.groups.includes('/WMS_GROUP_SALER');
      this.checkGroupsInTokenKeeper =
        encodedToken.groups.includes('/WMS_GROUP_KEEPER');
      this.checkGroupsInTokenAdmin =
        encodedToken.groups.includes('/WMS_GROUP_ADMIN');
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
          keyTitle: 'Đơn vị tính',
          keyName: 'uom',
          width: '140px',
          check: true,
        },
        {
          keyTitle: 'Kho',
          keyName: 'warehouseCode',
          width: '140px',
          check: true,
        },

        {
          keyTitle: 'Số lượng yêu cầu',
          keyName: 'requestQuantity',
          width: '200px',
          check: true,
        },
        {
          keyTitle: 'Số lượng đã xuất kho',
          keyName: 'issuedQuantity',
          width: '200px',
          check: true,
        },
        {
          keyTitle: 'Số lượng cần xuất kho',
          keyName: 'unexportedQuantity',
          width: '200px',
          check: true,
        },
      ];
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
    });
    this.listStatus = [
      {
        text: 'Bản nháp',
        value: 0,
      },
      {
        text: 'Đã yêu cầu xuất kho',
        value: 1,
      },
      {
        text: 'Đã từ chối yêu cầu',
        value: 2,
      },
      {
        text: 'Đang xuất kho',
        value: 3,
      },
      {
        text: 'Đã xuất kho',
        value: 4,
      },
    ];
  }
  param: any = '';
  messageRefuse: any = '';
  messageRevoke: any = '';
  // Breadcrumb
  isBreadcrumb: boolean = false;
  isHidden: boolean = true;
  breadcrumbs: Object[] = [];
  // Thông tin yêu cầu xuất kho
  dataInformation: any = {
    exportType: 1,
  };
  listExportType: any[] = [];
  listWarehouse: any[] = [];
  listStatus: any[] = [];
  // Phiếu công nghệ
  showTechnicialCode: boolean = false;
  listTechnincial: any[] = [];
  dataFilterTechCode: any = {};
  totalTechCode: any = 100;
  pageTechCode: any = 1;
  perPageTechCode: any = 10;
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
  countTotalQuantityHold: number = 0;
  countTotalQuantityUnexported: number = 0;
  countTotalQuantityRequest: number = 0;
  countTotalQuantityRemain: number = 0;
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
  checkGroupsInTokenQCER: boolean = false;
  checkGroupsInTokenSaler: boolean = false;
  checkGroupsInTokenKeeper: boolean = false;
  checkGroupsInTokenAdmin: boolean = false;

  ngOnInit() {
    this.param = this.activatedRoute.snapshot.params['id'];
    this.dataFilterTechCode = {
      startAt: [],
      endAt: [],
    };
    this.setBreadcrumb();
    this.getWarehouse();
    this.getListReceiver();
    this.readExportRequestCode(this.param).then(() => {
      if (this.dataInformation.status == 0) {
        this.getMessageRevoke(this.param);
      }
      if (this.dataInformation.status == 2) {
        this.getMessaRefuse(this.param);
      }
      if (this.dataInformation.exportType == 1) {
        this.listWMmstatus = [6, 7];
        this.onHandleFetchListWo().then(() => {
          this.getListItemsMaterial();
        });
      } else if (
        this.dataInformation.exportType == 2 &&
        (this.dataInformation.status == 0 || this.dataInformation.status == 2)
      ) {
        // this.getSO();
        // this.readListItemWithSO(this.dataInformation.soCode);
        this.listWMmstatus = [10];
        this.onHandleFetchListWo().then(() => {
          this.getListItemsProduct();
        });
      } else if (
        this.dataInformation.exportType == 3 &&
        (this.dataInformation.status == 0 || this.dataInformation.status == 2)
      ) {
        this.getItemsOfOtherExport();
      }
    });
  }

  /** Lấy danh sách WO */
  listWMmstatus: any[] = [];
  async onHandleFetchListWo() {
    let dataRequest = {
      pageNumber: this.pageWoCode - 1,
      pageSize: this.perPageWoCode,
      filter: {
        // workOrderParentId: -1,
        // statusList: [0, 1, 2],
        wmsStatusSearch: this.listWMmstatus,
        woCode: this.dataInformation.woCode,
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

    let res = await this.exportRequestService.getListWo(dataRequest);
    if (res) {
      if (res.result.responseCode == '00') {
        this.listWo = res.data.content;
        this.dataInformation.productCode = res.data.content[0].productCode;
        this.dataInformation.productName = res.data.content[0].productName;
        this.dataInformation.customerName = res.data.content[0].customerName;
        this.totalWoCode = res.data.totalElements;
      } else {
        this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
      }
    } else {
      this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
    }
  }
  /** Danh sách hàng hóa theo xuất kho sản xuất (NVL) */
  async getListItemsMaterial() {
    let dataRequest = {
      pageIndex: this.pageItem - 1,
      pageSize: this.perPageItem,
      filter: {
        productCode: this.filterChildItems.productCode,
        itemName: this.filterChildItems.proName,
        uom: this.filterChildItems.unit,
        woCode: this.dataInformation.woCode,
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
        this.listItem = res.data;
        this.totalItem = res.dataCount;
      } else {
        this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
      }
    } else {
      this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
    }
  }

  async getMessageRevoke(exportRequestCode: any) {
    let resp = await this.commonService.readRevokeExportRequest(
      exportRequestCode
    );
    if (resp.data) {
      this.messageRevoke = resp.data.content;
    }
  }

  async getMessaRefuse(exportRequestCode: any) {
    let resp = await this.commonService.readRefuseExportRequest(
      exportRequestCode
    );
    if (resp.data) {
      this.messageRefuse = resp.data.content;
    }
  }

  async readExportRequestCode(exportRequestCode: any) {
    this.loading.start();
    let res = await this.exportRequestService.readExportRequest(
      exportRequestCode
    );
    if (res.result.responseCode == '00') {
      this.loading.stop();
      this.dataInformation = {
        ...res.data.exportRequestDTO,
        startAt: res.data.exportRequestDTO.startAt
          ? new Date(res.data.exportRequestDTO.createdAt)
          : '',
        endAt: res.data.exportRequestDTO.endAt
          ? new Date(res.data.exportRequestDTO.endAt)
          : '',
        createdAt: res.data.exportRequestDTO.createdAt
          ? new Date(res.data.exportRequestDTO.createdAt)
          : '',
        updatedAt: res.data.exportRequestDTO.updatedAt
          ? new Date(res.data.exportRequestDTO.updatedAt)
          : '',
        orderDate: res.data.exportRequestDTO.orderDate
          ? new Date(res.data.exportRequestDTO.orderDate)
          : '',
        deliveryAt: res.data.exportRequestDTO.deliveryAt
          ? new Date(res.data.exportRequestDTO.deliveryAt)
          : '',
      };
      this.dataItems = res.data.listItem;
      if (this.dataInformation.exportType == 1) {
        res.data.listItem.forEach((element: any) => {
          this.setOfCheckedId.add(element.materialId);
        });
      }
      if (this.dataInformation.exportType == 2) {
        res.data.listItem.forEach((element: any) => {
          this.setOfCheckedIdItemsProduct.add(element.productId);
        });
      }
      if (this.dataInformation.exportType == 3) {
        res.data.listItem.forEach((element: any) => {
          this.setOfCheckedIdItemsProduct.add(element.stockId);
        });
      }
    }

    this.calculateTotalQuantityRequest();
    this.calculateTotalQuantityUnexported();
    this.calculateTotalQuantityRemain();
  }

  // filterSearchTechCode($event: any) {
  //   if ($event.keyCode == 13) {
  //     this.getTechForm();
  //   } else if ($event.type == 'click') {
  //     this.getTechForm();
  //   }
  // }

  // Lấy danh sách sản phẩm từ xuất kho khác
  async getItemsOfOtherExport() {
    let dataTemp: any = [];
    let data = {
      pageIndex: this.pageItemsProduct - 1,
      pageSize: this.perPageItemsProduct,
      sortProperty: 'createdAt',
      sortOrder: 'DESC',
      filter: {
        productCode: this.filterItemsProduct.productCode,
        proName: this.filterItemsProduct.itemName,
        unit: this.filterItemsProduct.uom,
        uom: this.filterItemsProduct.uom,
      },
    };
    let resp = await this.exportRequestService.getItemsOfOtherExport(data);
    if (resp.result.responseCode == '00') {
      resp.data.forEach((element: any) => {
        dataTemp.push({
          ...element,
          unit: element.uom,
        });
      });
      this.listItemsProduct = dataTemp;
      this.totalItemsProduct = resp.dataCount;
    } else {
      this.messageService.warning(
        `Lấy danh sách hàng hóa thất bại`,
        `Cảnh báo`
      );
    }
  }

  //
  listSO: any[] = [];
  pageSO: any = 1;
  perPageSO: any = 10;
  totalSO: any = 0;
  sortOrderSO: any = '';
  sortPropertySO: any = '';
  dataFilterSO: any = {
    deliveryAt: [],
    orderDate: [],
  };
  async getSO() {
    let data = {
      pageIndex: this.pageSO - 1,
      pageSize: this.perPageSO,
      common: '',
      sortOrder: this.sortOrderSO,
      sortProperty: this.sortPropertySO,
      filter: {
        productOrderCode: this.dataFilterSO.productOrderCode,
        customerCode: this.dataFilterSO.customerCode,
        customerName: this.dataFilterSO.customerName,
        deliveryAt: this.dataFilterSO.deliveryAt[0],
        deliveryAt2: this.dataFilterSO.deliveryAt[1],
        orderDate: this.dataFilterSO.orderDate[0],
        orderDate2: this.dataFilterSO.orderDate[1],
      },
    };
    let resp = await this.soService.listSO(data);
    if (resp.result.responseCode == '00') {
      this.loading.stop();
      this.listSO = resp.data;
      this.totalSO = resp.dataCount;
    } else {
      this.loading.stop();
    }
  }

  showPopoverCustomer() {
    this.showTechnicialCode = true;
  }

  showPopoverProductOrdeCode() {
    this.showProductOrderCode = true;
  }

  popoverVisibleChangeSupplier(event: any) {
    this.showTechnicialCode = event;
  }

  rangeDate() {}

  id = -1;
  onResize({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.columns[i].width = width + 'px';
    });
  }

  calculateTotalQuantityRemain() {
    this.countTotalQuantityRemain = this.dataItems.reduce(
      (sum, item) => sum + parseFloat(item.remainQuantity),
      0
    );
  }

  calculateTotalQuantityHold() {
    this.countTotalQuantityHold = this.dataItems.reduce(
      (sum, item) => sum + parseFloat(item.holdQuantity),
      0
    );
  }

  calculateTotalQuantityRequest() {
    this.countTotalQuantityRequest = this.dataItems.reduce(
      (sum, item) => sum + parseFloat(item.requestQuantity),
      0
    );
  }

  calculateTotalQuantityUnexported() {
    this.countTotalQuantityUnexported = this.dataItems.reduce(
      (sum, item) => sum + parseFloat(item.unexportedQuantity),
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
        return element.materialId != id;
      });
    }
    this.setOfCheckedId.forEach((element) => {
      this.listItem.forEach((item) => {
        if (
          item.id == element &&
          !arrTemp.find((ele: any) => {
            return ele.materialId == element;
          })
        ) {
          arrTemp.push({
            materialId: item.id,
            productCode: item.productCode,
            itemName: item.itemName,
            uom: item.uom,
            unexportedQuantity: item.unexportedQuantity,
            remainQuantity: item.remainQuantity,
            requestQuantity: 0,
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

  filterSearchItem($event: any) {
    if ($event.keyCode == 13) {
      if (this.dataInformation.exportType == 3) {
        this.getItemsOfOtherExport();
      }
      // if (this.dataInformation.soCode) {
      //   this.readListItemWithSO(this.dataInformation.soCode);
      // }
      // if (this.dataInformation.techFormCode) {
      //   this.getListProduct(this.dataInformation.techFormId);
      // }
    } else if ($event.type == 'click') {
      if (this.dataInformation.exportType == 3) {
        this.getItemsOfOtherExport();
      }
      // if (this.dataInformation.soCode) {
      //   this.readListItemWithSO(this.dataInformation.soCode);
      // }
      // if (this.dataInformation.techFormCode) {
      //   this.getListProduct(this.dataInformation.techFormId);
      // }
    }
  }

  paginationItem(event: any) {
    this.pageItem = event.page;
    this.perPageItem = event.size;
    if (this.dataInformation.exportType == 3) {
      this.getItemsOfOtherExport();
    }
    // if (this.dataInformation.soCode) {
    //   this.readListItemWithSO(this.dataInformation.soCode);
    // }
  }

  close() {
    this.router.navigate(['./export/list-request-export']);
  }

  modalConfirmDraft: boolean = false;
  draft() {
    this.modalConfirmDraft = true;
  }

  onHandleModalCancelDraft(event: any) {
    this.modalConfirmDraft = event;
  }

  async onHandleModalConfirmDraft(event: any) {
    let dataItemSend: any[] = [];
    if (event) {
      if (this.dataInformation.exportType == 1) {
        this.dataItems.forEach((element) => {
          dataItemSend.push({
            ...element,
            woCode: this.dataInformation.woCode,
            materialId: element.materialId,
            productCode: element.productCode,
            itemName: element.itemName,
            uom: element.uom,
            unexportedQuantity: element.unexportedQuantity,
            requestQuantity: element.requestQuantity,
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
            uom: element.uom,
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
            uom: element.uom,
            unit: element.uom,
            requestQuantity: element.requestQuantity,
          });
        });
      }
      let data = {
        exportRequestDTO: {
          exportRequestCode: this.dataInformation.exportRequestCode, //để trống là tạo mới, nếu không sẽ update
          exportType: this.dataInformation.exportType,
          // warehouseCode: this.dataInformation.warehouseCode,
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
    }
    // else if (!this.dataInformation.warehouseCode) {
    //   this.messageService.warning(`Bạn chưa chọn kho`, `Cảnh báo`);
    //   return;
    // }
    else if (
      !this.dataInformation.woCode &&
      (this.dataInformation.exportType == 1 ||
        this.dataInformation.exportType == 2)
    ) {
      this.messageService.warning(
        `Bạn chưa chọn mã phiếu công nghệ`,
        `Cảnh báo`
      );
      return;
    } else if (!this.dataInformation.receiverName) {
      this.messageService.warning(
        `Bạn chưa chọn thông tin người nhận hàng`,
        `Cảnh báo`
      );
      return;
    }
    // else if (
    //   !this.dataInformation.customerCode &&
    //   this.dataInformation.exportType == 2
    // ) {
    //   this.messageService.warning(`Bạn chưa chọn mã đơn hàng`, `Cảnh báo`);
    //   return;
    // }
    else if (this.dataItems.length <= 0) {
      this.messageService.warning('Danh sách hàng hóa rỗng', `Cảnh báo`);
    } else {
      let check = true;
      let checkRequestQuantity = true;
      let checkRemainQuantity = true;

      if (this.dataInformation.exportType == 1) {
        this.dataItems.forEach((element) => {
          if (
            element.requestQuantity <= 0 ||
            element.requestQuantity > element.remainQuantity
          )
            check = false;
        });
      }

      if (check) {
        if (checkRequestQuantity) {
          // if (checkRemainQuantity) {
          this.modalConfirmSave = true;
          // } else {
          //   this.messageService.warning(
          //     'Số lượng yêu cầu phải nhỏ hơn hoặc bằng số lượng tồn kho',
          //     `Cảnh báo`
          //   );
          // }
        } else {
          this.messageService.warning(
            'Số lượng yêu cầu phải nhỏ hơn số lượng đang giữ',
            `Cảnh báo`
          );
        }
      } else {
        this.messageService.warning(
          'Số lượng yêu cầu phải lớn hơn 0',
          `Cảnh báo`
        );
      }
    }
  }

  onHandleModalCancelSave(event: any) {
    this.modalConfirmSave = event;
  }

  async onHandleModalConfirmSave(event: any) {
    let dataItemSend: any[] = [];
    if (event) {
      if (this.dataInformation.exportType == 1) {
        this.dataItems.forEach((element) => {
          dataItemSend.push({
            ...element,
            woCode: this.dataInformation.woCode,
            materialId: element.materialId,
            productCode: element.productCode,
            itemName: element.itemName,
            uom: element.uom,
            unexportedQuantity: element.unexportedQuantity,
            remainQuantity: element.remainQuantity,
            requestQuantity: element.requestQuantity,
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
            uom: element.uom,
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
            uom: element.uom,
            unit: element.uom,
            requestQuantity: element.requestQuantity,
          });
        });
      }
      let data = {
        exportRequestDTO: {
          ...this.dataInformation,
          exportRequestCode: this.dataInformation.exportRequestCode, //để trống là tạo mới, nếu không sẽ update
          exportType: this.dataInformation.exportType,
          lotId: this.dataInformation.lotId,
          lotNumber: this.dataInformation.lotNumber,
          receiverCode: this.dataInformation.receiverCode,
          receiverName: this.dataInformation.receiverName,
          // warehouseCode: this.dataInformation.warehouseCode,
          woCode: this.dataInformation.woCode
            ? this.dataInformation.woCode
            : null,
          // totalLotNumber: this.dataInformation.totalLotNumber
          //   ? this.dataInformation.totalLotNumber
          //   : null,
          startAt: this.dataInformation.startAt
            ? this.dataInformation.startAt
            : null,
          endAt: this.dataInformation.endAt ? this.dataInformation.endAt : null,
          customerCode: this.dataInformation.customerCode
            ? this.dataInformation.customerCode
            : null,
          note: this.dataInformation.note ? this.dataInformation.note : null,
          status: 1,
        },
        listItem: dataItemSend,
      };
      let resp = await this.exportRequestService.newExportRequest(data);
      if (resp.result.responseCode == '00') {
        this.messageService.success(`${resp.result.message}`, `Thành công`);
        this.router.navigate(['./export/list-request-export']);
        this.modalConfirmSave = false;
      } else {
        this.messageService.error(`${resp.result.message}`, `Lỗi`);
      }
    }
  }

  createGDN() {
    this.transferData.setInformationExportMaterial(this.dataInformation);
    this.router.navigate(['./export/new-GDN']);
  }

  deleteRecord(row: any) {
    if (this.dataInformation.exportType == 1) {
      this.updateCheckedSet(row.materialId, false);
      this.listItem.find((item: any) => {
        if (item.id == row.materialId) {
          item.rowCheck = false;
        }
      });
    } else if (this.dataInformation.exportType == 2) {
      this.updateCheckedSetItemsProduct(row.productId, false);
      this.listItemsProduct.find((item: any) => {
        if (item.id == row.productId) {
          item.itemCheck = false;
        }
      });
    } else if (this.dataInformation.exportType == 3) {
      this.updateCheckedSetItemsProduct(row.stockId, false);
      this.listItemsProduct.find((item: any) => {
        if (item.id == row.stockId) {
          item.itemCheck = false;
        }
      });
    }
  }

  checkIsRole(role: string) {
    return this.checkRole.checkRole(role);
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
        name: 'sidebar.export.child.exportRequest.child.read',
        route: `/export/list-request-code/${this.param}`,
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

  // Xử lý modal thu hồi
  recall() {
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
      // this.router.navigate(['./export/list-export-request']);
    }
  }

  onClickCancel() {
    this.isVisibleCancel = true;
    this.isVisibleRefuseCancel = true;
  }
  onHandleCancelPopup(event: any) {
    this.isVisibleCancel = event;
  }

  onHandleConfirmPopup(event: any) {
    this.visibleRevoke = event;
  }

  // Xử lý modal từ chối

  refuse() {
    this.visibleRefuse = true;
  }
  isVisibleRefuseCancel: boolean = false;
  visibleRefuse: boolean = false;
  onClickCancelRefuse() {
    this.isVisibleRefuseCancel = true;
  }

  hideRefuse(data: any) {
    if (!data) {
      this.visibleRefuse = data;
    }
  }

  onHandleCancelPopupRefuse(event: any) {
    this.isVisibleRefuseCancel = event;
  }

  onHandleConfirmPopupRefuse(event: any) {
    this.visibleRefuse = event;
  }

  // Lệnh sản xuất
  showWoCode: boolean = false;
  listWo: any[] = [];
  dataFilterWoCode: any = {
    startAt: [],
    endAt: [],
    updatedAt: [],
  };
  totalWoCode: any = 0;
  pageWoCode: any = 1;
  perPageWoCode: any = 10;
  showPopoverWoCode() {
    this.showWoCode = true;
  }
  popoverVisibleChangeWoCode(event: any) {
    this.showWoCode = event;
  }
  filterSearchWoCode($event: any) {
    if ($event.keyCode == 13) {
      this.onHandleFetchListWo();
    } else if ($event.type == 'click') {
      this.onHandleFetchListWo();
    }
  }
  clearWoCode(keyName: string) {
    this.dataFilterWoCode[keyName] = '';
  }
  paginationWoCode(event: any) {
    this.pageWoCode = event.page;
    this.perPageWoCode = event.size;
    this.onHandleFetchListWo();
  }
  chooseWoCode(row: any) {
    this.showWoCode = false;
    this.dataInformation.id = row.id;
    this.dataInformation.woCode = row.woCode;
    this.dataInformation.lotId = row.lotId;
    this.dataInformation.lotNumber = row.lotNumber;
    this.dataInformation.totalLotNumber = row.totalLotNumber;
    this.dataInformation.startAt = row.startAt ? new Date(row.startAt) : '';
    this.dataInformation.endAt = row.endAt ? new Date(row.endAt) : '';
    this.dataItems = [];
    this.setOfCheckedId.clear();
    this.countTotalQuantityRequest = 0;
    this.countTotalQuantityUnexported = 0;
    this.getListItemsMaterial();
  }

  clearFilterProduct(keyName: any) {
    this.filterChildItems[keyName] = '';
    this.getListItemsMaterial();
  }

  countTotalQuantityRequestItemsProduct: number = 0;
  calculateTotalQuantityRequestItemsProduct() {
    this.countTotalQuantityRequest = this.dataItems.reduce(
      (sum, item) => sum + parseFloat(item.requestQuantity),
      0
    );
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
    if (this.dataInformation.exportType == 2) {
      let arrTemp: any[] = [];
      arrTemp = JSON.parse(JSON.stringify(this.dataItems));
      if (checked) {
        this.setOfCheckedIdItemsProduct.add(id);
      } else {
        this.setOfCheckedIdItemsProduct.delete(id);
        arrTemp = arrTemp.filter((element: any) => {
          return element.productId != id;
        });
      }
      this.setOfCheckedIdItemsProduct.forEach((element) => {
        this.listItemsProduct.forEach((item) => {
          if (
            item.id == element &&
            !arrTemp.find((ele: any) => {
              return ele.productId == element;
            })
          ) {
            arrTemp.push({
              productId: item.id,
              productCode: item.productCode,
              itemName: item.itemName,
              uom: item.uom,
              requestQuantity: item.quantity,
              woCode: item.woCode,
            });
          }
        });
      });
      this.dataItems = arrTemp;
      this.calculateTotalQuantityRequestItemsProduct();
    } else {
      let arrTemp: any[] = [];
      arrTemp = JSON.parse(JSON.stringify(this.dataItems));
      if (checked) {
        this.setOfCheckedIdItemsProduct.add(id);
      } else {
        this.setOfCheckedIdItemsProduct.delete(id);
        arrTemp = arrTemp.filter((element: any) => {
          return element.stockId != id;
        });
      }
      this.setOfCheckedIdItemsProduct.forEach((element) => {
        this.listItemsProduct.forEach((item) => {
          if (
            item.id == element &&
            !arrTemp.find((ele: any) => {
              return ele.stockId == element;
            })
          ) {
            arrTemp.push({
              stockId: item.id,
              productCode: item.productCode,
              itemName: item.itemName,
              uom: item.uom,
              requestQuantity: item.quantity,
            });
          }
        });
      });
      this.dataItems = arrTemp;
      this.calculateTotalQuantityRequestItemsProduct();
    }
  }
  clickRowItemsProduct(item: any) {
    if (item.itemCheck) {
      item.itemCheck = false;
      this.updateCheckedSetItemsProduct(item.id, false);
    } else {
      item.itemCheck = true;
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
      (item) => this.setOfCheckedIdItemsProduct.has(item.id)
    );
    this.indeterminateItemsProduct =
      this.listOfCurrentPageDataItemsProduct.some((item) =>
        this.setOfCheckedIdItemsProduct.has(item.id)
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
    this.dataInformation.exportTypeId = row.exportTypeId;

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
    if (this.dataInformation.exportType == 2) {
      this.getListItemsProduct();
    }
    if (this.dataInformation.exportType == 3) {
      this.getItemsOfOtherExport();
    }
  }
  showPopoverCustomerCode() {
    this.showCustomerCode = true;
  }
  popoverVisibleChangeCustomerCode(event: any) {
    this.showCustomerCode = event;
  }
  /** Danh sách hàng hóa theo xuất kho thành phẩm (TP) */
  async getListItemsProduct() {
    let dataRequest = {
      pageIndex: this.pageItem - 1,
      pageSize: this.perPageItem,
      filter: {
        woCode: this.filterItemsProduct.woCode,
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
        this.listItemsProduct = res.data;
        this.totalItemsProduct = res.dataCount;
      } else {
        this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
      }
    } else {
      this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
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

  /**
   * Thông tin người nhân hàng
   */
  dataFilterReceiverCode: any = {};
  listReceiver: any[] = [];
  totalReceiver: any = 0;
  pageReceiver: any = 1;
  perPageReceiver: any = 10;
  async getListReceiver() {
    let dataRequest = {
      pageNumber: 0,
      pageSize: 0,
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
  popoverVisibleChangeReceiver(event: any) {
    this.showReceiver = event;
  }

  filterSearchReceiver($event: any) {
    if ($event.keyCode == 13) {
      this.getListReceiver();
    } else if ($event.type == 'click') {
      this.getListReceiver();
    }
  }
  clearReceiver(keyName: string) {
    this.dataFilterReceiverCode[keyName] = '';
    this.getListReceiver();
  }

  /** Xử ls chọn nhân viên*/
  chooseReceiver(data: any) {
    this.dataInformation.receiverCode = data.receiverCode;
    this.showReceiver = false;
    this.dataInformation.receiverName = data.receiverName;
  }
  paginationReceiver(event: any) {
    this.pageReceiver = event.page;
    this.perPageReceiver = event.size;
    this.onHandleFetchListWo();
  }
}
