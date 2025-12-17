import { GrnService } from 'src/app/services/import-warehouse/GRN/grn.service';
import { ReceiptCommonService } from 'src/app/services/import-warehouse/common/receipt-common.service';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'src/app/services/message.service';
import { CheckRoleService } from 'src/app/services/checkRole.service';
import { PoCommonService } from 'src/app/services/manage-information/common/po-common.service';
import { ReasonService } from 'src/app/services/reason/reason.service';
import { ContractService } from 'src/app/services/manage-information/contract-service/contract.service';
import jwt_decode from 'jwt-decode';
import { KeycloakService } from 'keycloak-angular';
import { ExportRequestService } from 'src/app/services/export-warehouse/exportRequestService.service';
import { environment } from 'src/environment/environment';
import { HttpClient } from '@angular/common/http';
import html2canvas from 'html2canvas';
import jspdf from 'jspdf';

@Component({
  selector: 'app-view-GRN-pending',
  templateUrl: './view-GRN-pending.component.html',
  styleUrls: ['./view-GRN-pending.component.css'],
})
export class ViewGRNPendingComponent implements OnInit {
  token: any = '';
  checkGroupsInTokenQCER: boolean = false;
  checkGroupsInTokenSaler: boolean = false;
  checkGroupsInTokenKeeper: boolean = false;
  checkGroupsInTokenAdmin: boolean = false;
  checkGroupsInTokenStaff: boolean = false;

  checkIsRole(role: any) {
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

  onFileChange(event: any) {
    console.log(this.fileList);
    this.fileList = event.target.files;
  }

  constructor(
    private messageService: MessageService,
    private keycloakService: KeycloakService,
    private translateService: TranslateService,
    private router: Router,
    private activatedRouter: ActivatedRoute,
    private loading: NgxUiLoaderService,
    private receiptCommonService: ReceiptCommonService,
    private grnService: GrnService,
    private checkRole: CheckRoleService,
    private commonService: PoCommonService,
    private reasonService: ReasonService,
    private contractService: ContractService,
    private exportRequestService: ExportRequestService,
    private http: HttpClient
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
      this.checkGroupsInTokenStaff = encodedToken.groups.includes(
        '/WMS_GROUP_WAREHOUSE-STAFF'
      );
    });
    this.params = this.activatedRouter.snapshot.params['id'];
    this.getInformation(this.params).then(() => {
      if (this.dataInformation.status == 3) {
        this.getReason();
      }
      // if (this.dataInformation.status == 0) {
      //   this.getDraft();
      // }
      if (this.dataInformation.status == 2) {
        this.getFile();
      }
      if (this.dataInformation.importType == 4) {
        // console.log('Ký gửi ?');

        this.getContractDetail(
          this.dataInformation.consignmentContractCode
        ).then(() => {
          // console.log(this.dataContract);
          // this.dataInformation = {
          //   ...this.dataContract,
          //   contractCreatedAt: this.dataContract.contractCreatedAt
          //     ? new Date(this.dataContract.contractCreatedAt)
          //     : '',
          // };
          // console.log(this.dataInformation);
        });
      }
      if (
        this.dataInformation.importType == 2 ||
        this.dataInformation.importType == 3
      ) {
        this.onHandleFetchListWo();
      }
      if (this.dataInformation.importType == 1) {
        // this.listOfRadioButtonApproevedd = [
        //   'button.detail',
        //   'button.documentConfirm',
        // ];
      }
      this.receiptCommonService
        .getListFile(this.dataInformation.importRequestCode)
        .then((response) => {
          this.fileList = response.data;
        });
      this.receiptCommonService
        .getListReportFile(this.dataInformation.importRequestCode)
        .then((response) => {
          this.listFileReport = response.data;
        });
    });
    this.getWarehouse();
    this.getImportRequest();
    // this.getPo();
    this.getUom();
    this.getEmployee();
    this.getTeamGroup();

    this.listStatus = [
      { text: 'Bản nháp', value: 0 },
      { text: 'Nhập kho chờ ký xác nhận', value: 1 },
      { text: 'Đã duyệt', value: 2 },
      { text: 'Từ chối duyệt', value: 3 },
    ];
    this.listImportType = [
      { text: 'Nhập kho mua hàng', value: 1 },
      { text: 'Nhập kho thành phẩm', value: 2 },
      // { text: 'Nhập kho NVL dư thừa', value: 3 },
      // {
      //   text: 'Nhập kho hàng ký gửi',
      //   value: 4,
      // },
      {
        text: 'Nhập kho hàng lỗi',
        value: 5,
      },
      { text: 'Nhập kho khác', value: 6 },
    ];
    this.listItemType = [
      { text: 'Mới', value: 'Mới' },
      { text: 'Đặc biệt', value: 'Đặc biệt' },
      { text: 'Thông thường', value: 'Thông thường' },
      { text: 'NVL', value: 'NVL' },
      { text: 'LKDT', value: 'LKDT' },
    ];
    // }
  }

  showFile = false;

  async getFile() {
    let resp = await this.contractService.getFile(this.params);
    if (resp) {
      if (resp.result.responseCode == '00') {
        this.listFile = resp.data;
        if (resp.data.length > 0) {
          this.showFile = true;
        }
      } else {
        this.messageService.error(` ${resp.result.message}`, ` Thông báo`);
      }
    } else {
      this.messageService.error(` ${resp.result.message}`, ` Thông báo`);
    }
  }

  async getContractDetail(contractCode: any) {
    let data = {
      pageIndex: 0,
      pageSize: 1,
      filter: {
        consignmentContractCode: contractCode,
      },
    };
    let resp = await this.contractService.getList(data);
    if (resp) {
      if (resp.result.responseCode == '00') {
        this.dataContract = resp.data[0];
        // console.log(this.dataContract)
      } else {
        this.messageService.error(` ${resp.result.message}`, ` Thông báo`);
      }
    } else {
      this.messageService.error(` ${resp.result.message}`, ` Thông báo`);
    }
  }

  dataContract: any = {};

  countActualQuantity: number = 0;

  calculateTotalActualQuantity() {
    this.countActualQuantity = this.dataItem.reduce(
      (sum, item) => sum + parseFloat(item.actualQuantity),
      0
    );
  }

  countUnsortedQuantity: number = 0;

  calculateTotalUnsortedQuantity() {
    this.countUnsortedQuantity = this.dataItem.reduce(
      (sum, item) => sum + parseFloat(item.unsortedQuantity),
      0
    );
  }

  onHandleActualChange(event: any) {
    this.calculateTotalActualQuantity();
    this.calculateTotalUnsortedQuantity();
  }

  countPoQuantity: number = 0;

  calculateTotalSupplierQuantity() {
    this.countPoQuantity = this.dataItem.reduce(
      (sum, item) => sum + item.requestQuantity,
      0
    );
  }

  reason: any = '';

  async getReason() {
    let resp = await this.reasonService.readRefuseGRN(this.params);
    if (resp.result.responseCode == '00') {
      if (resp.data) {
        this.reason = resp.data.content;
      }
    }
  }

  draft: any = '';

  async getDraft() {
    let resp = await this.reasonService.readRevokeGRN(this.params);
    if (resp.result.responseCode == '00') {
      if (resp.data) {
        this.draft = resp.data.content;
      }
    }
  }

  listUom: any[] = [];

  async getUom() {
    let resp = await this.commonService.getUnit();
    resp.data.forEach((element: any) => {
      this.listUom.push({
        text: element.paramValue,
        value: element.paramValue,
      });
    });
  }

  statusLocal: number = 0;

  async getInformation(params: any) {
    this.loading.start();
    let resp = await this.grnService.getView(params);
    if (resp.result.responseCode == '00') {
      console.log(resp.data);
      this.statusLocal = resp.data.grnDTO.status;
      this.loading.stop();
      this.dataInformation = {
        ...resp.data.grnDTO,
        deliveryAt: resp.data.grnDTO.deliveryAt
          ? new Date(resp.data.grnDTO.deliveryAt)
          : '',
        createdAt: resp.data.grnDTO.createdAt
          ? new Date(resp.data.grnDTO.createdAt)
          : '',
        updatedAt: resp.data.grnDTO.updatedAt
          ? new Date(resp.data.grnDTO.updatedAt)
          : '',
      };

      this.dataItem = resp.data.listItem;
    } else {
      this.loading.stop();
    }

    this.calculateTotalActualQuantity();
    this.calculateTotalSupplierQuantity();
    this.calculateTotalUnsortedQuantity();
  }

  dataInformationWo: any = {};
  /** Lấy danh sách WO */
  async onHandleFetchListWo() {
    let dataRequest = {
      pageNumber: 0,
      pageSize: 0,
      filter: {
        workOrderParentId: -1,
        woCode: this.dataInformation.woCode,
      },
      common: '',
      sortProperty: 'updatedAt',
      sortOrder: 'DESC',
    };

    let res = await this.exportRequestService.getListWo(dataRequest);
    if (res) {
      if (res.result.responseCode == '00') {
        this.dataInformationWo = res.data?.content[0];
        this.dataInformation.totalLotNumber = res.data.totalLotNumber
          ? res.data[0].totalLotNumber
          : '';
        this.dataInformation.startAt = res.data.startDate
          ? new Date(res.data.startDate)
          : '';
        this.dataInformation.endAt = res.data.endDate
          ? new Date(res.data.endDate)
          : '';
      } else {
        this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
      }
    } else {
      this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
    }
  }

  async getPo() {
    let resp = await this.receiptCommonService.getPoCode();
    if (resp.result.responseCode == '00') {
      resp.data.forEach((element: any) => {
        this.listPOCode.push({
          text: element.poCode,
          value: element.poCode,
        });
      });
    } else {
      this.messageService.error(`${resp.result.message}`, `Lỗi`);
    }
  }

  async getImportType() {
    let resp = await this.receiptCommonService.getImportType();
    if (resp.result.responseCode == '00') {
      resp.data.forEach((element: any) => {
        this.listImportType.push({
          text: element.importTypeName,
          value: element.importTypeName,
        });
      });
    } else {
      this.messageService.error(`${resp.result.message}`, `Lỗi`);
    }
  }

  async getWarehouse() {
    let resp = await this.receiptCommonService.getWarehouse();
    if (resp.result.responseCode == '00') {
      resp.data.forEach((element: any) => {
        if (element.status == 1) {
          this.listWarehouse.push({
            text: element.warehouseName,
            value: element.warehouseCode,
          });
        }
      });
    } else {
      this.messageService.error(`${resp.result.message}`, `Lỗi`);
    }
  }

  dataPrintPDF: any[] = [];
  params: any = '';

  ngOnInit() {
    this.loading.start();
    this.setBreadcrumb();
    this.getDataPrintPDF();
    this.columns = [
      {
        keyTitle: 'ui.receitp.GRN.create.item_code',
        keyName: 'productCode',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'ui.receitp.GRN.create.item_name',
        keyName: 'itemName',
        width: '300px',
        check: true,
      },
      {
        keyTitle: 'ui.receipt.GRN.warehouse_code',
        keyName: 'warehouseCode',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'Số lượng NCC',
        keyName: 'supplierQuantity',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'Tỷ số quy đổi',
        keyName: 'exchangeRate',
        width: '200px',
        check: true
      },
      {
        keyTitle: 'ui.receitp.GRN.create.po_quantity',
        keyName: 'requestQuantity',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'Đơn vị tính kho',
        keyName: 'uom',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'manage.receipt.create.list.receiptQuantity',
        keyName: 'inventoryQuantity',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'SL thực nhập',
        keyName: 'actualQuantity',
        width: '200px',
        check: true,
      },
    ];
    this.columnsLocation = [
      {
        keyTitle: 'ui.receitp.GRN.create.item_code',
        keyName: 'productCode',
        width: '140px',
        check: true,
      },
      {
        keyTitle: 'ui.receitp.GRN.create.item_name',
        keyName: 'itemName',
        width: '240px',
        check: true,
      },
      {
        keyTitle: 'ui.receitp.GRN.create.supplier',
        keyName: 'vendorName',
        width: '140px',
        check: true,
      },
      {
        keyTitle: 'ui.receitp.GRN.create.unit',
        keyName: 'uom',
        width: '140px',
        check: true,
      },
      {
        keyTitle: 'ui.receitp.GRN.create.unsorted_quantity',
        keyName: 'unsortedQuantity',
        width: '160px',
        check: true,
      },
    ];
    this.loading.stop();
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
      {
        name: 'ui.receipt.GRN.view_detail',
        route: `/manage-warehouse-receipt/good-receipt-note/view-GRN-pending/${this.params}`,
      },
    ];
    this.isBreadcrumb = true;
  }

  // Xử lý file

  // Hàm xử lý sự kiện onResize
  id = -1;

  onResize({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.columns[i].width = width + 'px';
    });
  }

  onResizeLocation({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.columnsLocation[i].width = width + 'px';
    });
  }

  // Tìm kiếm
  dataFilter: any = {};
  dataFilterImportRequest: any = {
    deliveryAt: [],
    updatedAt: [],
  };

  enterSearch($event: any) {
    if ($event.keyCode == 13) {
      this.getImportRequest();
    }
  }

  search() {
    this.getImportRequest();
  }

  async paginationImportRequest(event: any) {
    this.pageImportRequest = event.page;
    this.perPageImportRequest = event.size;
    this.getImportRequest();
  }

  // Gửi duyệt
  dataInformation: any = {};

  async drag() {
    if (!this.dataInformation.importRequestCode) {
      this.messageService.warning(`Không có hàng hóa`, `Cảnh báo`);
    } else {
      let data = {
        grnDTO: {
          grnCode: this.params,
          woCode: this.dataInformation.woCode,
          importType: this.dataInformation.importType,
          warehouseCode: this.dataInformation.warehouseCode,
          status: 0,
          importRequestCode: this.dataInformation.importRequestCode,
          poCode: this.dataInformation.poCode,
          deliveryAt: this.dataInformation.deliveryAt,
          shipper: this.dataInformation.shipper,
          note: this.dataInformation.note,
        },
        listItem: this.dataItem,
      };
      let resp = await this.grnService.saveDraft(data);
      if (resp.result.responseCode == '00') {
        this.messageService.success(`${resp.result.message}`, `Thành công`);
        this.router.navigate(['./manage-warehouse-receipt/good-receipt-note']);
      } else {
        this.messageService.error(`${resp.result.message}`, `Lỗi`);
      }
    }
  }

  // Kiểm tra phần tử cuối để loại bỏ chức năng resize
  lastObject(obj: any) {
    if (obj == this.columns[this.columns.length - 1]) {
      return false;
    } else {
      return true;
    }
  }

  lastObjectLocation(obj: any) {
    if (obj == this.columnsLocation[this.columnsLocation.length - 1]) {
      return false;
    } else {
      return true;
    }
  }

  // Hủy bỏ
  close() {
    this.router.navigate(['./manage-warehouse-receipt/good-receipt-note']);
  }

  // Thu hồi

  async recall() {
    this.visibleRevoke = true;
    // let resp = await this.grnService.reCall(
    //   this.dataInformation.grnCode,
    //   0,
    //   {}
    // );
    // if (resp.result.responseCode == '00') {
    //   this.messageService.success(`${resp.result.message}`, `Thành công`);
    //   this.router.navigate(['./manage-warehouse-receipt/good-receipt-note']);
    // } else {
    //   this.messageService.success(`${resp.result.message}`, `Lỗi`);
    // }
  }

  async refuse() {
    this.visibleRefuse = true;
  }

  async approve() {
    this.showModalApprove = true;
  }

  showModalApprove: boolean = false;

  onHandleModalCancel(event: any) {
    this.showModalApprove = event;
  }

  async onHandleModalConfirm(event: any) {
    if (event) {
      let resp = await this.grnService.reCall(
        this.dataInformation.grnCode,
        2,
        {}
      );
      if (resp.result.responseCode == '00') {
        this.messageService.success(`${resp.result.message}`, `Thành công`);
        this.router.navigate(['./manage-warehouse-receipt/good-receipt-note']);
      } else {
        this.messageService.warning(`${resp.result.message}`, `Lỗi`);
      }
    }
  }

  listOfRadioButton: string[] = ['button.detail', 'button.attach'];
  // listOfRadioButtonApproevedd: string[] = [
  //   'button.detail',
  //   'button.attach',
  //   'button.location',
  // ];
  listOfRadioButtonApproevedd: string[] = [
    'button.detail'
  ];

  // Thay đổi lựa chọn hiển thị danh sách hàng hóa
  changeSelect(event: any) {
    this.choose = event;
  }

  // Value
  isBreadcrumb: boolean = false;
  isHidden: boolean = true;
  breadcrumbs: Object[] = [];
  // File
  fileList: any[] = [];
  listFileReport: any[] = [];
  // Column
  columns: any[] = [];
  columnsLocation: any[] = [];
  // Filter
  listItemType: any[] = [];
  // List data item
  dataItem: any[] = [];
  // List select
  listImportType: any[] = [];
  listWarehouse: any[] = [];
  listStatus: any[] = [];
  listImportRequestCode: any[] = [];
  listPOCode: any[] = [];
  // Button radio
  choose: number = 0;
  // Confirm send email
  isSendEmail: boolean = true;

  // Xử lý modal từ chối
  visibleRefuse: boolean = false;
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
    this.visibleRefuse = event;
  }

  hide(data: any) {
    this.visibleRefuse = data;
    this.visibleRevoke = data;
  }

  // Xử lý modal thu hồi
  visibleRevoke: boolean = false;

  onClickCancelRevoke() {
    this.isVisibleCancel = true;
  }

  // Thêm người duyệt
  showApprovedBy: boolean = false;
  isVisibleCancelEmployee: boolean = false;
  showEmployee: boolean = false;
  listEmployee: any[] = [];
  listTeamGroup: any[] = [];
  dataApprovedBy: any = {
    approverCode: '',
    approverName: '',
  };
  dataFilterEmployee: any = {};

  onClickCancelEmployee() {
    this.isVisibleCancelEmployee = true;
  }

  onHandleCancelPopupEmployee(event: any) {
    this.isVisibleCancelEmployee = event;
  }

  onHandleConfirmPopupEmployee(event: any) {
    this.showApprovedBy = event;
  }

  async save() {
    this.loading.start();

    let data = {
      grnDTO: {
        importType: this.dataInformation.importType,
        warehouseCode: this.dataInformation.warehouseCode,
        status: 1,
        importRequestCode: this.dataInformation.importRequestCode,
        poCode: this.dataInformation.poCode,
        shipper: this.dataInformation.shipper,
        deliveryAt: this.dataInformation.deliveryAt,
        importAt: this.dataInformation.importAt,
        note: this.dataInformation.note,
        approverCode: this.dataApprovedBy.approverCode,
        approverName: this.dataApprovedBy.approverName,
        woCode: this.dataInformation.woCode,
        consignmentContractCode: this.dataInformation.consignmentContractCode,
      },
      listItem: this.dataItem,
    };
    let formData: FormData = new FormData();
    formData.append(
      'textData',
      new Blob([JSON.stringify(data)], {
        type: 'application/json',
      })
    );
    console.log(this.listFile);
    // for (let file of this.listFile) {
    //   formData.append('fileData', file);
    // }
    // let resp = await this.grnService.postGrn(formData);
    // if (resp.result.responseCode == '00') {
    //   this.loading.stop();
    //   // this.showApprovedBy = false;
    //   this.messageService.success(
    //     `${resp.result.message}`,
    //     `Thành công`
    //   );
    //   this.router.navigate([
    //     './manage-warehouse-receipt/good-receipt-note',
    //   ]);
    // } else {
    //   this.loading.stop();
    //   this.messageService.error(`${resp.result.message}`, `Lỗi`);
    // }
  }

  showPopoverEmployee() {
    this.showEmployee = true;
  }
  popoverVisibleChangeEmployee(event: any) {
    this.showEmployee = event;
  }
  chooseEmployee(row: any) {
    this.dataApprovedBy.approverCode = row.employeeCode;
    this.dataApprovedBy.approverName = row.employeeName;
    this.showEmployee = false;
  }
  async getEmployee() {
    let res = await this.receiptCommonService.getListApprovedBy();
    this.listEmployee = res.data;
  }

  async getTeamGroup() {
    let res = await this.receiptCommonService.getTeamGroup();
    res.data.forEach((element: any) => {
      this.listTeamGroup.push({
        text: element.teamGroupName,
        value: element.teamGroupId,
      });
    });
  }

  // Lấy danh sách nhân viên
  showPopover: boolean = false;
  showPopoverSupplier() {
    this.showPopover = true;
  }
  popoverVisibleChangeSupplier(event: any) {
    this.showPopover = event;
  }
  dataImportRequestCode: any[] = [];
  totalImportRequest: any = 0;
  pageImportRequest: number = 1;
  perPageImportRequest: number = 10;
  async getImportRequest() {
    let data = {
      pageIndex: this.pageImportRequest - 1,
      pageSize: this.perPageImportRequest,
      filter: {
        importRequestCode: this.dataFilterImportRequest.code,
        importType: this.dataFilterImportRequest.importType,
        warehouseCode: this.dataFilterImportRequest.warehouseCode,
        poCode: this.dataFilterImportRequest.poCode,
        consignmentContractCode:
          this.dataFilterImportRequest.consignmentContractCode,
        shipper: this.dataFilterImportRequest.shipper,
        createdBy: this.dataFilterImportRequest.createdBy,
        status: 5,
      },
      common: '',
      sortProperty: 'updatedAt',
      sortOrder: 'DESC',
    };
    let resp = await this.receiptCommonService.getImportRequestCode(data);
    if (resp.result.responseCode == '00') {
      this.dataImportRequestCode = resp.data;
      this.totalImportRequest = resp.dataCount;

      resp.data.forEach((element: any) => {
        this.listImportRequestCode.push({
          text: element.code,
          value: element.code,
        });
      });
    } else {
      this.messageService.error(`${resp.result.message}`, `Lỗi`);
    }
  }

  async chooseRow(row: any) {
    this.showPopover = false;
    this.dataItem = [];
    // == 1 ( Nhập kho khác)
    if (row.importType == 1) {
      this.dataInformation.importRequestCode = row.importRequestCode;
      this.dataInformation.importType = row.importType;
      this.dataInformation.warehouseCode = row.warehouseCode;
      this.dataInformation.poCode = row.poCode;
      this.dataInformation.note = row.note;
      if (row.deliveryAt) {
        this.dataInformation.deliveryAt = new Date(row.deliveryAt);
      }
      this.dataInformation.importRequestCode = row.importRequestCode;
      if (row.poCode) {
        this.getListItem(row.poCode);
      }
    }
    // == 4 (Nhập kho hàng ký gửi)
    if (row.importType == 4) {
      this.dataInformation.importRequestCode = row.importRequestCode;
      this.dataInformation.importType = row.importType;
      this.dataInformation.warehouseCode = row.warehouseCode;
      this.dataInformation.note = row.note;
      this.getContractDetail(row.consignmentContractCode).then(() => {
        this.dataInformation.consignmentContractCode =
          this.dataContract.consignmentContractCode;
        this.dataInformation.contractCreatedAt = new Date(
          this.dataContract.contractCreatedAt
        );
        this.dataInformation.customerCode = this.dataContract.customerCode;
        this.dataInformation.customerName = this.dataContract.customerName;
        this.dataInformation.address = this.dataContract.address;
        this.dataInformation.customerPhone = this.dataContract.customerPhone;
      });
      let resp = await this.grnService.getListItemWithWarehouseOther(
        row.importRequestCode
      );
      if (resp.data.listItem.length == 0) {
        this.messageService.warning(`Không có hàng hóa`, `Cảnh báo`);
      } else {
        this.dataItem = resp.data.listItem;
      }
      // console.log(this.dataInformation)
    }
    // == 6 (Nhập kho khác)
    if (row.importType == 6) {
      this.dataInformation.importRequestCode = row.importRequestCode;
      this.dataInformation.importType = row.importType;
      this.dataInformation.warehouseCode = row.warehouseCode;
      this.dataInformation.note = row.note;
      let resp = await this.grnService.getListItemWithWarehouseOther(
        row.importRequestCode
      );
      if (resp.data.listItem.length == 0) {
        this.messageService.warning(`Không có hàng hóa`, `Cảnh báo`);
      } else {
        this.dataItem = resp.data.listItem;
      }
    }
    //  == 2 (Nhập kho thành phẩm)
    if (row.importType == 2) {
      let arrObject = this.dataInformation;
      this.dataInformation = {
        ...row,
        ...arrObject,
        startAt: row.startAt ? new Date(row.startAt) : '',
        endAt: row.endAt ? new Date(row.endAt) : '',
      };
      // console.log(this.dataInformation);
      this.getListItemsByImportRequest(this.dataInformation.importRequestCode);
    }
    this.calculateTotalActualQuantity();
    this.calculateTotalSupplierQuantity();
  }

  async getListItemsByImportRequest(code: any) {
    this.loading.start();
    let res = await this.grnService.getListItemWithImportRequest(code);
    if (res) {
      this.loading.stop();
      if (res.result.responseCode == '00') {
        this.loading.stop();
        this.dataItem = res.data.listItem;
      } else {
        this.loading.stop();
        this.messageService.error(
          ` Có lỗi xảy ra, vui lòng thử lại`,
          ` Cảnh báo`
        );
      }
    } else {
      this.loading.stop();
      this.messageService.error(
        ` Có lỗi xảy ra, vui lòng thử lại`,
        ` Cảnh báo`
      );
    }
    this.calculateTotalRequestQuantity();
  }

  countRequestQuantity: number = 0;
  calculateTotalRequestQuantity() {
    this.countRequestQuantity = this.dataItem.reduce(
      (sum, item) => sum + item.requestQuantity,
      0
    );
  }

  async getListItem(poCode: any) {
    if (poCode) {
      let res = await this.grnService.getListItem(poCode, true);
      if (res.result.responseCode == '00') {
        this.dataItem = res.data.listItem;
        this.calculateTotalSupplierQuantity();
        this.calculateTotalActualQuantity();
        this.calculateTotalUnsortedQuantity();
      } else {
        this.messageService.error(`${res.result.message}`, `Lỗi`);
      }
    } else {
      this.dataItem = [];
    }
    if (this.dataItem.length == 0) {
      this.messageService.warning(`Không có hàng hóa`, `Cảnh báo`);
    }
  }

  checked = false;
  indeterminate = false;
  listOfCurrentPageData: readonly any[] = [];
  listOfData: readonly any[] = [];
  setOfCheckedId = new Set<number>();
  columnFile: any[] = [
    {
      keyTitle: 'Tệp đính kèm',
      keyName: 'file',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'Người gửi',
      keyName: 'sendBy',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'Ngày gửi',
      keyName: 'sendAt',
      width: '200px',
      check: true,
    },
  ];

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(value: boolean): void {
    this.listOfCurrentPageData.forEach((item) =>
      this.updateCheckedSet(item.productCode, value)
    );
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
  // Hàm xử lý sự kiện onResize
  onResizeFile({ width }: NzResizeEvent, col: any): void {
    this.columnFile = this.columnFile.map((e) =>
      e.keyTitle === col.keyTitle ? { ...e, width: `${width}px` } : e
    );
  }
  async getDataPrintPDF() {
    let res = await this.grnService.getView(this.params);
    if (res.result.responseCode == '00') {
      if (res.data.listItem.length == 0) {
        this.messageService.warning(`Không có hàng hóa`, `Cảnh báo`);
      } else {
        if (res.data.listItem.length > 0) {
          for (let i = 0; i < res.data.listItem.length; i++) {
            console.log(
              'vvk res.data.listItem[i].listPackage',
              res.data.listItem[i].listPackage
            );

            if (res.data.listItem[i].listPackage.length > 0) {
              for (
                let j = 0;
                j < res.data.listItem[i].listPackage.length;
                j++
              ) {
                console.log(
                  'vvk res.data.listItem[i].listPackage[j].listLocationPackage',
                  res.data.listItem[i].listPackage[j].listLocationPackage
                );
                if (
                  res.data.listItem[i].listPackage[j].listLocationPackage
                    .length > 0
                ) {
                  for (
                    let k = 0;
                    k <
                    res.data.listItem[i].listPackage[j].listLocationPackage
                      .length;
                    k++
                  ) {
                    this.dataPrintPDF.push({
                      productCode: res.data.listItem[i].productCode,
                      itemName: res.data.listItem[i].itemName,
                      itemQuantity:
                        res.data.listItem[i].listPackage[j].itemQuantity,
                      ...res.data.listItem[i].listPackage[j]
                        .listLocationPackage[k],
                    });
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  print() {
    // console.log('check')
    var data = document.getElementById('print');
    html2canvas(data!).then((canvas) => {
      // Few necessary setting options
      var imgWidth = 208;
      var pageHeight = 295;
      var imgHeight = (canvas.height * imgWidth) / canvas.width;
      var heightLeft = imgHeight;

      const contentDataURL = canvas.toDataURL('image/png');
      let pdf = new jspdf('p', 'mm', 'a4'); // A4 size page of PDF
      var position = 0;
      pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
      pdf.save('new-file.pdf'); // Generated PDF
    });
  }
  // In thẻ kho
  printGRN() {
    this.router.navigate([
      `./manage-warehouse-receipt/good-receipt-note/view-GRN/${this.params}/config`,
    ]);
  }

  // Xử lý expand
  expandSet = new Set<number>();
  isExpand: boolean = false;

  onClickIcon(element: any) {
    if (this.expandSet.has(element.id)) {
      this.expandSet.delete(element.id);
    } else {
      this.expandSet.add(element.id);
    }
  }

  // Xử lý expand
  expandSetLocation = new Set<number>();
  isExpandLocation: boolean = false;

  onClickIconLocation(element: any) {
    if (this.expandSetLocation.has(element.productCode)) {
      this.expandSetLocation.delete(element.productCode);
    } else {
      this.expandSetLocation.add(element.productCode);
    }
  }

  onClickAddLocation() { }

  onHandleView(row: any) { }

  showUploadFile: boolean = false;
  onClickAddNew() {
    this.showUploadFile = true;
  }

  listFile: any[] = [];
  onFileChangeShowUpload(event: any) {
    this.showUploadFile = false;
    this.listFile = event;
  }
  cancelUploadFile() {
    this.showUploadFile = false;
  }
  deleteFile(row: any) {
    this.listFile = this.listFile.filter((item) => item.name !== row.name);
  }
  downloadFile(row: any) {
    this.http
      .post(environment.api_end_point + `/api/file/download/${row.id}`, '', {
        observe: 'response',
        responseType: 'blob',
      })
      .subscribe((response) => {
        let a = document.createElement('a');
        a.download = row.fileName;
        a.href = window.URL.createObjectURL(response.body as Blob);
        a.click();
      });
  }

  async updateDocumentReport() {
    this.loading.start();
    console.log(this.dataInformation);
    let data = {
      grnDTO: {
        id: this.dataInformation.id,
        grnCode: this.dataInformation.grnCode,
        importType: this.dataInformation.importType,
        warehouseCode: this.dataInformation.warehouseCode,
        status: 1,
        importStatus: 1, //Bổ sung nghiệp vụ, để phục vụ cho bản ghi trên ds lưu kho có trạng thái 1
        importRequestCode: this.dataInformation.importRequestCode,
        poCode: this.dataInformation.poCode,
        shipper: this.dataInformation.shipper,
        deliveryAt: this.dataInformation.deliveryAt,
        importAt: this.dataInformation.importAt,
        note: this.dataInformation.note,
        approverCode: this.dataApprovedBy.approverCode,
        approverName: this.dataApprovedBy.approverName,
        woCode: this.dataInformation.woCode,
        consignmentContractCode: this.dataInformation.consignmentContractCode,
      },
      listItem: this.dataItem,
    };
    let formData: FormData = new FormData();
    formData.append(
      'textData',
      new Blob([JSON.stringify(data)], {
        type: 'application/json',
      })
    );
    for (let file of this.listFile) {
      formData.append('fileData', file);
    }
    let resp = await this.grnService.postGrn(formData);
    if (resp.result.responseCode == '00') {
      this.loading.stop();
      // this.showApprovedBy = false;
      this.messageService.success(`${resp.result.message}`, `Thành công`);
      this.router.navigate(['./manage-warehouse-receipt/good-receipt-note']);
    } else {
      this.loading.stop();
      this.messageService.error(`${resp.result.message}`, `Lỗi`);
    }
  }
}
