import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { KeycloakService } from 'keycloak-angular';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CheckRoleService } from 'src/app/services/checkRole.service';
import { GDNService } from 'src/app/services/export-warehouse/GDNRequestService.service';
import { CommonService } from 'src/app/services/export-warehouse/commonService.service';
import { ExportRequestService } from 'src/app/services/export-warehouse/exportRequestService.service';
import { MessageService } from 'src/app/services/message.service';
import { TransferDataService } from 'src/app/services/transferData.service';
import jwt_decode from 'jwt-decode';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environment/environment';
import html2canvas from 'html2canvas';
import jspdf from 'jspdf';
import { WarehouseTransferService } from 'src/app/services/warehouse-transfer/warehouse-transfer.service';

@Component({
  selector: 'app-warehouse-transfer-note-detail',
  templateUrl: './warehouse-transfer-note-detail.component.html',
  styleUrls: ['./warehouse-transfer-note-detail.component.css'],
})
export class WarehouseTransferNoteDetailComponent implements OnInit {
  token: any = '';
  checkGroupsInTokenQcer: boolean = false;
  checkGroupsInTokenKeeper: boolean = false;
  checkGroupsInTokenSaler: boolean = false;
  checkGroupsInTokenAdmin: boolean = false;
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
    private gdnService: GDNService,
    private http: HttpClient,
    private warehouseTransferService: WarehouseTransferService
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
    });
  }
  params: any = '';
  // Breadcrumb
  isBreadcrumb: boolean = false;
  isHidden: boolean = true;
  breadcrumbs: Object[] = [];
  // Thông tin yêu cầu xuất kho
  dataInformation: any = {
    wtrType: 1,
  };
  listWarehouse: any[] = [];
  listStatus: any[] = [];
  listExportType: any[] = [
    {
      text: 'Xuất kho sản xuất',
      value: 1,
    },
    {
      text: 'Xuất kho thành phẩm',
      value: 2,
    },
    {
      text: 'Xuất kho khác',
      value: 3,
    },
  ];
  // Mã yêu cầu xuất kho
  showExportRequestCode: boolean = false;
  listExportRequestCode: any[] = [];
  dataFilterExportRequestCode: any = {
    startAt: [],
    endAt: [],
    orderDate: [],
    deliveryAt: [],
    createdAt: [],
    updatedAt: [],
  };
  // Danh sách hàng hóa
  columns: any[] = [];
  dataItems: any[] = [];
  countTotalActualQuantity: number = 0;
  countTotalQuantityRequest: number = 0;
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
  showApproveBy: boolean = false;
  // Danh sách yêu cầu
  totalExportRequest: number = 0;
  pageExportRequest: number = 1;
  perPageExportRequest: number = 10;
  paginationExportRequest(event: any) {
    this.pageExportRequest = event.page;
    this.perPageExportRequest = event.size;
    // this.readWTR();
  }
  // Nhân viên
  showEmployee: boolean = false;
  dataApprovedBy: any = {};
  listTeamGroup: any[] = [];
  listEmployee: any[] = [];
  dataFilterEmployee: any = {};
  ngOnInit() {
    this.params = this.activatedRoute.snapshot.params['id'];
    this.readWTR(this.params).then(() => {
      this.getFile();
    });
    // this.getWarehouse();
    this.setBreadcrumb();
    this.getTeamGroup();
    this.getEmployee();
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
        keyName: 'fromWarehouseCode',
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
        keyName: 'uom',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'Số lượng yêu cầu',
        keyName: 'requestQuantity',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'SL đã chuyển',
        keyName: 'transferedQuantity',
        width: '150px',
        check: true,
      },
      {
        keyTitle: 'SL thực chuyển',
        keyName: 'actualQuantity',
        width: '150px',
        check: true,
      },
    ];

    this.listStatus = [
      {
        text: 'Bản nháp',
        value: 0,
      },
      {
        text: 'Chuyển kho chờ ký xác nhận',
        value: 1,
      },
      {
        text: 'Chuyển kho đã ký xác nhận',
        value: 2,
      },
    ];
  }
  dataPrintPDF: any[] = [];
  inforGDN: any;
  print() {
    console.log('check');
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
      console.log('du me');
      pdf.save('new-file.pdf'); // Generated PDF
    });
  }

  checkIsRole(role: string) {
    return this.checkRole.checkRole(role);
  }
  setBreadcrumb() {
    this.breadcrumbs = [
      {
        name: 'Quản lý chuyển kho',
        route: ``,
      },
      {
        name: 'Danh sách phiếu chuyển kho',
        route: `/warehouse-transfer/list-warehouse-transfer`,
      },
      {
        name: 'Xem chi tiết phiếu chuyển kho',
        route: `/warehouse-transfer/list-warehouse-transfer/warehouse-transfer-detail/${this.params}`,
      },
    ];
    this.isBreadcrumb = true;
  }

  async getWarehouse() {
    let resp = await this.commonService.getWarehouse();
    resp.data.forEach((element: any) => {
      let data = {
        text: element.warehouseName,
        value: element.fromWarehouseCode,
      };
      this.listWarehouse.push(data);
    });
  }

  async readWTR(wtrCode: any) {
    try {
      this.loading.start();
      let res = await this.warehouseTransferService.readWTRNote(wtrCode);
      if (res.result.ok) {
        this.dataInformation = res.data.wtrDTO;
        this.dataItems = res.data.itemTransferDTOList?.map((item: any) => ({
          ...item,
          listFromWarehouse: item?.formLocationItemTransferDTO?.map(
            (chill: any) => ({
              ...chill,
              locationCode: chill?.fromLocationCode,
              locationName: chill?.fromLocationName,
            })
          ),
          listToWarehouse: item?.toLocationItemTransferDTO?.map(
            (chill: any) => ({
              ...chill,
              locationCode: chill?.toLocationCode,
              locationName: chill?.toLocationName,
            })
          ),
        }));
      } else {
        this.messageService.error(`Có lỗi xảy ra, vui lòng thử lại sau`, `Lỗi`);
      }
    } catch (error) {
      this.messageService.error(`Có lỗi xảy ra, vui lòng thử lại sau`, `Lỗi`);
    } finally {
      this.loading.stop();
    }
  }

  messageRevoke: any = '';
  async getMessageRevoke(wtrCode: any) {
    let resp = await this.commonService.readRevokeGDN(wtrCode);
    if (resp.data) {
      this.messageRevoke = resp.data.content;
    }
  }

  messageRefuse: any = '';
  async getMessaRefuse(wtrCode: any) {
    let resp = await this.commonService.readRefuseGDN(wtrCode);
    if (resp.data) {
      this.messageRefuse = resp.data.content;
    }
  }

  async getEmployee() {
    let res = await this.commonService.getListApprovedBy();
    this.listEmployee = res.data;
  }

  async getTeamGroup() {
    let res = await this.commonService.getTeamGroup();
    if (res.result.responseCode == '00') {
      res.data.forEach((element: any) => {
        this.listTeamGroup.push({
          text: element.teamGroupName,
          value: element.teamGroupId,
        });
      });
    } else {
      this.messageService.warning(`${res.result.message}`, `Warning`);
    }
  }

  onHandlePopoverExportRequestCode() {
    this.showExportRequestCode = true;
  }

  onHandleVisiblePopoverExportRequestCode(event: any) {
    this.showExportRequestCode = event;
  }

  searchExportRequestCode($event: any) {
    if ($event.keyCode == 13) {
    } else if ($event.type == 'click') {
    }
  }

  searchFollowSelect() {}

  rangeDate() {}
  chooseRow(row: any) {
    this.showExportRequestCode = false;
    this.dataInformation = {
      ...this.dataInformation,
      woCode: row.woCode,
      totalLotNumber: row.totalLotNumber,
      transferRequestCode: row.transferRequestCode,
      wtrType: row.wtrType,
      fromWarehouseCode: row.fromWarehouseCode,
      toWarehouseCode: row.toWarehouseCode,
      customerCode: row.customerCode,
      customerName: row.customerName,
      customerAddress: row.customerAddress,
      customerPhone: row.customerPhone,
      startAt: new Date(row.startAt),
      endAt: new Date(row.endAt),
      orderDate: new Date(row.orderDate),
      deliveryAt: new Date(row.deliveryAt),
    };
    if (this.dataInformation.transferRequestCode) {
      this.readExportRequestCode(this.dataInformation.transferRequestCode);
    }
  }

  async readExportRequestCode(transferRequestCode: any) {
    let res = await this.exportRequestService.readExportRequest(
      transferRequestCode
    );
    if (res.result.responseCode == '00') {
      if (res.data.listItem.length == 0) {
        this.messageService.warning(`Không có hàng hóa`, `Cảnh báo`);
      } else {
        this.dataItems = res.data.listItem;
      }
    }
    this.calculateTotalActualQuantity();
    this.calculateTotalQuantityRequest();
  }

  id = -1;
  onResize({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.columns[i].width = width + 'px';
    });
  }

  calculateTotalActualQuantity() {
    this.countTotalActualQuantity = this.dataItems.reduce(
      (sum, item) => sum + parseFloat(item.exportQuantity),
      0
    );
  }

  calculateTotalQuantityRequest() {
    this.countTotalQuantityRequest = this.dataItems.reduce(
      (sum, item) => sum + parseFloat(item.requestQuantity),
      0
    );
  }

  clear(keyName: any) {
    this.dataFilterProduct[keyName] = '';
  }
  onHandleActualQuantity(row: any) {
    this.calculateTotalActualQuantity();
  }
  deleteRecord(row: any) {}

  close() {
    this.router.navigate(['./export/list-GDN']);
  }

  modalConfirmDraft: boolean = false;
  draft() {
    this.modalConfirmDraft = true;
  }

  onHandleModalCancelDraft(event: any) {
    this.modalConfirmDraft = event;
  }

  async onHandleModalConfirmDraft(event: any) {
    if (event) {
      let data = {
        gdnDTO: {
          wtrCode: this.params, //để trống là tạo mới, nếu không sẽ update
          transferRequestCode: this.dataInformation.transferRequestCode,
          wtrType: this.dataInformation.wtrType,
          fromWarehouseCode: this.dataInformation.fromWarehouseCode,
          toWarehouseCode: this.dataInformation.toWarehouseCode,
          woCoode: this.dataInformation.woCoode,
          customerCode: this.dataInformation.customerCode,
          status: 0,
          receiverName: this.dataInformation.receiverName,
          approverName: this.dataApprovedBy.approverName,
          approverCode: this.dataApprovedBy.approverCode,
          note: this.dataInformation.note,
        },
        itemList: this.dataItems,
      };
      let resp = await this.gdnService.updatedDraftGDN(data);
      if (resp.result.responseCode == '00') {
        this.messageService.success(`${resp.result.message}`, `Thành công`);
        this.router.navigate(['./export/list-GDN']);
        this.modalConfirmDraft = false;
      } else {
        this.messageService.error(`${resp.result.message}`, `Lỗi`);
      }
    }
  }

  save() {
    if (!this.dataInformation.transferRequestCode) {
      this.messageService.warning(
        `Bạn phải chọn mã yêu cầu xuất kho`,
        `Cảnh báo`
      );
    } else {
      if (this.dataItems.length == 0) {
        this.messageService.warning(`Không có hàng hóa`, `Cảnh báo`);
      } else {
        let check: boolean = true;
        let checkExportPackage: boolean = true;
        this.dataItems.forEach((element) => {
          if (element.exportPackageList == undefined) {
            check = false;
          } else {
            if (element.exportPackageList.length <= 0) check = false;
            else {
              element.exportPackageList.forEach((element: any) => {
                if (element.exportPackageQuantity <= 0) {
                  checkExportPackage = false;
                }
              });
            }
          }
        });
        if (check) {
          if (checkExportPackage) {
            this.dataItems.forEach((element) => {
              element.exportPackageList.forEach((ele: any) => {
                this.dataItemRequest.push(ele);
              });
            });
            this.showApproveBy = true;
          } else {
            this.messageService.warning(
              `Vui lòng nhập đầy đủ số lượng kiện xuất`,
              ` Thông báo`
            );
          }
        } else {
          this.messageService.warning(
            `Vui lòng gán đủ vị trí cho hàng hóa`,
            ` Thông báo`
          );
        }
      }
    }
  }

  dataItemRequest: any[] = [];

  onHandleCancel() {
    this.showApproveBy = false;
  }

  showPopoverEmployee() {}
  popoverVisibleChangeEmployee(event: any) {
    this.showEmployee = event;
  }
  search() {}
  chooseEmployeeExport(row: any) {
    this.showEmployee = false;
    this.dataApprovedBy = {
      approverCode: row.employeeCode,
      approverName: row.employeeName,
    };
  }
  async onHandleSaveEmployee() {
    let data = {
      gdnDTO: {
        ...this.dataInformation,
        wtrCode: this.dataInformation.wtrCode, //để trống là tạo mới, nếu không sẽ update
        transferRequestCode: this.dataInformation.transferRequestCode,
        wtrType: this.dataInformation.wtrType,
        fromWarehouseCode: this.dataInformation.fromWarehouseCode,
        toWarehouseCode: this.dataInformation.toWarehouseCode,
        customerCode: this.dataInformation.customerCode,
        woCode: this.dataInformation.woCode,
        status: 1,
        receiverName: this.dataInformation.receiverName,
        approverName: this.dataApprovedBy.approverName,
        approverCode: this.dataApprovedBy.approverCode,
        note: this.dataInformation.note,
      },
      itemList: this.dataItems,
    };
    let resp = await this.gdnService.updateGDN(data);
    if (resp.result.responseCode == '00') {
      this.messageService.success(`${resp.result.message}`, `Thành công`);
      this.router.navigate(['./export/list-GDN']);
    } else {
      this.messageService.warning(`${resp.result.message}`, `Cảnh báo`);
    }
  }

  modalConfirmApprove: boolean = false;
  approve() {
    this.modalConfirmApprove = true;
  }

  onHandleModalCancelApprove(event: any) {
    this.modalConfirmApprove = false;
  }
  async onHandleModalConfirmApprove(event: any) {
    let resp = await this.gdnService.approveGDN(this.params);
    if (resp.result.responseCode == '00') {
      this.modalConfirmApprove = false;
      this.router.navigate(['./export/list-GDN']);
      this.messageService.success(`${resp.result.message}`, ` Thành công`);
    } else {
      this.messageService.warning(`${resp.result.message}`, ` Thất bại`);
    }
  }
  // Xử lý modal thu hồi
  isVisibleCancel: boolean = false;
  recall() {
    this.visibleRevoke = true;
  }
  visibleRevoke: boolean = false;
  onClickCancelRevoke() {
    this.isVisibleCancel = true;
    this.isVisibleRefuseCancel = true;
  }

  hide(data: any) {
    if (!data) {
      this.visibleRevoke = data;
    }
  }

  onClickCancel() {
    this.isVisibleCancel = true;
  }
  onHandleCancelPopup(event: any) {
    this.isVisibleCancel = event;
  }

  onHandleConfirmPopup(event: any) {
    this.visibleRevoke = event;
  }

  // Từ chối
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

  expandSet = new Set<number>();
  isExpand: boolean = false;

  rowSelect: any = {};
  onClickIcon(element: any) {
    this.rowSelect = element;
    if (this.expandSet.has(element.id)) {
      this.expandSet.delete(element.id);
    } else {
      this.expandSet.add(element.id);
    }
  }

  listOfRadioButton: string[] = ['button.detail', 'button.documentConfirm'];
  choose: number = 0;
  changeSelect(event: any) {
    this.choose = event;
  }

  showFile = false;
  async getFile() {
    let resp = await this.gdnService.getFileGDN(this.params);
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

  showUploadFile: boolean = false;
  onClickAddNew() {
    this.showUploadFile = true;
  }

  listFile: any[] = [];
  onFileChangeShowUpload(event: any) {
    this.showUploadFile = false;
    this.listFile = event;

    console.log(this.listFile);
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
  lastObject(obj: any) {
    if (obj == this.columns[this.columns.length - 1]) {
      return false;
    } else {
      return true;
    }
  }
  onResizeFile({ width }: NzResizeEvent, col: any): void {
    this.columnFile = this.columnFile.map((e) =>
      e.keyTitle === col.keyTitle ? { ...e, width: `${width}px` } : e
    );
  }
  cancelUploadFile() {
    this.showUploadFile = false;
  }

  async update() {
    if (this.listFile.length > 0) {
      let formData: FormData = new FormData();
      for (let file of this.listFile) {
        formData.append('fileData', file);
      }
      let resp = await this.gdnService.putGDN(formData, this.params);
      if (resp.result.responseCode == '00') {
        this.messageService.success(`${resp.result.message}`, `Thành công`);
        this.router.navigate(['./export/list-GDN']);
      } else {
        this.messageService.warning(`${resp.result.message}`, `Cảnh báo`);
      }
    }
  }
  printGDN() {
    this.router.navigate([`./export/list-GDN/${this.params}/config`]);
  }
  protected readonly Date = Date;
}
