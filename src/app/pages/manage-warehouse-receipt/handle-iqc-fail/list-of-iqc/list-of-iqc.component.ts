import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { KeycloakService } from 'keycloak-angular';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { PageFilter } from 'src/app/models/request/PageFilter.model';
import { CheckRoleService } from 'src/app/services/checkRole.service';
import { ReceiptCommonService } from 'src/app/services/import-warehouse/common/receipt-common.service';
import { ImportRequestService } from 'src/app/services/import-warehouse/import-request/import-request.service';
import { MessageService } from 'src/app/services/message.service';
import { TransferDataService } from 'src/app/services/transferData.service';

@Component({
  selector: 'app-list-of-iqc',
  templateUrl: './list-of-iqc.component.html',
  styleUrls: ['./list-of-iqc.component.css'],
})
export class ListOfIqcComponent {
  constructor(
    private messageService: MessageService,

    private translateService: TranslateService,
    private router: Router,
    private loading: NgxUiLoaderService,
    private checkRole: CheckRoleService,
    private importRequestService: ImportRequestService,
    private receiptCommonService: ReceiptCommonService,
    private transferData: TransferDataService,
    private keyClockService: KeycloakService
  ) {}

  // Value
  userName: string = this.keyClockService.getUsername();
  isVisibleCancelRequest: boolean = false;
  isVisibleWithDrawRequest: boolean = false;
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
    sortOrder: 'decsend',
  };

  pageFilterForWaitProcess: PageFilter = {
    common: this.searchGeneral,
    pageIndex: this.page,
    pageSize: this.per_page,
    filter: {},
    sortProperty: 'updatedAt',
    sortOrder: 'descend',
  };
  listWarehouse: any = [];
  listItems: any = [];
  dataDetail: any = {};
  listStatus: any = [
    {
      value: 0,
      label: 'importRequest.status.status_0',
    },
    {
      value: 1,
      label: 'importRequest.status.status_1',
    },
    {
      value: 2,
      label: 'importRequest.status.status_2',
    },
    {
      value: 3,
      label: 'importRequest.status.status_3',
    },
    {
      // Chỗ này khi filter phải là status 5 và 6
      value: 5,
      label: 'importRequest.status.status_5and6',
    },
  ];
  isVisibleConfirmWithDraw: boolean = false;

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
          .getAllImportRequestAndType(this.pageFilter, false, 1)
          .then((response) => {
            this.data = response.data.map((data: any) => {
              return {
                ...data,
                importType:
                  this.listImportType[Number(data.importType) - 1]
                    .importTypeName,
                // warehouseName: this.listWarehouse.find(
                //   (warehouse: any) =>
                //     warehouse.warehouseCode == data.warehouseCode
                // ).warehouseName,
              };
            });

            this.total = response.dataCount;
          });
      });
    });

    const columnIqc: any = sessionStorage.getItem('columns-list-iqc');
    this.columns = columnIqc
      ? JSON.parse(columnIqc)
      : [
          {
            keyTitle: 'ui.receipt.required.importRequestCode',
            keyName: 'importRequestCode',
            width: '200px',
            check: true,
            isSort: false,
          },
          {
            keyTitle: 'ui.receipt.required.importTypeName',
            keyName: 'importType',
            width: '200px',
            check: true,
            isSort: false,
          },
          {
            keyTitle: 'ui.receipt.required.poCode',
            keyName: 'poCode',
            width: '200px',
            check: true,
            isSort: false,
          },
          {
            keyTitle: 'ui.receipt.required.deliveryAt',
            keyName: 'deliveryAt',
            width: '200px',
            check: false,
            isSort: false,
          },
          {
            keyTitle: 'ui.receipt.required.informationDelivery',
            keyName: 'informationDelivery',
            width: '200px',
            check: false,
            isSort: false,
          },
          {
            keyTitle: 'ui.receipt.required.customerCode',
            keyName: 'customerCode',
            width: '200px',
            check: false,
            isSort: false,
          },
          {
            keyTitle: 'ui.receipt.required.customerName',
            keyName: 'customerName',
            width: '200px',
            check: false,
            isSort: false,
          },
          {
            keyTitle: 'ui.receipt.required.address',
            keyName: 'address',
            width: '200px',
            check: false,
            isSort: false,
          },
          {
            keyTitle: 'ui.receipt.required.phoneNumber',
            keyName: 'phoneNumber',
            width: '200px',
            check: false,
            isSort: false,
          },
          {
            keyTitle: 'ui.receipt.required.createContractAt',
            keyName: 'createContractAt',
            width: '200px',
            check: false,
            isSort: false,
          },
          {
            keyTitle: 'ui.receipt.required.qcNumber',
            keyName: 'qcCount',
            width: '200px',
            check: false,
            isSort: false,
          },
          {
            keyTitle: 'ui.receipt.required.createBy',
            keyName: 'createdBy',
            width: '200px',
            check: false,
            isSort: false,
          },
          {
            keyTitle: 'ui.receipt.required.createAt',
            keyName: 'createdAt',
            width: '200px',
            check: false,
            isSort: false,
          },
          {
            keyTitle: 'ui.receipt.required.updateAt',
            keyName: 'updatedAt',
            width: '200px',
            check: true,
            isSort: false,
          },
          {
            keyTitle: 'table.note',
            keyName: 'note',
            width: '200px',
            check: true,
            isSort: false,
          },
          {
            keyTitle: 'table.status',
            keyName: 'status',
            width: '200px',
            check: true,
            isSort: false,
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
        name: 'manageWarehouse.listOfIqc.listOfIqc',
        route: `/manage-warehouse-receipt/list-of-iqc`,
      },
    ];
    this.isBreadcrumb = true;
  }

  // Hàm tìm kiếm chung
  searchGeneralFunc() {
    this.getData(this.page, this.per_page);
  }

  // Hàm thêm mới yêu cầu nhập kho
  onClickAddNew() {
    this.router.navigate(['/manage-warehouse-receipt/create-iqc-request']);
  }

  // Hàm thêm cột
  onClickAddColumn() {}

  // Hàm xử lý checkbox
  onClickCheckBox(event: any) {
    sessionStorage.setItem('columns-list-iqc', JSON.stringify(this.columns));
  }

  // Hàm xử lý sự kiện onResize
  onResize({ width }: NzResizeEvent, col: any): void {
    this.columns = this.columns.map((e) =>
      e.keyTitle === col.keyTitle ? { ...e, width: `${width}px` } : e
    );
  }

  // Hàm xử lý xem chi tiết yêu cầu nhập kho
  onHandleView(row: any) {
    this.router.navigate([
      `/manage-warehouse-receipt/list-of-iqc/view-request-iqc/${row.importRequestCode}`,
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

    let resp = await this.importRequestService.getAllImportRequestAndType(
      this.pageFilter,
      false,
      1
    );
    if (resp.result.responseCode == '00') {
      this.data = resp.data.map((data: any) => {
        return {
          ...data,
          importType:
            this.listImportType[Number(data.importType) - 1]?.importTypeName,
          // warehouseName: this.listWarehouse.find(
          //   (warehouse: any) => warehouse.warehouseCode == data.warehouseCode
          // ).warehouseName,
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

  // Xử lý sự kiện tìm kiếm khi ấn enter
  enterSearch(event: any) {
    if (event.keyCode == 13) {
      this.getData(this.page, this.per_page);
    }
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

  // onHandleIQC
  onHandleIQC(row: any) {}

  cancelRequest() {
    this.isVisibleCancelRequest = true;
  }

  onHandleWithDrawRequest() {
    this.isVisibleWithDrawRequest = true;
  }

  hideCancelRequest(event: any) {
    this.isVisibleCancelRequest = event;
    this.getData(this.page, this.per_page);
  }

  onHandleCancelPopup(event: any) {
    this.isVisibleCancelRequest = event;
  }

  onHandleConfirmPopup(event: any) {
    this.isVisibleWithDrawRequest = event;
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

  onHandleRevoke(row: any) {
    this.isVisibleConfirmWithDraw = true;
    this.currentImportRequestCode = row.importRequestCode;
  }

  onHandleCancelWithDraw(event: any) {
    this.isVisibleConfirmWithDraw = event;
    this.getData(this.page, this.per_page);
  }
}
