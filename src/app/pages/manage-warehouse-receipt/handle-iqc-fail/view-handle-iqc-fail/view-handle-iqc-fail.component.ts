import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { KeycloakService } from 'keycloak-angular';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NzUploadChangeParam } from 'ng-zorro-antd/upload';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CheckRoleService } from 'src/app/services/checkRole.service';
import { ReceiptCommonService } from 'src/app/services/import-warehouse/common/receipt-common.service';
import { ImportRequestService } from 'src/app/services/import-warehouse/import-request/import-request.service';
import { MessageService } from 'src/app/services/message.service';
import { RequestIqcService } from 'src/app/services/request-iqc/request-iqc.service';
import { TransferDataService } from 'src/app/services/transferData.service';
import { environment } from 'src/environment/environment';

@Component({
  selector: 'app-view-handle-iqc-fail',
  templateUrl: './view-handle-iqc-fail.component.html',
  styleUrls: ['./view-handle-iqc-fail.component.css'],
})
export class ViewHandleIqcFailComponent {
  params: any = '';
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
    private requestIqcService: RequestIqcService
  ) { }
  isRole: string | null = this.checkRole.hasAnyRoleOf([
    'wms_buyer',
    'wms_keeper',
  ]);
  // Value
  userName: string = this.keyClockService.getUsername();
  isBreadcrumb: boolean = false;
  isHidden: boolean = true;
  breadcrumbs: Object[] = [];
  currentStatus: number = 0;
  isVisibleCancelRequest: boolean = false;
  isVisibleCancel: boolean = false;
  // Data
  dataInformation: any = {};

  dataFilter: any = {};
  // List
  listImportType: any = [];
  listItems: any = [];
  listPO: any = [];

  listStatus: any = [
    { label: 'importRequest.status.status_1', value: 1 },
    { label: 'importRequest.handleIqcFail.status.status_5', value: 5 },
    { label: 'importRequest.status.status_6', value: 6 },
    { label: 'importRequest.status.status_7', value: 7 },
    { label: 'importRequest.status.status_8', value: 8 },
    { label: 'importRequest.status.status_9', value: 9 },
  ];

  listWarehouse: any[] = [];
  // File
  fileList: any = [];
  // Value
  newFileList: File[] = [];
  columns: any[] = [
    {
      keyTitle: 'ui.receitp.GRN.create.item_code',
      keyName: 'productCode',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'ui.receitp.GRN.create.item_name',
      keyName: 'itemName',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'ui.receitp.GRN.create.description',
      keyName: 'description',
      width: '200px',
      check: true,
    },
    // {
    //   keyTitle: 'ui.receitp.GRN.create.item_type',
    //   keyName: 'itemType',
    //   check: true,
    //   width: '200px',
    // },
    {
      keyTitle: 'table.note_special',
      keyName: 'note',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'createIqc.tableItem.expiredDate',
      keyName: 'expiredDate',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'ui.receitp.GRN.create.supplier',
      keyName: 'supplier',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'ui.receitp.GRN.create.unit',
      keyName: 'uom',
      width: '100px',
      check: true,
    },
    {
      keyTitle: 'createIqc.tableItem.quantity',
      keyName: 'requestQuantity',
      width: '160px',
      check: true,
    },
    {
      keyTitle: 'table.status',
      keyName: 'status',
      width: '160px',
      check: true,
    },
  ];
  listOfRadioButton: string[] = ['button.detail', 'button.attach'];
  currentRadioButtonIndex: number = 0;
  isVisibleConfirmOrderProcessing: boolean = false;
  isVisibleIqcRequest: boolean = false;
  isVisibleCreateImportRequest: boolean = false;
  deliveryAt: any = '';
  listStatusItem: any = [
    { label: 'item.status.status_0', value: 0 },
    { label: 'item.status.status_1', value: 1 },
    { label: 'item.status.status_2', value: 2 },
    { label: 'item.status.status_3', value: 3 },
    { label: 'item.status.status_4', value: 4 },
  ];
  listItemType: any[] = ['Mới', 'Đặc biệt', 'Thông thường'];
  listUom: any = [];
  ngOnInit() {
    this.loading.start();
    this.params = this.activatedRoute.snapshot.params['id'];

    // Lấy danh sách đơn vị tính (uom)
    this.requestIqcService.getListUom().then((response) => {
      this.listUom = response.data;
    });
    // Get list purchase order code
    this.receiptCommonService.getPoCode().then((response) => {
      this.listPO = response.data;
    });
    // Get list warehouse
    this.receiptCommonService.getWarehouse().then((response) => {
      this.listWarehouse = response.data;
    });
    // Get list warehouse
    this.receiptCommonService.getImportType().then((response) => {
      this.listImportType = response.data;
    });

    // Get import request detail
    this.importRequestService
      .getImportRequestDetail(this.activatedRoute.snapshot.params['id'])
      .then((response) => {
        this.dataInformation = response.data.importRequestDTO;
        this.currentStatus = response.data.importRequestDTO.status;
        this.listItems = response.data.listItem;
        this.dataInformation = {
          ...this.dataInformation,
          createdAt: new Date(response.data.importRequestDTO.createdAt),
          updatedAt: new Date(response.data.importRequestDTO.updatedAt),
        }

        if (this.dataInformation.importType == 1) {
          // Lấy danh sách po
          this.receiptCommonService.getPoCode().then((response) => {
            this.listPO = response.data;
            this.deliveryAt = new Date(this.listPO.find(
              (e: any) => e.poCode == this.dataInformation.poCode
            ).deliveryAt);
          });
        }

        this.receiptCommonService
          .getListFile(this.dataInformation.importRequestCode)
          .then((response) => {
            this.fileList = response.data;
          });
      });

    this.setBreadcrumb();
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
        name: 'manageWarehouse.handleIqcFail.handleIqcFail',
        route: `/manage-warehouse-receipt/handle-iqc-failed`,
      },
      {
        name: 'manageWarehouse.handleIqcFail.handleIqcFailDetail',
        route: `/manage-warehouse-receipt/handle-iqc-failed/view-handle-iqc-failed/${this.params}`,
      },
    ];
    this.isBreadcrumb = true;
  }

  // Xử lý file
  handleChange({ file, fileList }: NzUploadChangeParam): void {
    const status = file.status;
    if (status !== 'uploading') {
    }
    if (status === 'done') {
    } else if (status === 'error') {
    }
  }

  // Check object
  lastObject(obj: any) {
    if (obj == this.columns[this.columns.length - 1]) {
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
      this.columns[i].width = width + 'px';
    });
  }

  // Tìm kiếm
  search() { }

  // Đóng
  close() {
    this.router.navigate(['/manage-warehouse-receipt/handle-iqc-failed']);
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

  onFileChange(event: any) {
    this.newFileList = event;
  }

  async onHandleCreateIqcRequest() {
    if (this.setOfCheckedId.size == 0) {
      this.messageService.warning(` Bạn chưa chọn hàng hóa nào`, ` Cảnh báo`)
      return
    } else {
      let arrItemChoose: any[] = []
      this.setOfCheckedId.forEach(element => {
        arrItemChoose.push({
          id: element
        })
      });
      let resp = await this.requestIqcService.postRequestIQC(arrItemChoose, this.dataInformation.importRequestCode)
      if (resp.result.responseCode == '00') {
        this.router.navigate(['./manage-warehouse-receipt/list-of-iqc']);
      } else {
        this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`)
      }
    }
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

  changeSelect(event: any) {
    this.currentRadioButtonIndex = event;
  }

  onConfirmOrderProcessing() {
    this.importRequestService
      .changeStatus(this.dataInformation.importRequestCode, 7)
      .then((response: any) => {
        if (response.result.responseCode == '00') {
          this.messageService.success(
            'Xác nhận xử lý đơn hàng thành công',
            'Thành công'
          );
          this.dataInformation.status = 7
        } else {
          this.messageService.success(
            'Xác nhận xử lý đơn hàng thất bại',
            'Lỗi'
          );
        }
        this.isVisibleConfirmOrderProcessing = false;
      });
  }

  onCreateImportRequest() {
    this.importRequestService
      .changeStatus(this.dataInformation.importRequestCode, 5)
      .then((response: any) => {
        if (response.responseCode == '00') {
          this.messageService.success(
            'Yêu cầu nhập kho thành công',
            'Thành công'
          );
        } else {
          this.messageService.success('Yêu cầu nhập kho thất bại', 'Lỗi');
        }
        this.isVisibleCreateImportRequest = false;
      });
  }

  checked = false;
  indeterminate = false;
  listOfCurrentPageData: readonly any[] = [];
  setOfCheckedId = new Set<number>();

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  onCurrentPageDataChange(listOfCurrentPageData: readonly any[]): void {
    this.listOfCurrentPageData = listOfCurrentPageData;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    const listOfEnabledData = this.listOfCurrentPageData.filter(({ disabled }) => !disabled);
    this.checked = listOfEnabledData.every(({ id }) => this.setOfCheckedId.has(id));
    this.indeterminate = listOfEnabledData.some(({ id }) => this.setOfCheckedId.has(id)) && !this.checked;
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(checked: boolean): void {
    this.listOfCurrentPageData
      .filter(({ disabled }) => !disabled)
      .forEach(({ id }) => this.updateCheckedSet(id, checked));
    this.refreshCheckedStatus();
  }

}
