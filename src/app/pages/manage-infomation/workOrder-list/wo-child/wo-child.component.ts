import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CheckRoleService } from 'src/app/services/checkRole.service';
import { WorkOrderService } from 'src/app/services/manage-information/work-order.service';
import { MessageService } from 'src/app/services/message.service';
import { TransferDataService } from 'src/app/services/transferData.service';

@Component({
  selector: 'app-wo-child',
  templateUrl: './wo-child.component.html',
  styleUrls: ['./wo-child.component.css'],
})
export class WoChildComponent implements OnInit {
  @Input() wo: any = {};
  constructor(
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    private loading: NgxUiLoaderService,
    private activatedRoute: ActivatedRoute,
    private transferData: TransferDataService,
    private checkRole: CheckRoleService,
    private woService: WorkOrderService
  ) {}
  filterWo: any = {
    startDate: [],
    endDate: [],
    createDate: [],
    updatedAt: [],
    deliveryDate: [],
  };
  listWo: any[] = [];

  listStatus: any[] = [
    {
      text: 'Chờ lĩnh NVL',
      value: 0,
    },
    {
      text: 'Chờ sản xuất',
      value: 1,
    },
    {
      text: 'Đang sản xuất',
      value: 2,
    },
    {
      text: 'Đã dừng',
      value: 3,
    },
    {
      text: 'Hoàn thành',
      value: 4,
    },
    {
      text: 'Đã đóng',
      value: 5,
    },
  ];

  page: number = 1;
  perPage: number = 10;
  total: number = 0;
  searchGeneral: string = '';
  sortProperty: string = 'updatedAt';
  sortOrder: string = 'DESC';

  breadcrumbs: Object[] = [
    {
      name: 'menu.manage.information',
      route: ``,
    },
    {
      name: 'sidebar.information.child.listWorkOrder.name',
      route: `/manage-info/list-wo`,
    },
  ];

  allChecked: boolean = false;
  indeterminate: boolean = true;

  expandSet = new Set<number>();
  isExpand: boolean = false;
  ngOnInit() {
    this.onHandleFetchData();
  }

  onHandleCheckRole(role: string) {
    return this.checkRole.checkRole(role);
  }

  async onHandleFetchData() {
    let dataRequest: Object = {
      pageNumber: this.page - 1,
      pageSize: this.perPage,
      filter: {
        woCode: this.filterWo.woCode,
        lotNumber: this.filterWo.lotNumber,
        soCode: this.filterWo.soCode,
        productCode: this.filterWo.productCode,
        productName: this.filterWo.productName,
        createdBy: this.filterWo.createdBy,
        status: this.filterWo.status,
        workOrderParentId: this.wo ? this.wo : -1,
        deliveryDateFrom: this.filterWo.deliveryDate[0]
          ? this.filterWo.deliveryDate[0]
          : null,
        deliveryDateTo: this.filterWo.deliveryDate[1]
          ? this.filterWo.deliveryDate[1]
          : null,
        createDateFrom: this.filterWo.createDate[0]
          ? this.filterWo.createDate[0]
          : null,
        createDateTo: this.filterWo.createDate[1]
          ? this.filterWo.createDate[1]
          : null,
        updatedAtFrom: this.filterWo.updatedAt[0]
          ? this.filterWo.updatedAt[0]
          : null,
        updatedAtTo: this.filterWo.updatedAt[1]
          ? this.filterWo.updatedAt[1]
          : null,
        startDateFrom: this.filterWo.startDate[0]
          ? this.filterWo.startDate[0]
          : null,
        startDateTo: this.filterWo.startDate[1]
          ? this.filterWo.startDate[1]
          : null,
        endDateFrom: this.filterWo.endDate[0] ? this.filterWo.endDate[0] : null,
        endDateTo: this.filterWo.endDate[1] ? this.filterWo.endDate[1] : null,
      },
      common: this.searchGeneral,
      sortProperty: this.sortProperty,
      sortOrder: this.sortOrder,
    };
    let res = await this.woService.getListWOFromAPS(dataRequest);
    if (res) {
      if (res.result.responseCode == '00') {
        this.listWo = res.data;
        this.total = res.dataCount;
      } else {
        this.messageService.error(
          ` Có lỗi xảy ra, vui lòng thử lại`,
          ` Thông báo`
        );
      }
    } else {
      this.messageService.error(
        ` Có lỗi xảy ra, vui lòng thử lại`,
        ` Thông báo`
      );
    }

    this.onHandleTotalCompensationQuantity();
    this.onHandleTotalTotalQuantity();
    this.onHandleTotalCompletedQuantity();
  }

  onHandleSearchCommon() {
    this.onHandleFetchData();
  }

  onHandleEnterSearch($event: any) {
    if ($event.keyCode == 13) {
      this.onHandleFetchData();
    }
  }

  onHandleClickSearch() {
    this.onHandleFetchData();
  }

  onHandlePagination(event: any) {
    this.page = event.page;
    this.perPage = event.size;
    this.onHandleFetchData();
  }

  onHandleNewRequestIQC(wo: any) {}

  onHandleReadWO(wo: any) {}

  onHandleClickCheckBox() {
    if (this.columns.every((item) => !item.check)) {
      this.allChecked = false;
      this.indeterminate = false;
    } else if (this.columns.every((item) => item.check)) {
      this.allChecked = true;
      this.indeterminate = false;
    } else {
      this.indeterminate = true;
    }
  }

  onHandleUpdateAllChecked(): void {
    this.indeterminate = false;
    if (this.allChecked) {
      this.columns = this.columns.map((item) => ({
        ...item,
        check: true,
      }));
    } else {
      this.columns = this.columns.map((item) => ({
        ...item,
        check: false,
      }));
    }
  }

  id = -1;
  onResize({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.columns[i].width = width + 'px';
    });
  }

  customSortFunction(sortColumn: any) {
    sortColumn.count = sortColumn.count + 1;
    // this.countSort = this.countSort + 1;
    if (sortColumn.count % 2 == 1) {
      sortColumn.sortOrder = 'DESC';
    } else {
      sortColumn.sortOrder = 'ASC';
    }
    this.sortOrder = sortColumn.sortOrder;
    this.sortProperty = sortColumn.keyName;
    this.onHandleFetchData();
  }

  onClickIcon(element: any) {
    if (this.expandSet.has(element.id)) {
      this.expandSet.delete(element.id);
    } else {
      this.expandSet.add(element.id);
    }
  }

  onHandleClearInput(keyName: string) {
    this.filterWo[keyName] = '';
    this.onHandleFetchData();
  }

  totalTotalQuantity: number = 0;
  onHandleTotalTotalQuantity() {
    this.totalTotalQuantity = this.listWo.reduce(
      (sum, item) => sum + parseFloat(item.totalQuantity),
      0
    );
  }
  totalCompletedQuantity: number = 0;
  onHandleTotalCompletedQuantity() {
    this.totalCompletedQuantity = this.listWo.reduce(
      (sum, item) => sum + parseFloat(item.completedQuantity),
      0
    );
  }
  totalCompensationQuantity: number = 0;
  onHandleTotalCompensationQuantity() {
    this.totalCompensationQuantity = this.listWo.reduce(
      (sum, item) => sum + parseFloat(item.compensationQuantity),
      0
    );
  }
  totalOpenQuantity: number = 0;
  onHandleTotalOpenQuantity() {
    this.totalOpenQuantity = this.listWo.reduce(
      (sum, item) => sum + parseFloat(item.openQuantity),
      0
    );
  }

  columns: any[] = [
    {
      keyTitle: 'sidebar.information.child.listWorkOrder.list.woCodeLine',
      keyName: 'woCode',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listWorkOrder.list.lotNumber',
      keyName: 'lotNumber',
      width: '200px',
      check: false,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listWorkOrder.list.soCode',
      keyName: 'soCode',
      width: '200px',
      check: false,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listWorkOrder.list.productCode',
      keyName: 'productCode',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listWorkOrder.list.productName',
      keyName: 'productName',
      width: '200px',
      check: false,
      count: 0,
      sortOrder: '',
    },

    {
      keyTitle: 'sidebar.information.child.listWorkOrder.list.deliveryDate',
      keyName: 'deliveryDate',
      width: '200px',
      check: false,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listWorkOrder.list.quantity',
      keyName: 'totalQuantity',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle:
        'sidebar.information.child.listWorkOrder.list.compensationQuantity',
      keyName: 'compensationQuantity',
      width: '200px',
      check: false,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle:
        'sidebar.information.child.listWorkOrder.list.completedQuantity',
      keyName: 'completedQuantity',
      width: '200px',
      check: false,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listWorkOrder.list.startDate',
      keyName: 'startDate',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listWorkOrder.list.endDate',
      keyName: 'endDate',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listWorkOrder.list.openQuantity',
      keyName: 'openQuantity',
      width: '200px',
      check: false,
      count: 0,
      sortOrder: '',
    },

    {
      keyTitle: 'sidebar.information.child.listWorkOrder.list.createdBy',
      keyName: 'createdBy',
      width: '200px',
      check: false,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listWorkOrder.list.createdAt',
      keyName: 'createDate',
      width: '240px',
      check: false,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listWorkOrder.list.updatedAt',
      keyName: 'updatedAt',
      width: '240px',
      check: false,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listWorkOrder.list.status',
      keyName: 'status',
      width: '160px',
      check: true,
      count: 0,
      sortOrder: '',
    },
  ];
}
