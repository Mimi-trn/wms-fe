import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { KeycloakService } from 'keycloak-angular';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { PageFilter } from 'src/app/models/request/PageFilter.model';
import { CheckRoleService } from 'src/app/services/checkRole.service';
import { ReceiptCommonService } from 'src/app/services/import-warehouse/common/receipt-common.service';
import { ImportRequestService } from 'src/app/services/import-warehouse/import-request/import-request.service';
import { MessageService } from 'src/app/services/message.service';
import { TransferDataService } from 'src/app/services/transferData.service';
import { environment } from 'src/environment/environment';
import jwt_decode from 'jwt-decode';
import { ExportRequestService } from 'src/app/services/export-warehouse/exportRequestService.service';

@Component({
  selector: 'app-view-detail-import-request',
  templateUrl: './view-detail-import-request.component.html',
  styleUrls: ['./view-detail-import-request.component.css'],
})
export class ViewDetailImportRequestComponent implements OnInit {
  checkIsRole(role: string) {
    return this.checkRole.checkRole(role);
  }
  constructor(
    private activatedRoute: ActivatedRoute,
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    private loading: NgxUiLoaderService,
    private receiptCommonService: ReceiptCommonService,
    private importRequestService: ImportRequestService,
    private checkRole: CheckRoleService,
    private transferdata: TransferDataService,
    private http: HttpClient,
    private keyClockService: KeycloakService,
    private exportRequestService: ExportRequestService
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
      this.checkGroupsInTokenBuyer =
        encodedToken.groups.includes('/WMS_GROUP_BUYER');
    });
  }
  isRole: string | null = this.checkRole.hasAnyRoleOf([
    'wms_buyer',
    'wms_keeper',
  ]);
  // Lấy username từ keyclock
  userName: string = this.keyClockService.getUsername();
  params: string = this.activatedRoute.snapshot.params['id'];
  // Danh sách breadcrumbs
  breadcrumbs: any = [
    {
      name: 'menu.manage.receipt',
      route: ``,
    },
    {
      name: 'menu.manage.receipt.list',
      route: `/manage-warehouse-receipt/required-receipt-warehouse`,
    },
    {
      name: 'manage.receipt.view.detail',
      route: `/manage-warehouse-receipt/required-receipt-warehouse/view-detail-receipt/${this.activatedRoute.snapshot.params['id']}`,
    },
  ];
  // Lưu trạng thái hiện tại của yêu cầu nhập kho để xử lý ẩn hiện các button
  currentStatus: number = 0;
  // Lưu dữ liệu thông tin của yêu cầu nhập kho
  dataInformation: any = {};
  // Danh sách các file đã được lưu theo yêu cầu nhập kho
  fileList: any = [];
  // Danh sách các file vừa được tải lên từ client
  newFileList: File[] = [];
  // Danh sách trạng thái của yêu cầu nhập kho
  listStatus: any = [
    { label: 'Bản nháp', value: 0 },
    { label: 'importRequest.status.status_5', value: 5 },
    { label: 'importRequest.status.status_6', value: 6 },
    { label: 'importRequest.status.status_7', value: 7 },
    { label: 'importRequest.status.status_8', value: 8 },
    { label: 'importRequest.status.status_9', value: 9 },
    { label: 'importRequest.status.status_10', value: 10 },
  ];
  // Lấy danh sách kho, loại nhập kho, danh sách PO để hiển thị theo select box
  listWarehouse: any = [];
  listImportType: any = [];
  listPO: any = [];
  // Lưu danh sách hàng hóa theo yêu cầu nhập kho
  listItems: any = [];
  // Danh sách các cột của bảng hàng hóa
  itemColumnsTable: any[] = [];
  // Danh sách các radio button
  listOfRadioButton: string[] = ['button.detail'];
  // Index của radio button hiện tại
  currentRadioButtonIndex: number = 0;

  dataFilter: any = {};

  isVisibleCancelRequest: boolean = false;
  isVisibleCancel: boolean = false;
  isVisibleCreateGrn: boolean = false;

  selectedItemView: string = 'detail';
  deliveryAt: any = '';

  // Kiểm tra tồn tại quyền
  token: any = '';
  checkGroupsInTokenQCER: boolean = false;
  checkGroupsInTokenBuyer: boolean = false;
  checkGroupsInTokenSaler: boolean = false;
  checkGroupsInTokenKeeper: boolean = false;
  checkGroupsInTokenAdmin: boolean = false;
  getDecodedAccessToken(token: string): any {
    try {
      return jwt_decode(token);
    } catch (Error) {
      return null;
    }
  }

  async getToken() {
    this.token = await this.keyClockService.getToken();
  }

  reason: any = '';
  async getReason() {
    let resp = await this.importRequestService.getReasonRevoke(
      this.activatedRoute.snapshot.params['id']
    );
    if (resp.result.responseCode == '00') {
      if (resp.data) {
        this.reason = resp.data.content;
      }
    }
  }

  ngOnInit() {
    this.loading.start();
    // this.translateService
    //   .get('manage.receipt.view.detail')
    //   .subscribe((text) => {
    //     this.title.setTitle(text);
    //   });
    // Lấy danh sách kho
    this.receiptCommonService.getWarehouse().then((response) => {
      this.listWarehouse = response.data;
    });
    // Lấy danh sách loại nhập kho
    this.receiptCommonService.getImportType().then((response) => {
      this.listImportType = response.data;
    });
    // Lấy thông tin yêu cầu IQC
    this.importRequestService
      .getImportRequestDetail(this.activatedRoute.snapshot.params['id'])
      .then((response) => {
        this.dataInformation = response.data.importRequestDTO;

        console.log('dataInformation', this.dataInformation);
        this.getReason();
        this.listItems = response.data.listItem;
        console.log(this.listItems);
        this.currentStatus = response.data.importRequestDTO.status;
        console.log(this.currentStatus);

        this.dataInformation.startDate = response.data.importRequestDTO.startAt
          ? new Date(response.data.importRequestDTO.startAt)
          : '';
        this.dataInformation.contractCreatedAt = response.data.importRequestDTO
          .contractCreatedAt
          ? new Date(response.data.importRequestDTO.contractCreatedAt)
          : '';
        this.dataInformation.deliveryDate = response.data.importRequestDTO
          .deliveryDate
          ? new Date(response.data.importRequestDTO.deliveryDate)
          : '';
        this.dataInformation.endDate = response.data.importRequestDTO.endAt
          ? new Date(response.data.importRequestDTO.endAt)
          : '';
        this.dataInformation.updatedAt = response.data.importRequestDTO
          .updatedAt
          ? new Date(response.data.importRequestDTO.updatedAt)
          : '';
        this.dataInformation.createdAt = response.data.importRequestDTO
          .createdAt
          ? new Date(response.data.importRequestDTO.createdAt)
          : '';
        this.receiptCommonService
          .getListReportFile(this.dataInformation.importRequestCode)
          .then((response) => {
            this.listFileReport = response.data.map((item: any) => ({
              ...item,
              name: item.fileName,
            }));
          });
        // if (this.dataInformation.importType == 1) {
        //   this.listOfRadioButton = ['button.detail'];
        //   // Lấy danh sách po
        //   this.receiptCommonService.getPoCode().then((response) => {
        //     this.listPO = response.data;
        //     this.deliveryAt = this.listPO.find(
        //       (e: any) => e.poCode == this.dataInformation.poCode
        //     ).deliveryAt;
        //   });
        // }
        if (
          this.dataInformation.importType !== 2 &&
          this.dataInformation.importType !== 3
        ) {
          this.receiptCommonService
            .getListFile(this.dataInformation.importRequestCode)
            .then((response) => {
              this.fileList = response.data;
            });
        }
        if (this.dataInformation.importType == 2) {
          this.itemColumnsTable = [
            {
              keyTitle: 'manage.receipt.create.list.itemCode',
              keyName: 'productCode',
              width: '200px',
              check: true,
            },
            {
              keyTitle: 'manage.receipt.create.list.itemName',
              keyName: 'itemName',
              width: '200px',
              check: true,
            },
            {
              keyTitle: 'manage.receipt.create.list.description',
              keyName: 'itemName',
              width: '200px',
              check: true,
            },
            {
              keyTitle: 'manage.receipt.create.infor.warehouse',
              keyName: 'warehouseCode',
              width: '200px',
              check: true,
            },
            {
              keyTitle: 'manage.receipt.create.list.unit',
              keyName: 'uom',
              width: '200px',
              check: true,
            },
            {
              keyTitle: 'manage.receipt.create.list.requestQuantity',
              keyName: 'requestQuantity',
              width: '180px',
              check: true,
            },
            {
              keyTitle: 'manage.receipt.create.list.receiptQuantity', //So luong da nhap
              keyName: 'inventoryQuantity',
              width: '180px',
              check: true,
            },
            {
              keyTitle: 'Số lượng cần nhập',
              keyName: 'openQuantity',
              width: '180px',
              check: true,
            },
          ];
          this.onHandleFetchListWo();
          console.log('col:', this.itemColumnsTable);
        } else if (this.dataInformation.importType == 3) {
          this.itemColumnsTable = [
            {
              keyTitle: 'manage.receipt.create.list.itemCode',
              keyName: 'productCode',
              width: '200px',
              check: true,
            },
            {
              keyTitle: 'manage.receipt.create.list.itemName',
              keyName: 'itemName',
              width: '200px',
              check: true,
            },
            {
              keyTitle: 'manage.receipt.create.list.description',
              keyName: 'description',
              width: '200px',
              check: true,
            },
            {
              keyTitle: 'manage.receipt.create.infor.warehouse',
              keyName: 'warehouseCode',
              width: '200px',
              check: true,
            },
            {
              keyTitle: 'manage.receipt.create.list.unit',
              keyName: 'uom',
              width: '200px',
              check: true,
            },
            {
              keyTitle: 'manage.receipt.create.list.requestQuantity',
              keyName: 'requestQuantity',
              width: '180px',
              check: true,
            },
            {
              keyTitle: 'manage.receipt.create.list.receiptQuantity', //So luong da nhap
              keyName: 'inventoryQuantity',
              width: '180px',
              check: true,
            },
            {
              keyTitle: 'Số lượng cần nhập',
              keyName: 'openQuantity',
              width: '180px',
              check: true,
            },
          ];
          this.onHandleFetchListWo();
        } else if (this.dataInformation.importType == 6) {
          this.itemColumnsTable = [
            {
              keyTitle: 'manage.receipt.create.list.itemCode',
              keyName: 'productCode',
              width: '200px',
              check: true,
            },
            {
              keyTitle: 'manage.receipt.create.list.itemName',
              keyName: 'itemName',
              width: '200px',
              check: true,
            },
            {
              keyTitle: 'manage.receipt.create.infor.warehouse',
              keyName: 'warehouseCode',
              width: '200px',
              check: true,
            },
            {
              keyTitle: 'manage.receipt.create.list.unit',
              keyName: 'uom',
              width: '200px',
              check: true,
            },
            {
              keyTitle: 'manage.receipt.create.list.requestQuantity',
              keyName: 'requestQuantity',
              width: '180px',
              check: true,
            },
            {
              keyTitle: 'manage.receipt.create.list.receiptQuantity', //So luong da nhap
              keyName: 'inventoryQuantity',
              width: '180px',
              check: true,
            },
            {
              keyTitle: 'Số lượng cần nhập', //So luong da nhap
              keyName: 'openQuantity',
              width: '180px',
              check: true,
            },
            {
              keyTitle: 'table.status',
              keyName: 'status',
              width: '180px',
              check: true,
            },
          ];
        } else {
          this.itemColumnsTable = [
            {
              keyTitle: 'manage.receipt.create.list.itemCode',
              keyName: 'productCode',
              width: '200px',
              check: true,
            },
            {
              keyTitle: 'manage.receipt.create.list.itemName',
              keyName: 'itemName',
              width: '200px',
              check: true,
            },
            {
              keyTitle: 'manage.receipt.create.infor.warehouse',
              keyName: 'warehouseCode',
              width: '200px',
              check: true,
            },
            {
              keyTitle: 'manage.receipt.create.list.unit',
              keyName: 'uom',
              width: '200px',
              check: true,
            },
            {
              keyTitle: 'manage.receipt.create.list.numberOfQc',
              keyName: 'numberOfQc',
              width: '200px',
              check: true,
            },
            {
              keyTitle: 'manage.receipt.create.list.requestQuantity',
              keyName: 'requestQuantity',
              width: '180px',
              check: true,
            },
            {
              keyTitle: 'manage.receipt.create.list.receiptQuantity', //So luong da nhap
              keyName: 'inventoryQuantity',
              width: '180px',
              check: true,
            },
            {
              keyTitle: 'Số lượng cần nhập',
              keyName: 'openQuantity',
              width: '180px',
              check: true,
            },
            {
              keyTitle: 'table.status',
              keyName: 'status',
              width: '180px',
              check: true,
            },
          ];
        }
        // bổ sung nghiệp vụ có 1 mình mã PO -> có status, có mã WO hoặc có mã WO và mã PO -> ko có status
        if (this.dataInformation.woCode) {
          this.itemColumnsTable = this.itemColumnsTable.filter(
            (col) => col.keyName !== 'status'
          );
        }
        this.calculateTotalRequestQuantity();
      });
    this.loading.stop();
  }

  // Check object
  lastObject(obj: any) {
    if (obj == this.itemColumnsTable[this.itemColumnsTable.length - 1]) {
      return false;
    } else {
      return true;
    }
  }
  // Hàm xử lý sự kiện onResize
  id = -1;
  onResize({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.itemColumnsTable[i].width = width + 'px';
    });
  }

  // Tìm kiếm
  search() {}

  // sendRequestCreateIqc() {
  //   console.log(this.dataInformation);
  // }

  isVisibleSendConfirm: boolean = false;
  onHandleCancelPopup1(event: any) {
    this.isVisibleSendConfirm = event;
  }

  // Lưu
  save() {
    if (
      this.listItems.filter((item: any) => {
        return item.status == 3;
      })
    ) {
      this.importRequestService
        .changeStatus(this.dataInformation.importRequestCode, 1)
        .then((response) => {
          if (response.result.ok) {
            this.receiptCommonService
              .changeStatusToWaitQc(
                this.dataInformation.importRequestCode,
                this.listItems.filter((item: any) => {
                  return item.status == 3;
                })
              )
              .then((response) => {
                if (response.result.ok) {
                  this.messageService.success(
                    'Cập nhật trạng thái thành công',
                    'Thành công'
                  );
                  this.router.navigate([
                    './manage-warehouse-receipt/required-receipt-warehouse',
                  ]);
                } else {
                  this.messageService.error(
                    'Cập nhật trạng thái thất bại',
                    'Lỗi'
                  );
                }
              });
          } else {
            this.messageService.error('Cập nhật trạng thái thất bại', 'Lỗi');
          }
        });
    }
  }

  countRequestQuantity: number = 0;
  calculateTotalRequestQuantity() {
    this.countRequestQuantity = this.listItems.reduce(
      (sum: any, item: any) => sum + item.requestQuantity,
      0
    );
  }

  // Đóng
  close() {
    this.router.navigate([
      '/manage-warehouse-receipt/required-receipt-warehouse',
    ]);
  }

  cancelRequest() {
    this.isVisibleCancelRequest = true;
  }

  onCancelRequestPopup() {
    this.isVisibleCancel = true;
  }

  hideCancelRequest(event: any) {
    this.isVisibleCancelRequest = event;
  }

  onHandleCancelPopup(event: any) {
    this.isVisibleCancelRequest = event;
  }

  onHandleConfirmPopup(event: any) {
    this.isVisibleCancel = event;
  }

  changeItemView(event: any) {
    this.selectedItemView = event;
  }

  onFileChange(event: any) {
    this.newFileList = event;
  }

  createImport() {
    let listPassItem = this.listItems.filter((item: any) => {
      return item.status == 2;
    });

    let data = {
      grn: {
        code: this.dataInformation.importRequestCode,
        importType: this.dataInformation.importType,
        warehouseCode: this.dataInformation.warehouseCode,
        status: 1,
        poCode: this.dataInformation.poCode,
        importRequestCode: this.dataInformation.code,
        deliveryAt: this.dataInformation.deliveryAt,
        invoiceCode: this.dataInformation.invoiceCode,
        shipper: this.dataInformation.shipper,
        note: this.dataInformation.note,
      },
      listItem: listPassItem,
      fileList: this.fileList,
      dataInformation: this.dataInformation,
    };

    console.log(data);
    this.transferdata.setObjectFromImportRequest(data);
    this.router.navigate([
      './manage-warehouse-receipt/create-good-receipt-note',
    ]);
  }

  convertToKb(byte: any) {
    return Math.ceil(Number(byte) / 1024) + 'Kb';
  }

  downloadFile(file: any) {
    this.http
      .post(environment.api_end_point + `/api/file/download/${file.id}`, '', {
        observe: 'response',
        responseType: 'blob',
      })
      .subscribe((response) => {
        let a = document.createElement('a');
        a.download = file.fileName;
        a.href = window.URL.createObjectURL(response.body as Blob);
        a.click();
      });
  }

  // Thay đổi lựa chọn hiển thị danh sách hàng hóa
  changeSelect(event: any) {
    this.currentRadioButtonIndex = event;
  }

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
        this.dataInformation.lotId = res.data.content[0].lotId
          ? res.data.content[0].lotId
          : '';
        this.dataInformation.lotNumber = res.data.content[0].lotNumber
          ? res.data.content[0].lotNumber
          : '';
        this.dataInformation.startDate = res.data.content[0].startDate
          ? new Date(res.data.content[0].startDate)
          : '';
        this.dataInformation.endDate = res.data.content[0].endDate
          ? new Date(res.data.content[0].endDate)
          : '';
        this.dataInformation.soCode = res.data.content[0].soCode || '';
        this.dataInformation.customerName =
          res.data.content[0].customerName || '';
      } else {
        this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
      }
    } else {
      this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
    }
  }

  showUploadFile: boolean = false;
  onClickAddNew() {
    this.showUploadFile = true;
  }

  listFileReport: any[] = [];

  // onFileChangeShowUpload(event: any) {
  //   this.listFileReport = event;
  // }
  // cancelUploadFile() {
  //   this.showUploadFile = false;
  // }
  // deleteFile(row: any) {
  //   this.listFileReport = this.listFileReport.filter(
  //     (item) => item.name !== row.name
  //   );
  // }
  // @ViewChild('fileInput') fileInput: any;
  // uploadedFiles: File[] = [];
  // onFilesAdded() {
  //   const files: { [key: string]: File } = this.fileInput.nativeElement.files;
  //   for (let key in files) {
  //     if (files.hasOwnProperty(key)) {
  //       this.uploadedFiles.push(files[key]);
  //     }
  //   }

  //   this.listFileReport = this.uploadedFiles;
  //   // Tại đây, bạn có thể xử lý danh sách file đã tải lên theo nhu cầu của bạn
  // }
  idFile = -1;
  onResizeFile({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.idFile);
    this.idFile = requestAnimationFrame(() => {
      this.columnFile[i].width = width + 'px';
    });
  }
  downloadFileReport(file: any) {}

  isVisibleRevoke: boolean = false;
  currentRevoke: any = {};
  onHandleRevoke() {
    this.isVisibleRevoke = true;
  }

  onHandleRevokeCancel(event: any) {
    this.isVisibleRevoke = event;
  }
  onHandleRevokeConfirm(event: any) {
    this.router.navigate([
      `./manage-warehouse-receipt/required-receipt-warehouse`,
    ]);
  }

  showSendImportRequest: boolean = false;
  formData: FormData = new FormData();

  // Xử tạo yêu cầu nhập kho
  createIqcRequest(iqcData: any) {
    this.formData.delete('textData');
    this.formData.delete('fileData');

    iqcData = { ...iqcData, deliveryAt: this.deliveryAt };

    for (let file of this.newFileList) {
      this.formData.append('fileData', file);
    }

    for (let file of this.listFileReport) {
      this.formData.append('reportData', file);
    }

    this.formData.append(
      'textData',
      new Blob([JSON.stringify(iqcData.listItem)], {
        type: 'application/json',
      })
    );
    this.formData.append(
      'importRequest',
      new Blob([JSON.stringify(iqcData.importRequestDTO)], {
        type: 'application/json',
      })
    );
    this.importRequestService
      .putImportRequest(this.dataInformation.id, this.formData)
      .then((response) => {
        if (response.result.ok == true) {
          this.messageService.success(
            'Gửi yêu cầu nhập kho thành công',
            'Thành công'
          );
          this.router.navigate([
            './manage-warehouse-receipt/required-receipt-warehouse',
          ]);
        } else {
          this.messageService.error(response.result.message, ' Thông báo');
        }
      });
  }

  sendImportRequest() {
    // console.log(this.dataInformation);
    // console.log(this.listItems);
    // console.log(this.listFileReport);
    console.log(this.dataInformation.importType);

    let iqcData = {
      importRequestDTO: this.dataInformation,
      listItem: this.listItems,
    };

    if (this.listFileReport.length <= 0) {
      this.messageService.warning(
        ` Biên bản kiểm tra không được bỏ trống`,
        ` Cảnh báo`
      );
      return;
    } else {
      switch (this.dataInformation.importType) {
        // Xuất kho mua hàng
        // case 1: {
        //   if (
        //     !this.importRequest.importType ||
        //     !this.importRequest.warehouseCode ||
        //     !this.importRequest.poCode ||
        //     !this.isValidListItem(this.dataItem) ||
        //     (this.newFileList.length == 0 && this.fileList.length == 0)
        //   ) {
        //     this.messageService.warning(
        //       'Hãy nhập đầy đủ thông tin',
        //       ' Cảnh báo'
        //     );
        //   } else {
        //     this.createIqcRequest(iqcData);
        //   }
        //   break;
        // }
        // Xuất kho BTP
        case 2: {
          if (
            !this.dataInformation.importType ||
            !this.dataInformation.warehouseCode ||
            !this.dataInformation.woCode
          ) {
            this.messageService.warning(
              'Hãy nhập đầy đủ thông tin yêu cầu',
              ' Cảnh báo'
            );
          } else if (!this.isValidListItem(this.listItems)) {
            this.messageService.warning('Không có hàng hóa', ' Cảnh báo');
          } else {
            this.createIqcRequest(iqcData);
          }
          break;
        }
        // Xuất kho NVL dư thừa
        case 3: {
          if (
            !this.dataInformation.importType ||
            !this.dataInformation.warehouseCode ||
            !this.dataInformation.woCode
          ) {
            this.messageService.warning(
              'Hãy nhập đầy đủ thông tin yêu cầu',
              ' Cảnh báo'
            );
          } else if (!this.isValidListItem(this.listItems)) {
            this.messageService.warning('Không có hàng hóa', ' Cảnh báo');
          } else {
            this.createIqcRequest(iqcData);
          }
          break;
        }
        // Xuất kho hàng ký gửi
        case 4: {
          this.createIqcRequest(iqcData);
          break;
        }
        case 5: {
          // Xuất kho hàng bán trả lại
          break;
        }
        // Xuất kho  khác
        case 6: {
          if (
            !this.dataInformation.importType ||
            !this.dataInformation.warehouseCode ||
            !this.isValidListItem(this.listItems)
          ) {
            this.messageService.warning(
              'Hãy nhập đầy đủ thông tin',
              ' Cảnh báo'
            );
          } else {
            // console.log(iqcData);

            this.createIqcRequest(iqcData);
          }
          break;
        }
      }
    }
  }

  isValidListItem(listItem: any): boolean {
    let isStatus: boolean = false;
    if (this.dataInformation.importType !== 3) {
      // for (let i = 0; i < listItem.length; i++) {
      //   if (!listItem[i].itemType || !listItem[i].requestQuantity) {
      //     return false;
      //   }
      //   if (
      //     !listItem[i].note &&
      //     (listItem[i].itemType == 'Mới' || listItem[i].itemType == 'Đặc biệt')
      //   ) {
      //     return false;
      //   }
      //   if (listItem[i].requestQuantity <= 0) {
      //     return false;
      //   }
      // }
      return true;
    } else if (this.dataInformation.importType == 3) {
      for (let i = 0; i < listItem.length; i++) {
        if (!listItem[i].requestQuantity || listItem[i].requestQuantity <= 0) {
          return false;
        }
      }
      return true;
    } else if (this.dataInformation.importType == 2) {
      for (let i = 0; i < listItem.length; i++) {
        if (!listItem[i].requestQuantity || listItem[i].requestQuantity <= 0) {
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  }

  @ViewChild('fileInput') fileInput: any;
  uploadedFiles: File[] = [];

  onFileChangeShowUpload(event: any) {
    event.preventDefault();
    const selectedFiles: File[] = Array.from(event.target.files);
    this.handleFileSelection(selectedFiles);
  }

  handleFileSelection(selectedFiles: File[]) {
    for (const file of selectedFiles) {
      if (this.isFileExist(file.name)) {
        this.messageService.warning(
          `File ${file.name} đã tồn tại trong danh sách`,
          ` Thông báo`
        );
      } else {
        this.uploadedFiles.push(file);
        this.listFileReport = [...this.uploadedFiles];
        this.showUploadFile = false;
        console.log(this.listFileReport);
      }
    }
  }

  isFileExist(fileName: string): boolean {
    return this.uploadedFiles.some((file) => file.name === fileName);
  }

  deleteFile(row: any) {
    const index = this.listFileReport.findIndex(
      (file) => file.name === row.name
    );
    if (index !== -1) {
      this.uploadedFiles.splice(index, 1);
      this.messageService.success(`Đã xóa ${row.name} khỏi danh sách`, ``);
    }
    this.listFileReport = this.listFileReport.filter(
      (item) => item.name !== row.name
    );
  }
  cancelUploadFile() {
    this.showUploadFile = false;
  }

  columnFile: any[] = [
    {
      keyTitle: 'sidebar.receipt.child.CreateIQCRequest.file.fileTag',
      keyName: 'fileTag',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'sidebar.receipt.child.CreateIQCRequest.file.sendBy',
      keyName: 'sendBy',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'sidebar.receipt.child.CreateIQCRequest.file.sendDate',
      keyName: 'sendDate',
      width: '200px',
      check: true,
    },
  ];
}
