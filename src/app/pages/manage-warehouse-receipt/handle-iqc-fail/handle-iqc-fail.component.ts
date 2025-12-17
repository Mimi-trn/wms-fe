import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { KeycloakService } from 'keycloak-angular';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzUploadChangeParam } from 'ng-zorro-antd/upload';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { PageFilter } from 'src/app/models/request/PageFilter.model';
import { CheckRoleService } from 'src/app/services/checkRole.service';
import { ReceiptCommonService } from 'src/app/services/import-warehouse/common/receipt-common.service';
import { ImportRequestService } from 'src/app/services/import-warehouse/import-request/import-request.service';
import { MessageService } from 'src/app/services/message.service';
import { RequestIqcService } from 'src/app/services/request-iqc/request-iqc.service';
import { TransferDataService } from 'src/app/services/transferData.service';

@Component({
  selector: 'app-handle-iqc-fail',
  templateUrl: './handle-iqc-fail.component.html',
  styleUrls: ['./handle-iqc-fail.component.css'],
})
export class HandleIqcFailComponent {
  constructor(
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    private loading: NgxUiLoaderService,
    private checkRole: CheckRoleService,
    private importRequestService: ImportRequestService,
    private receiptCommonService: ReceiptCommonService,
    private transferData: TransferDataService,
    private keyClockService: KeycloakService,
    private requestIQCService: RequestIqcService
  ) { }

  // Value
  userName: string = this.keyClockService.getUsername();
  isVisibleCancelRequest: boolean = false;
  isVisibleCancel: boolean = false;
  isVisibleConfirmOrderProcessing: boolean = false;
  isVisibleCreateImportRequest: boolean = false;
  isVisibleIqcRequest: boolean = false;
  currentRow: any = {};
  currentImportRequestCode: string = '';
  columns: any[] = [];
  data: any[] = [];
  isBreadcrumb: boolean = false;
  isHidden: boolean = true;
  breadcrumbs: Object[] = [];
  searchGeneral: string = '';
  page: number = 1;
  per_page: number = 10;
  filter: any = {};
  sort: Object[] = [];
  total: number = 0;
  dataFilter: any = {};
  choose: string = 'all';
  sortProperty: string = 'updatedAt';
  sortOrder: string = 'descend';
  isRole: string | null = this.checkRole.hasAnyRoleOf([
    'wms_buyer',
    'wms_keeper',
  ]);
  listImportType: any[] = [];
  pageFilter: PageFilter = {
    common: this.searchGeneral,
    pageIndex: this.page - 1,
    pageSize: this.per_page,
    filter: this.filter,
    sortProperty: 'updatedAt',
    sortOrder: 'descend',
  };

  pageFilterForWaitProcess: PageFilter = {
    common: this.searchGeneral,
    pageIndex: this.page,
    pageSize: this.per_page,
    filter: {},
    sortProperty: '',
    sortOrder: '',
  };
  listWarehouse: any = [];
  listItems: any = [];
  dataDetail: any = {};
  listStatus: any = [
    {
      value: 1,
      label: 'importRequest.status.status_1',
    },
    {
      value: 5,
      label: 'importRequest.status.status_5',
    },
    {
      value: 6,
      label: 'importRequest.status.status_6',
    },
    {
      value: 7,
      label: 'importRequest.status.status_7',
    },
    {
      value: 8,
      label: 'importRequest.status.status_8',
    },
    {
      value: 9,
      label: 'importRequest.status.status_9',
    },
  ];

  ngOnInit() {
    this.loading.start();
    // this.translateService.get('menu.manage.receipt.list').subscribe((text) => {
    //   this.title.setTitle(text);
    // });
    this.setBreadcrumb();
    this.receiptCommonService.getWarehouse().then((response) => {
      this.listWarehouse = response.data;
      // Get list import type
      this.receiptCommonService.getImportType().then((response) => {
        this.listImportType = response.data;
        //Get list import request
        this.importRequestService
          .getAllImportRequest(this.pageFilter, true)
          .then((response) => {
            this.data = response.data.map((data: any) => {
              return {
                ...data,
                importType:
                  this.listImportType[Number(data.importType) - 1]
                    .importTypeName,
                warehouseName: this.listWarehouse.find(
                  (warehouse: any) =>
                    warehouse.warehouseCode == data.warehouseCode
                ).warehouseName,
              };
            });

            this.total = response.dataCount;
          });
      });
    });

    this.columns = [
      {
        keyTitle: 'ui.receipt.required.importRequestCode',
        keyName: 'importRequestCode',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'ui.receipt.required.importTypeName',
        keyName: 'importType',
        listOfFilter: this.listImportType,
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'ui.receipt.required.warehouseName',
        keyName: 'warehouseName',
        width: '200px',
        check: true,
      },
      // {
      //   keyTitle: 'ui.receipt.required.woCode',
      //   keyName: 'woCode',
      //   width: '200px',
      //   check: true,
      // },
      {
        keyTitle: 'ui.receipt.required.poCode',
        keyName: 'poCode',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'ui.receipt.required.deliveryAt',
        keyName: 'deliveryAt',
        width: '200px',
        check: false,
      },
      {
        keyTitle: 'ui.receipt.required.informationDelivery',
        keyName: 'informationDelivery',
        width: '200px',
        check: false,
      },
      {
        keyTitle: 'ui.receipt.required.contractCode',
        keyName: 'contractCode',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'ui.receipt.required.customerCode',
        keyName: 'customerCode',
        width: '200px',
        check: false,
      },
      {
        keyTitle: 'ui.receipt.required.customerName',
        keyName: 'customerName',
        width: '200px',
        check: false,
      },
      {
        keyTitle: 'ui.receipt.required.address',
        keyName: 'address',
        width: '200px',
        check: false,
      },
      {
        keyTitle: 'ui.receipt.required.phoneNumber',
        keyName: 'phoneNumber',
        width: '200px',
        check: false,
      },
      {
        keyTitle: 'ui.receipt.required.createContractAt',
        keyName: 'createContractAt',
        width: '200px',
        check: false,
      },
      // {
      //   keyTitle: 'ui.receipt.required.soCode',
      //   keyName: 'soCode',
      //   width: '200px',
      //   check: false,
      // },
      // {
      //   keyTitle: 'ui.receipt.required.returnReportCode',
      //   keyName: 'returnReportCode',
      //   width: '200px',
      //   check: false,
      // },
      {
        keyTitle: 'ui.receipt.required.createBy',
        keyName: 'createdBy',
        width: '200px',
        check: false,
      },
      {
        keyTitle: 'ui.receipt.required.createAt',
        keyName: 'createdAt',
        width: '200px',
        check: false,
      },
      {
        keyTitle: 'ui.receipt.required.updateAt',
        keyName: 'updatedAt',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'table.note',
        keyName: 'note',
        width: '200px',
        check: false,
      },
      {
        keyTitle: 'table.status',
        keyName: 'status',
        width: '200px',
        check: true,
      },
    ];

    this.loading.stop();
  }

  checkIsRole(role: string) {
    return this.checkRole.checkRole(role);
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
    ];
    this.isBreadcrumb = true;
  }

  // Hàm tìm kiếm chung
  searchGeneralFunc() {
    this.getData(this.page, this.per_page)
  }

  // Hàm thêm cột
  onClickAddColumn() { }

  // Hàm xử lý checkbox
  onClickCheckBox(event: any) { }

  // Hàm xử lý sự kiện onResize
  onResize({ width }: NzResizeEvent, col: any): void {
    this.columns = this.columns.map((e) =>
      e.keyTitle === col.keyTitle ? { ...e, width: `${width}px` } : e
    );
  }

  // Hàm xử lý xem chi tiết yêu cầu nhập kho
  onHandleView(row: any) {
    this.router.navigate([
      `/manage-warehouse-receipt/handle-iqc-failed/view-handle-iqc-failed/${row.importRequestCode}`,
    ]);
  }

  // Hàm xử lý sự kiện phân trang
  pagination(event: any) {
    this.page = event.page;
    this.per_page = event.size;
    this.getData(event.page, event.size);
  }

  async getData(page: any, per_page: any) {
    this.loading.start();

    if (this.filter.createdAt) {
      this.filter.createdAt2 = this.filter.createdAt.pop();
      this.filter.createdAt = this.filter.createdAt.pop();
    }
    if (this.filter.updatedAt) {
      this.filter.updatedAt2 = this.filter.updatedAt.pop();
      this.filter.updatedAt = this.filter.updatedAt.pop();
    }
    if (this.filter.contractCreateAt) {
      this.filter.contractCreateAt2 = this.filter.contractCreateAt.pop();
      this.filter.contractCreateAt = this.filter.contractCreateAt.pop();
    }
    if (this.filter.deliveryAt) {
      this.filter.deliveryAt2 = this.filter.deliveryAt.pop();
      this.filter.deliveryAt = this.filter.deliveryAt.pop();
    }

    this.pageFilter.pageIndex = page - 1;
    this.pageFilter.pageSize = per_page;
    this.pageFilter.filter = this.filter;
    this.pageFilter.common = this.searchGeneral;

    let resp = await this.importRequestService.getAllImportRequest(
      this.pageFilter,
      true
    );
    if (resp.result.responseCode == '00') {
      this.data = resp.data.map((data: any) => {
        return {
          ...data,
          importType:
            this.listImportType[Number(data.importType) - 1].importTypeName,
          warehouseName: this.listWarehouse.find(
            (warehouse: any) => warehouse.warehouseCode == data.warehouseCode
          ).warehouseName,
        };
      });
      this.total = resp.dataCount;
      this.loading.stop();
    } else {
      this.loading.stop();
    }
  }

  // Hàm xử lý sự kiện tìm kiếm ở các dòng
  search() {
    this.getData(this.page, this.per_page);
  }

  // Bắt sự kiện sort filter pagi
  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort, filter } = params;
    this.sort = sort;
    let resultFilter: any = {};
    filter.forEach((ele: any) => {
      resultFilter[ele.key] = ele.value;
    });
    this.filter = { ...this.filter, ...resultFilter };
  }

  // Thay đổi lựa chọn
  // changeSelect(event: any) {
  //   this.loading.start();
  //   if (event !== 'all') {
  //     this.pageFilterForWaitProcess.pageIndex = 0;
  //     this.importRequestService
  //       .getAllImportRequest(this.pageFilterForWaitProcess, true)
  //       .then((response) => {
  //         this.data = response.data.map((data: any) => {
  //           return {
  //             ...data,
  //             importType:
  //               this.listImportType[Number(data.importType) - 1].importTypeName,
  //           };
  //         });
  //         this.total = response.dataCount;
  //       });
  //   } else {
  //     this.importRequestService
  //       .getAllImportRequest(this.pageFilter, false)
  //       .then((response) => {
  //         this.data = response.data.map((data: any) => {
  //           return {
  //             ...data,
  //             importType:
  //               this.listImportType[Number(data.importType) - 1].importTypeName,
  //           };
  //         });
  //         this.total = response.dataCount;
  //       });
  //   }
  //   this.loading.stop();
  // }

  // hàm xử lý hủy yêu cầu nhập kho
  onHandleDestroy(row: any) {
    this.currentImportRequestCode = row.code;
    this.isVisibleCancelRequest = true;
  }

  // onHandleIQC
  onHandleIQC(row: any) { }

  // onHandleCreateGRN
  async onCreateIQC() {
    let arrItemChoose: any[] = []
    let resp = await this.requestIQCService.postRequestIQC(arrItemChoose, this.currentRow.importRequestCode)
    if (resp.result.responseCode == '00') {
      this.router.navigate(['./manage-warehouse-receipt/list-of-iqc']);
      // this.getData(this.page, this.per_page)
    } else {
      this.messageService.error(` Có lỗi xảy ra`, `Lỗi`)
    }
  }
  async onClickTest(){
    let arrItemChoose: any[] = []
    let resp = await this.requestIQCService.postRequestIQC(arrItemChoose, this.currentRow.importRequestCode)
    console.log(resp);
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

  onConfirmOrderProcessing() {
    this.importRequestService
      .changeStatus(this.currentRow.importRequestCode, 7)
      .then((response: any) => {
        if (response.result.responseCode == '00') {
          this.messageService.success(
            'Xác nhận xử lý đơn hàng thành công',
            'Thành công'
          );
          this.getData(this.page, this.per_page);
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
      .changeStatus(this.currentRow.code, 5)
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

  onSort(sortProperty: string, index: number) {
    if (sortProperty == 'warehouseName') {
      sortProperty = 'warehouseCode';
    }
    this.sortProperty = sortProperty;
    this.pageFilter.sortProperty = sortProperty;
    this.columns.forEach((e) => {
      if (e.keyName != sortProperty) {
        e.isSort = false;
      }
    });
    if (!this.columns[index].isSort) {
      this.sortOrder = 'descend';
      this.columns[index].isSort = true;
    } else {
      if (this.sortOrder == 'descend') {
        this.sortOrder = 'ascend';
      } else {
        this.sortOrder = 'descend';
      }
    }
    this.pageFilter.sortOrder = this.sortOrder;
    this.getData(this.page, this.per_page);
  }
}
