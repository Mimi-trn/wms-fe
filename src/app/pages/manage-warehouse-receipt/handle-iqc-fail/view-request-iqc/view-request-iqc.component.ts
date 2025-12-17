import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { KeycloakService } from 'keycloak-angular';
import * as moment from 'moment';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NzUploadChangeParam } from 'ng-zorro-antd/upload';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CheckRoleService } from 'src/app/services/checkRole.service';
import { ExportRequestService } from 'src/app/services/export-warehouse/exportRequestService.service';
import { ReceiptCommonService } from 'src/app/services/import-warehouse/common/receipt-common.service';
import { ImportRequestService } from 'src/app/services/import-warehouse/import-request/import-request.service';
import { MessageService } from 'src/app/services/message.service';
import { RequestIqcService } from 'src/app/services/request-iqc/request-iqc.service';
import { TransferDataService } from 'src/app/services/transferData.service';
import { environment } from 'src/environment/environment';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-view-request-iqc',
  templateUrl: './view-request-iqc.component.html',
  styleUrls: ['./view-request-iqc.component.css'],
})
export class ViewRequestIqcComponent {
  params: any = '';
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
    private requestIqcService: RequestIqcService,
    private exportRequestService: ExportRequestService
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
  selectedItemView: string = 'detail';
  // Data
  dataInformation: any = {};

  dataFilter: any = {};
  // List
  listImportType: any = [];
  listItems: any = [];
  listPO: any = [];

  listStatus: any = [
    { label: 'importRequest.status.status_0', value: 0 },
    { label: 'importRequest.status.status_1', value: 1 },
    { label: 'importRequest.status.status_2', value: 2 },
    { label: 'importRequest.status.status_3', value: 3 },
    { label: 'importRequest.status.status_5and6', value: 5 },
    { label: 'importRequest.status.status_5and6', value: 6 },
  ];

  listStatusItem: any = [
    { label: 'item.status.status_0', value: 0 },
    { label: 'item.status.status_1', value: 1 },
    { label: 'item.status.status_2', value: 2 },
    { label: 'item.status.status_3', value: 3 },
    { label: 'item.status.status_4', value: 4 },
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
      keyTitle: 'manage.receipt.create.infor.warehouse',
      keyName: 'warehouseCode',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'ui.receitp.GRN.create.unit',
      keyName: 'supplierUom',
      width: '100px',
      check: true,
    },
    {
      keyTitle: 'createIqc.tableItem.requestQuantity',
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
    {
      keyTitle: 'Kết luận',
      keyName: 'conclusion',
      width: '160px',
      check: true,
    },
  ];
  isVisibleConfirmWithDraw: boolean = false;
  deliveryAt: any = '';
  listOfRadioButton: string[] = ['button.detail'];
  currentRadioButtonIndex: number = 0;
  listItemType: any[] = ['Mới', 'Đặc biệt', 'Thông thường'];
  listUom: any = [];
  listContract: any = [];
  filterPO: any = {};
  totalRequestQuantity: number = 0;
  isOpenTablePo: boolean = false;
  formData: FormData = new FormData();

  ngOnInit() {
    this.loading.start();
    this.params = this.activatedRoute.snapshot.params['id'];
    // this.translateService
    //   .get('manage.receipt.view.detail')
    //   .subscribe((text) => {
    //     this.title.setTitle(text);
    //   });
    // Lấy danh sách đơn vị tính (uom)
    this.requestIqcService.getListUom().then((response) => {
      this.listUom = response.data;
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
        this.dataInformation = {
          ...response.data.importRequestDTO,
        };

        console.log('dataInformation', this.dataInformation);
        this.currentStatus = response.data.importRequestDTO.status;
        this.listItems = response.data.listItem;

        console.log('listItems', this.listItems);
        this.dataFilterWoCode.woCode = this.dataInformation.woCode;

        if (this.dataInformation.importType == 3) {
          if (this.dataInformation.woCode) {
            this.onHandleFetchListWo().then(() => {
              if (this.listWo.length > 0) {
                this.dataInformation = {
                  ...this.dataInformation,
                  totalLotNumber: this.listWo[0].totalLotNumber,
                  startDate: this.listWo[0].startDate
                    ? new Date(this.listWo[0].startDate)
                    : '',
                  endDate: this.listWo[0].endDate
                    ? new Date(this.listWo[0].endDate)
                    : '',
                };
              }
            });
            this.getListItemsMaterial();
          } else {
          }
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
        name: 'manageWarehouse.listOfIqc.listOfIqc',
        route: `/manage-warehouse-receipt/list-of-iqc`,
      },
      {
        name: 'manageWarehouse.listOfIqc.requestIqcDetail',
        route: `/manage-warehouse-receipt/list-of-iqc/view-request-iqc/${this.params}`,
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
    this.router.navigate(['/manage-warehouse-receipt/list-of-iqc']);
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

  convertToKb(byte: any) {
    return Math.ceil(Number(byte) / 1024) + 'Kb';
  }

  downloadFile(file: any) {
    this.loading.start();
    this.http
      .post(environment.api_end_point + `/api/file/download/${file.id}`, '', {
        observe: 'response',
        responseType: 'blob',
      })
      .pipe(
        finalize(() => {
          this.loading.stop();
        })
      )
      .subscribe(
        (response) => {
          let a = document.createElement('a');
          a.download = file.fileName;
          a.href = window.URL.createObjectURL(response.body as Blob);
          a.click();
        },
        (error) => {
          console.error('Download failed:', error);
        }
      );
  }

  async createIqcRequest() {
    if (this.dataInformation.importType !== 3) {
      let data = {
        importRequest: this.dataInformation,
        listItem: this.listItems,
      };
      this.transferdata.changeMessage(data);
      this.router.navigate(['./manage-warehouse-receipt/create-iqc-request']);
    } else if (this.dataInformation.importType == 3) {
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
        let inforRequest = {
          importRequestDTO: {
            id: null, //tạo mới thì bỏ cái này
            importRequestCode: this.dataInformation.importRequestCode, //tạo mới thì bỏ cái này
            importType: 3,
            warehouseCode: this.dataInformation.warehouseCode,
            shipper: this.dataInformation.shipper,
            woCode: this.dataInformation.woCode,
            totalLotNumber: this.dataInformation.totalLotNumber,
            startAt: this.dataInformation.startDate,
            endAt: this.dataInformation.endDate,
            note: this.dataInformation.note,
            importTypeId: this.dataInformation.importTypeId,
          },
          listItem: this.listItems,
        };
        let res =
          await this.importRequestService.createImportRequestWithTypeThree(
            inforRequest,
            3
          );
        if (res.result.responseCode == '00') {
          this.messageService.success(
            'Thêm yêu cầu nhập kho thành công',
            ` Thành công`
          );
          this.router.navigate([
            './manage-warehouse-receipt/required-receipt-warehouse',
          ]);
        } else {
          this.messageService.error(res.result.message, ' Thông báo');
        }
      }
    }
  }

  onChangeRequestQuantity(row: any) {
    if (row.qcQuarequestQuantityntity <= 0) {
      row.requestQuantity = 1;
      this.messageService.warning('Số lượng phải lớn hơn 0', 'Cảnh báo');
    } else {
      this.totalRequestQuantity = 0;
      this.listItems.forEach((data: any) => {
        if (data.requestQuantity) {
          this.totalRequestQuantity =
            this.totalRequestQuantity + Number(data.requestQuantity);
        }
      });
    }
  }

  isValidListItem(listItem: any): boolean {
    let isStatus: boolean = false;
    if (this.dataInformation.importType !== 3) {
      for (let i = 0; i < listItem.length; i++) {
        if (!listItem[i].itemType || !listItem[i].requestQuantity) {
          return false;
        }
        if (
          !listItem[i].note &&
          (listItem[i].itemType == 'Mới' || listItem[i].itemType == 'Đặc biệt')
        ) {
          return false;
        }
        if (listItem[i].requestQuantity <= 0) {
          return false;
        }
      }
      return true;
    } else if (this.dataInformation.importType == 3) {
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

  saveDraft() {
    let payload = this.listItems

    console.log(payload)
    this.receiptCommonService.update(this.dataInformation.importRequestCode, payload)
      .then((res: any) => {
        if (res.result.responseCode == '00') {
          this.messageService.success('Cập nhật thành công', 'Thành công');
          window.location.reload();
        }
      })
  }


  changeSelect(event: any) {
    this.currentRadioButtonIndex = event;
  }

  // Xử lý thay đổi lựa chọn po
  changePoCode(event: any) {
    this.deliveryAt = new Date(
      this.listPO.find((po: any) => {
        return po.poCode == event;
      }).deliveryAt
    );
    this.totalRequestQuantity = 0;
    this.dataInformation.poCode = event;
    this.receiptCommonService.getListItemsByPoCode(event).then((response) => {
      this.listItems = response.data;
      this.listItems.forEach((data: any) => {
        this.totalRequestQuantity =
          this.totalRequestQuantity + Number(data.requestQuantity);
      });
    });

    this.isOpenTablePo = false;
  }

  // Xử lý sự kiện nhập kho NVL dư thừa
  listWo: any[] = [];
  isOpenlistWo: boolean = false;
  dataInformationWo: any = {
    woCode: '',
    totalLotNumber: '',
  };
  totalWoCode: any = 0;
  pageWoCode: any = 1;
  perPageWoCode: any = 10;
  dataFilterWoCode: any = {
    startAt: [],
    endAt: [],
    updatedAt: [],
  };
  // Hàng hóa NVL dư thừa
  pageItem: any = 1;
  perPageItem: any = 10;
  totalItem: any = 0;
  searchMaterial: any = {};
  checkedMaterial = false;
  indeterminateMaterial = false;
  listOfCurrentPageDataMaterial: readonly any[] = [];
  setOfCheckedIdMaterial = new Set<any>();

  showPopoverWoCode() {
    this.isOpenlistWo = true;
  }

  popoverVisibleChangeWoCode(event: any) {
    this.isOpenlistWo = event;
  }

  filterSearchWoCode($event: any) {
    if ($event.keyCode == 13) {
      this.onHandleFetchListWo();
    } else if ($event.type == 'click') {
      this.onHandleFetchListWo();
    }
  }

  /** Lấy danh sách WO */
  async onHandleFetchListWo() {
    let dataRequest = {
      pageNumber: this.pageWoCode - 1,
      pageSize: this.perPageWoCode,
      filter: {
        workOrderParentId: -1,
        woCode: this.dataFilterWoCode.woCode,

      },
      common: '',
      sortProperty: 'updatedAt',
      sortOrder: 'DESC',
    };

    let res = await this.exportRequestService.getListWo(dataRequest);
    if (res) {
      if (res.result.responseCode == '00') {
        this.listWo = res.data;
        this.totalWoCode = res.dataCount;
      } else {
        this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
      }
    } else {
      this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
    }
  }
  // Lấy thông tin chi tiết wo

  /** Danh sách hàng hóa theo xuất kho sản xuất (NVL) */
  async getListItemsMaterial() {
    let dataRequest = {
      pageIndex: this.pageItem - 1,
      pageSize: this.perPageItem,
      filter: {
        productCode: this.searchMaterial.productCode,
        itemName: this.searchMaterial.proName,
        description: this.searchMaterial.description,
        uom: this.searchMaterial.unit,
        woCode: this.dataInformationWo.woCode,
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
        res.data.forEach((element: any) => {

        });
        this.totalItem = res.dataCount;
      } else {
        this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
      }
    } else {
      this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
    }
  }

  clearWoCode(keyName: string) {
    this.dataFilterWoCode[keyName] = '';
    this.onHandleFetchListWo();
  }

  paginationWoCode(event: any) {
    this.pageWoCode = event.page;
    this.perPageWoCode = event.size;
    this.onHandleFetchListWo();
  }

  chooseWoCode(row: any) {
    this.isOpenlistWo = false;
    this.dataInformationWo = {
      ...row,
      startDate: new Date(row.startDate),
      endDate: new Date(row.endDate),
    };

    this.setOfCheckedIdMaterial.clear();
    this.getListItemsMaterial();
  }

  onConclusionChange(row: any, index: number) {
    console.log(`Hàng ${index + 1} thay đổi:`, row.status);
  }
}
