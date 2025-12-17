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

@Component({
  selector: 'app-read-GDN',
  templateUrl: './read-GDN.component.html',
  styleUrls: ['./read-GDN.component.css'],
})
export class ReadGDNComponent implements OnInit {
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
    private http: HttpClient
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
    exportType: 1,
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
    // this.readGDN();
  }
  // Nhân viên
  showEmployee: boolean = false;
  dataApprovedBy: any = {};
  listTeamGroup: any[] = [];
  listEmployee: any[] = [];
  dataFilterEmployee: any = {};
  ngOnInit() {
    // this.getExportRequest();
    this.params = this.activatedRoute.snapshot.params['id'];
    this.readGDN(this.params).then(() => {
      // if (this.dataInformation.status == 0) { //Sửa nghiệp vụ 20/09, backend bỏ chức năng này r
      //   this.getMessageRevoke(this.params);
      // }
      if (this.dataInformation.status == 3) {
        this.getMessaRefuse(this.params);
      }
      this.getFile();
    });
    this.getWarehouse();
    this.setBreadcrumb();
    this.getTeamGroup();
    this.getEmployee();
    // this.getDataPrintPDF();
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
        keyTitle: 'Số lượng đã xuất',
        keyName: 'issuedQuantity',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'Số lượng thực xuất',
        keyName: 'actualQuantity',
        width: '200px',
        check: true,
      },
    ];

    this.listStatus = [
      {
        text: 'Bản nháp',
        value: 0,
      },
      {
        text: ' Xuất kho chờ ký xác nhận',
        value: 1,
      },
      {
        text: 'Xuất kho đã ký xác nhận',
        value: 2,
      },
    ];
  }
  async getExportRequest() {
    let data = {
      pageIndex: this.pageExportRequest - 1,
      pageSize: this.perPageExportRequest,
      filter: {
        exportRequestCode: this.dataFilterExportRequestCode.exportRequestCode,
        exportType: this.dataFilterExportRequestCode.exportType,
        warehouseCode: this.dataFilterExportRequestCode.warehouseCode,
        startAt: this.dataFilterExportRequestCode.startAt[0],
        startAt2: this.dataFilterExportRequestCode.startAt[1],
        endAt: this.dataFilterExportRequestCode.endAt[0],
        endAt2: this.dataFilterExportRequestCode.endAt[1],
        soCode: this.dataFilterExportRequestCode.soCode,
        customerCode: this.dataFilterExportRequestCode.customerCode,
        customerName: this.dataFilterExportRequestCode.customerName,
        woCode: this.dataFilterExportRequestCode.woCode,
        orderDate: this.dataFilterExportRequestCode.orderDate[0],
        orderDate2: this.dataFilterExportRequestCode.orderDate[1],
        deliveryAt: this.dataFilterExportRequestCode.deliveryAt[0],
        deliveryAt2: this.dataFilterExportRequestCode.deliveryAt[1],
        // status: 1,
        statusList: [1, 3],
        note: this.dataFilterExportRequestCode.note,
        createdAt: this.dataFilterExportRequestCode.createdAt[0],
        createdAt2: this.dataFilterExportRequestCode.createdAt[1],
        createdBy: this.dataFilterExportRequestCode.createdBy,
        updatedAt: this.dataFilterExportRequestCode.updatedAt[0],
        updatedAt2: this.dataFilterExportRequestCode.updatedAt[1],
      },
      common: '',
    };
    let resp = await this.exportRequestService.listExportRequest(data);
    if (resp.result.responseCode == '00') {
      this.listExportRequestCode = resp.data.filter(
        (item: any) => item.status == 1
      );
      this.totalExportRequest = resp.dataCount;
    }
  }

  dataPrintPDF: any[] = [];
  inforGDN: any;
  getDataPrintPDF() {
    this.exportRequestService.getDataPrintPDF(this.params).subscribe({
      next: (res) => {
        console.log(res);
        this.inforGDN = res.data.gdnDTO;
        if (this.inforGDN.warehouseCode == 'K0001') {
          this.inforGDN.warehouseName = 'Kho sản xuất';
        } else if (this.inforGDN.warehouseCode == 'K0002') {
          this.inforGDN.warehouseName = 'Kho nhà máy';
        }
        if (res.data.itemList.length > 0) {
          for (let i = 0; i < res.data.itemList.length; i++) {
            if (res.data.itemList[i].locationList.length > 0) {
              for (
                let j = 0;
                j < res.data.itemList[i].locationList.length;
                j++
              ) {
                this.dataPrintPDF.push(res.data.itemList[i].locationList[j]);
              }
            }
          }
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

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
        name: 'sidebar.export.name',
        route: ``,
      },
      {
        name: 'sidebar.export.child.goodDeliveryNote.child.list',
        route: `/export/list-GDN`,
      },
      {
        name: 'sidebar.export.child.goodDeliveryNote.child.read',
        route: `/export/list-GDN/${this.params}`,
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

  async readGDN(gdnCode: any) {
    this.loading.start();
    let res = await this.gdnService.readGDN(gdnCode);
    if (res.result.responseCode == '00') {
      this.dataInformation = {
        ...res.data.gdnDTO,
        exportRequestCode: res.data.gdnDTO.exportRequestCode,
        woCode: res.data.gdnDTO.woCode,
        productCode: res.data.gdnDTO.productCode,
        productName: res.data.gdnDTO.productName,
        quantity: res.data.gdnDTO.quantity,
        totalLotNumber: res.data.gdnDTO.totalLotNumber,
        exportType: res.data.gdnDTO.exportType,
        warehouseCode: res.data.gdnDTO.warehouseCode,
        status: res.data.gdnDTO.status,
        shipperCode: res.data.gdnDTO.shipperCode,
        shipper: res.data.gdnDTO.shipperName,
        lotId: res.data.gdnDTO.lotId,
        lotNumber: res.data.gdnDTO.lotNumber,
        receiverName: res.data.gdnDTO.receiverName,
        customerCode: res.data.gdnDTO.customerCode,
        customerName: res.data.gdnDTO.customerName,
        customerAddress: res.data.gdnDTO.customerAddress,
        customerPhone: res.data.gdnDTO.customerPhone,
        startAt: res.data.gdnDTO.startAt
          ? new Date(res.data.gdnDTO.startAt)
          : new Date(''),
        endAt: res.data.gdnDTO.endAt
          ? new Date(res.data.gdnDTO.endAt)
          : new Date(''),
        deliveryAt: res.data.gdnDTO.deliveryAt
          ? new Date(res.data.gdnDTO.deliveryAt)
          : '',
        createdBy: res.data.gdnDTO.createdBy,
        createdAt: new Date(res.data.gdnDTO.createdAt),
        updatedAt: new Date(res.data.gdnDTO.updatedAt),
        note: res.data.gdnDTO.note,
        soCode: res.data.gdnDTO?.soCode || '',
        exportTypeId: res.data.gdnDTO.exportTypeId,
      };

      // this.dataApprovedBy = {
      //   approverName: res.data.gdnDTO.approverName,
      //   approverCode: res.data.gdnDTO.approverCode,
      // };

      this.dataItems = res.data.itemList;
      this.loading.stop();
    }
    this.calculateTotalActualQuantity();
    this.calculateTotalQuantityRequest();
  }

  messageRevoke: any = '';
  async getMessageRevoke(gdnCode: any) {
    let resp = await this.commonService.readRevokeGDN(gdnCode);
    if (resp.data) {
      this.messageRevoke = resp.data.content;
    }
  }

  messageRefuse: any = '';
  async getMessaRefuse(gdnCode: any) {
    let resp = await this.commonService.readRefuseGDN(gdnCode);
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

  searchFollowSelect() { }

  rangeDate() { }
  chooseRow(row: any) {
    this.showExportRequestCode = false;
    this.dataInformation = {
      ...this.dataInformation,
      woCode: row.woCode,
      totalLotNumber: row.totalLotNumber,
      exportRequestCode: row.exportRequestCode,
      exportType: row.exportType,
      warehouseCode: row.warehouseCode,
      customerCode: row.customerCode,
      customerName: row.customerName,
      customerAddress: row.customerAddress,
      customerPhone: row.customerPhone,
      startAt: new Date(row.startAt),
      endAt: new Date(row.endAt),
      orderDate: new Date(row.orderDate),
      deliveryAt: new Date(row.deliveryAt),
    };
    if (this.dataInformation.exportRequestCode) {
      this.readExportRequestCode(this.dataInformation.exportRequestCode);
    }
  }

  async readExportRequestCode(exportRequestCode: any) {
    let res = await this.exportRequestService.readExportRequest(
      exportRequestCode
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
  deleteRecord(row: any) { }

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
          gdnCode: this.params, //để trống là tạo mới, nếu không sẽ update
          exportRequestCode: this.dataInformation.exportRequestCode,
          exportType: this.dataInformation.exportType,
          warehouseCode: this.dataInformation.warehouseCode,
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
    if (!this.dataInformation.exportRequestCode) {
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
          if (element.locationList == undefined) {
            check = false;
          } else {
            if (element.locationList.length <= 0) check = false;
            else {
              element.locationList.forEach((element: any) => {
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
              element.locationList.forEach((ele: any) => {
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

  showPopoverEmployee() { }
  popoverVisibleChangeEmployee(event: any) {
    this.showEmployee = event;
  }
  search() { }
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
        gdnCode: this.dataInformation.gdnCode, //để trống là tạo mới, nếu không sẽ update
        exportRequestCode: this.dataInformation.exportRequestCode,
        exportType: this.dataInformation.exportType,
        warehouseCode: this.dataInformation.warehouseCode,
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

  listOfRadioButton: string[] = ['button.detail'];
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
