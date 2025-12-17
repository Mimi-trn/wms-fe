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
import { ImportRequestService } from 'src/app/services/import-warehouse/import-request/import-request.service';
import { TechFormService } from 'src/app/services/manage-information/tech-form/tech-form.service';
import { MessageService } from 'src/app/services/message.service';
import { TransferDataService } from 'src/app/services/transferData.service';

@Component({
  selector: 'app-list-tech-form',
  templateUrl: './list-tech-form.component.html',
  styleUrls: ['./list-tech-form.component.css'],
})
export class ListTechFormComponent {
  checkIsRole(role: string) {
    return this.checkRole.checkRole(role);
  }
  constructor(
    private messageService: MessageService,
    private checkRole: CheckRoleService,
    private translateService: TranslateService,
    private router: Router,
    private loading: NgxUiLoaderService,
    private transferData: TransferDataService,
    private techFormService: TechFormService
  ) {}
  // Danh sách các cột của bảng phiếu công nghệ
  techFormTableColumns: any = [
    {
      keyTitle: 'listTechForm.techFormTable.techFormCode',
      keyName: 'techFormCode',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'listTechForm.techFormTable.techFormName',
      keyName: 'techFormName',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'listTechForm.techFormTable.createdBy',
      keyName: 'createdBy',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'listTechForm.techFormTable.checkedBy',
      keyName: 'checkedBy',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'listTechForm.techFormTable.approvedBy',
      keyName: 'approvedBy',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'listTechForm.techFormTable.startDate',
      keyName: 'startAt',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'listTechForm.techFormTable.endDate',
      keyName: 'endAt',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'listTechForm.techFormTable.createdAt',
      keyName: 'createdAt',
      width: '200px',
      check: false,
    },
    {
      keyTitle: 'listTechForm.techFormTable.updatedAt',
      keyName: 'updatedAt',
      width: '200px',
      check: false,
    },
    {
      keyTitle: 'listTechForm.techFormTable.note',
      keyName: 'note',
      width: '200px',
      check: false,
    },
    {
      keyTitle: 'listTechForm.techFormTable.status',
      keyName: 'whStatus',
      width: '200px',
      check: true,
    },
  ];
  // Danh sách các cột của bảng danh sách yêu cầu sản xuất
  productionTableColumns: any = [
    {
      keyTitle: 'listTechForm.requestProductionTable.productionCode',
      keyName: 'productionCode',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'listTechForm.requestProductionTable.orderCode',
      keyName: 'salesOrderCode',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'listTechForm.requestProductionTable.customerCode',
      keyName: 'customerCode',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'listTechForm.requestProductionTable.customerName',
      keyName: 'customer',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'listTechForm.requestProductionTable.productName',
      keyName: 'cardName',
      width: '200px',
      check: true,
    },
  ];
  // Danh sách breadcrumb
  breadcrumbs: any = [
    {
      name: 'menu.manage.information',
      route: ``,
    },
    {
      name: 'sidebar.information.child.listTechForm',
      route: `/manage-info/list-of-iqc`,
    },
  ];
  // Danh sách trạng thái
  listStatus: any = [
    {
      value: 0,
      label: 'listTechForm.status.close',
    },
    {
      value: 1,
      label: 'listTechForm.status.open',
    },
  ];
  // Dữ liệu bảng phiếu công nghệ
  dataTable: any = [];
  // Dữ liệu filter cho bảng
  techFormPageFilter: PageFilter = {
    common: '',
    pageIndex: 0,
    pageSize: 10,
    filter: {},
    sortProperty: 'status',
    sortOrder: 'ascend',
  };
  requestProductionPageFilter: PageFilter = {
    common: '',
    pageIndex: 0,
    pageSize: 10,
    filter: {},
    sortProperty: '',
    sortOrder: '',
  };
  // Các biến thực hiện ẩn hiện
  isVisibleCancelRequest: boolean = false;
  isVisibleWithDrawRequest: boolean = false;
  isVisibleConfirmWithDraw: boolean = false;
  // Phân trang cho bảng danh sách phiếu công nghệ
  page: number = 1;
  perPage: number = 10;
  total: number = 0;
  // Dữ liệu filter của bảng danh sách phiếu công nghệ
  filterForTechFormData: any = {};

  currentImportRequestCode: string = '';
  searchCommon: string = '';
  sort: Object[] = [];

  listImportType: any = [];
  listWarehouse: any = [];
  listItems: any = [];

  buttonClassName: string = 'button';

  ngOnInit() {
    this.loading.start();
    // this.translateService.get("listTechForm.title").subscribe((text) => {
    //   this.title.setTitle(text);
    // });

    this.techFormService
      .getTechForm(this.techFormPageFilter)
      .then((response) => {
        this.dataTable = response.data.map((data: any) => {
          return {
            ...data,
            isOpen: false,
            listProductionRequirement: [],
            filterData: {},
            pageIndex: 1,
            pageSize: 10,
            total: 0,
          };
        });

        this.total = response.dataCount;
      });

    this.loading.stop();
  }

  // Hàm tìm kiếm chung
  searchCommonFunc() {
    this.techFormPageFilter.common = this.searchCommon;
    this.fetchTechFormDataTable();
  }

  // Hàm thêm cột
  onClickAddColumn() {}

  // Hàm xử lý checkbox
  onClickCheckBox(event: any) {}

  // Hàm xử lý sự kiện onResize
  onResize({ width }: NzResizeEvent, col: any): void {
    this.techFormTableColumns = this.techFormTableColumns.map((e: any) =>
      e.keyTitle === col.keyTitle ? { ...e, width: `${width}px` } : e
    );
  }

  // Hàm xử lý sự kiện onResize cho bảng danh sách yêu cầu sản xuất
  onResizeForListProductionRequirement(
    { width }: NzResizeEvent,
    col: any
  ): void {
    this.productionTableColumns = this.productionTableColumns.map((e: any) =>
      e.keyTitle === col.keyTitle ? { ...e, width: `${width}px` } : e
    );
  }

  // Hàm xử lý xem chi tiết yêu cầu nhập kho
  onHandleView(row: any) {
    this.router.navigate([
      `/manage-info/list-tech-form/view-tech-form/${row.id}`,
    ]);
  }

  onHandleCreateRequest(row: any) {
    let data = {
      dataObj: row,

      listItem: [],
    };

    this.transferData.setObject(data);
    this.router.navigate(['./export/list-request-export/new']);
  }

  // Hàm xử lý sự kiện phân trang cho bảng phiếu công nghệ
  paginationForTechFormTable(event: any) {
    this.page = event.page;
    this.perPage = event.size;
    this.techFormPageFilter.pageIndex = event.page - 1;
    this.techFormPageFilter.pageSize = event.size;
    this.fetchTechFormDataTable();
  }

  // Hàm xử lý sự kiện phân trang cho bảng yêu cầu sản xuất
  paginationForProductionRequirementTable(event: any, index: number) {
    this.dataTable[index].pageIndex = event.page;
    this.dataTable[index].pageSize = event.size;
    this.fetchProductionRequirementDataTable(index);
  }

  // Refresh lại dữ liệu trong bảng phiếu công nghệ theo filter, search, paging mới
  fetchTechFormDataTable() {
    this.loading.start();
    this.techFormService
      .getTechForm(this.techFormPageFilter)
      .then((response) => {
        if (response.result.responseCode == '00') {
          this.dataTable = response.data.map((data: any) => {
            return {
              ...data,
              isOpen: false,
              listProductionRequirement: [],
              filterData: {},
              pageIndex: 1,
              pageSize: 10,
              total: 100,
            };
          });
          this.loading.stop();
        } else {
          this.messageService.error(
            'Không lấy được dữ liệu danh sách yêu cầu sản xuất',
            'Lỗi'
          );
          this.loading.stop();
        }
      });
  }

  // Refresh lại dữ liệu trong bảng phiếu công nghệ theo filter, search, paging mới
  fetchProductionRequirementDataTable(index: number) {
    this.loading.start();
    this.techFormService
      .getProductionRequirement(this.requestProductionPageFilter)
      .then((response) => {
        if (response.result.responseCode == '00') {
          this.dataTable[index].listProductionRequirement = response.data;
          this.dataTable[index].total = response.dataCount;
          this.loading.stop();
        } else {
          this.messageService.error(
            'Không lấy được dữ liệu danh sách yêu cầu sản xuất',
            'Lỗi'
          );
          this.loading.stop();
        }
      });
  }

  // Xử lý filter cho bẳng danh sách phiếu công nghệ
  filterForTechFormTable() {
    if (this.filterForTechFormData.startAt) {
      this.filterForTechFormData.startAt2 =
        this.filterForTechFormData.startAt.pop();
      this.filterForTechFormData.startAt =
        this.filterForTechFormData.startAt.pop();
    }
    if (this.filterForTechFormData.endAt) {
      this.filterForTechFormData.endAt2 =
        this.filterForTechFormData.endAt.pop();
      this.filterForTechFormData.endAt = this.filterForTechFormData.endAt.pop();
    }
    if (this.filterForTechFormData.createdAt) {
      this.filterForTechFormData.createdAt2 =
        this.filterForTechFormData.createdAt.pop();
      this.filterForTechFormData.createdAt =
        this.filterForTechFormData.createdAt.pop();
    }
    if (this.filterForTechFormData.updatedAt) {
      this.filterForTechFormData.updatedAt2 =
        this.filterForTechFormData.updatedAt.pop();
      this.filterForTechFormData.updatedAt =
        this.filterForTechFormData.updatedAt.pop();
    }

    this.techFormPageFilter.filter = {
      ...this.techFormPageFilter.filter,
      ...this.filterForTechFormData,
    };
    this.fetchTechFormDataTable();
  }

  // Xử lý filter cho bẳng danh sách yêu cầu sản xuất
  filterForProductRequirementTable(row: any, index: any) {
    this.requestProductionPageFilter.pageIndex =
      this.dataTable[index].pageIndex - 1;
    this.requestProductionPageFilter.pageSize = this.dataTable[index].pageSize;
    this.requestProductionPageFilter.filter = {
      ...this.dataTable[index].filterData,
      techFormId: row.id,
    };
    this.fetchProductionRequirementDataTable(index);
  }

  // Bắt sự kiện sort filter pagi
  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort, filter } = params;
    this.sort = sort;
    let resultFilter: any = {};
    filter.forEach((ele: any) => {
      resultFilter[ele.key] = ele.value;
    });
    this.requestProductionPageFilter = {
      ...this.requestProductionPageFilter,
      ...resultFilter,
    };
  }

  cancelRequest() {
    this.isVisibleCancelRequest = true;
  }

  onHandleWithDrawRequest() {
    this.isVisibleWithDrawRequest = true;
  }

  hideCancelRequest(event: any) {
    this.isVisibleCancelRequest = event;
  }

  onHandleCancelPopup(event: any) {
    this.isVisibleCancelRequest = event;
  }

  onHandleConfirmPopup(event: any) {
    this.isVisibleWithDrawRequest = event;
  }

  onOpenProductionRequirementTable(row: any, index: number) {
    this.dataTable[index].isOpen = !this.dataTable[index].isOpen;
    if (this.dataTable[index].isOpen) {
      this.loading.start();
      this.requestProductionPageFilter.filter = {
        techFormId: row.id,
      };
      this.techFormService
        .getProductionRequirement(this.requestProductionPageFilter)
        .then((response) => {
          this.dataTable[index].listProductionRequirement = response.data;
          this.dataTable[index].total = response.dataCount;
        });
      this.loading.stop();
    }
  }
}
