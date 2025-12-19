import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { ToastrService } from 'ngx-toastr';
import { WorkOrderService } from 'src/app/services/manage-information/work-order.service';
import { TransferDataService } from 'src/app/services/transferData.service';
import jwt_decode from 'jwt-decode';
import { MessageService } from '../../../../services/message.service';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CheckRoleService } from '../../../../services/checkRole.service';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-wo-read',
  templateUrl: './wo-read.component.html',
  styleUrls: ['./wo-read.component.css'],
})
export class WoReadComponent implements OnInit {
  token: any;
  checkGroupsInTokenQcer: boolean = false;
  checkGroupsInTokenKeeper: boolean = false;
  checkGroupsInTokenSaler: boolean = false;
  checkGroupsInFcimAdmin: boolean = false;
  checkGroupsInTokenAdmin: boolean = false;
  param: string = '';
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
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private transferData: TransferDataService,
    private woService: WorkOrderService,
    private messageService: ToastrService,
    private keycloakService: KeycloakService
  ) {
    this.param = this.activatedRoute.snapshot.params['id'];
    let encodedToken;
    this.getToken().then(() => {
      encodedToken = this.getDecodedAccessToken(this.token);
      this.checkGroupsInTokenQcer =
        encodedToken.roles.includes('WMS_GROUP_QCER');
      this.checkGroupsInTokenKeeper =
        encodedToken.roles.includes('WMS_GROUP_KEEPER');
      this.checkGroupsInTokenAdmin =
        encodedToken.roles.includes('WMS_GROUP_ADMIN');
      this.checkGroupsInTokenSaler =
        encodedToken.roles.includes('WMS_GROUP_SALER');
      this.checkGroupsInFcimAdmin = encodedToken.roles.includes('FCIM_ADMIN');
    });
  }

  dataInformation: any = {
    status: 0,
  };

  listStatus: any[] = [
    {
      text: 'Từ chối ký PCN',
      value: 0,
    },
    {
      text: 'PCN bản nháp',
      value: 1,
    },
    {
      text: 'ERP kí và gửi cho QC',
      value: 2,
    },
    {
      text: 'QC ký và gửi cho giám đốc',
      value: 3,
    },
    {
      text: 'Giám đốc ký',
      value: 4,
    },
    {
      text: 'Chờ lĩnh NVL',
      value: 5,
    },
    {
      text: 'Chờ lĩnh nguyên vật liệu',
      value: 6,
    },
    {
      text: 'Chờ sản xuất',
      value: 7,
    },
    {
      text: 'Đang sản xuất',
      value: 8,
    },
    {
      text: 'Chờ nhập kho',
      value: 9,
    },
    {
      text: 'Hoàn thành sản xuất ',
      value: 10,
    },
    {
      text: 'Hoàn thành giao hàng ',
      value: 11,
    },
    {
      text: 'Dừng sản xuất',
      value: 12,
    },
  ];

  breadcrumbs: Object[] = [
    {
      name: 'menu.manage.information',
      route: ``,
    },
    {
      name: 'sidebar.information.child.listWorkOrder.name',
      route: `/manage-info/list-wo`,
    },
    {
      name: 'sidebar.information.child.listWorkOrder.list.btn.viewWo',
      route: ``,
    },
  ];

  filterWo: any = {
    startDate: [],
    endDate: [],
    deliveryDate: [],
    createDate: [],
    updatedAt: [],
  };

  filterMaterial: any = {};
  listMaterial: any[] = [];
  listWo: any[] = [];

  page: number = 1;
  perPage: number = 10;
  total: number = 0;
  searchGeneral: string = '';
  sortProperty: string = 'updatedAt';
  sortOrder: string = 'DESC';
  ngOnInit() {
    this.onHandleFetchData().then(() => {
      this.onHandleFetchDataChild();
      this.onHandleFetchMaterial();
    });
  }
  async onHandleFetchData() {
    let dataRequest: Object = {
      pageNumber: 0,
      pageSize: 0,
      filter: {
        woCode: this.param,
      },
      common: null,
      sortProperty: null,
      sortOrder: null,
    };
    let res = await this.woService.getListWOFromAPS(dataRequest);
    if (res) {
      if (res.result.responseCode == '00') {
        this.dataInformation = {
          ...res.data.content[0],
          startDate: res.data.content[0].startDate
            ? new Date(res.data.content[0].startDate)
            : new Date(''),
          endDate: res.data.content[0].endDate
            ? new Date(res.data.content[0].endDate)
            : new Date(''),
          createdAt: res.data.content[0].createdAt
            ? new Date(res.data.content[0].createdAt)
            : new Date(''),
          updatedAt: res.data.content[0].updatedAt
            ? new Date(res.data.content[0].updatedAt)
            : new Date(''),
        };
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
  }
  listItemGroup: any[] = [
    {
      value: 2,
      text: 'Hàng tốt',
    },
    {
      value: 5,
      text: 'Hàng hỏng',
    },
  ];
  async onHandleFetchDataChild() {
    let dataRequest: Object = {
      pageIndex: 0,
      pageSize: 0,
      filter: {
        productCode: this.filterWo.productCode,
        itemName: this.filterWo.itemName,
        importType: this.filterWo.importType,
        woCode: this.dataInformation.woCode,
      },
      common: '',
      sortProperty: this.sortProperty,
      sortOrder: this.sortOrder,
    };
    let res = await this.woService.getProduct(dataRequest);
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
    console.log(this.listWo);
  }

  async onHandleFetchMaterial() {
    let dataRequest = {
      pageIndex: 0,
      pageSize: 0,
      filter: {
        woCode: this.dataInformation.woCode,
        productCode: this.filterMaterial.productCode,
        itemName: this.filterMaterial.itemName,
        uom: this.filterMaterial.uom,
      },
      common: '',
      sortProperty: this.sortPropertyMaterial,
      sortOrder: this.sortOrderMaterial,
    };
    let res = await this.woService.getListItemsMaterialExport(dataRequest);
    if (res) {
      if (res.result.responseCode == '00') {
        this.listMaterial = res.data;
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
    this.onHandleTotalQuantityMaterial();
  }

  onHandleImportRequestBTPTP() {
    this.transferData.setObjectWO(this.dataInformation);
    this.router.navigate([
      '/manage-warehouse-receipt/required-receipt-warehouse/create',
    ]);
  }

  onHandleImportRequestBTPTPInRow(row: any) { }

  onHandleImportRequestNVL() { }

  onHandleExportRequest() {
    this.transferData.setObject(this.dataInformation);
    this.router.navigate(['./export/list-request-export/new']);
  }

  onHandleCancel() {
    this.router.navigate(['./manage-info/list-wo']);
  }

  id = -1;
  onResize({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.columns[i].width = width + 'px';
    });
  }

  idMaterial = -1;
  onResizeMaterial({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.idMaterial);
    this.idMaterial = requestAnimationFrame(() => {
      this.columnMaterial[i].width = width + 'px';
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
    this.onHandleFetchDataChild();
  }

  customSortFunctionMaterial(sortColumn: any) {
    sortColumn.count = sortColumn.count + 1;
    // this.countSort = this.countSort + 1;
    if (sortColumn.count % 2 == 1) {
      sortColumn.sortOrder = 'DESC';
    } else {
      sortColumn.sortOrder = 'ASC';
    }
    this.sortOrderMaterial = sortColumn.sortOrder;
    this.sortPropertyMaterial = sortColumn.keyName;
    this.onHandleFetchMaterial();
  }

  sortOrderMaterial: string = '';
  sortPropertyMaterial: string = '';

  allChecked: boolean = false;
  indeterminate: boolean = true;

  onHandleEnterSearch($event: any) {
    if ($event.keyCode == 13) {
      this.onHandleFetchDataChild();
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

  onHandleEnterSearchMaterial($event: any) {
    if ($event.keyCode == 13) {
      this.onHandleFetchMaterial();
    }
  }

  onHandleClickSearch() {
    this.onHandleFetchDataChild();
  }

  onHandleClickSearchMaterial() {
    this.onHandleFetchMaterial();
  }

  onHandleNewRequestIQC(wo: any) { }

  onHandleClearInput(keyName: string) {
    this.filterWo[keyName] = '';
    this.onHandleFetchDataChild();
  }

  onHandleClearInputMaterial(keyName: string) {
    this.filterMaterial[keyName] = '';
    this.onHandleFetchMaterial();
  }

  totalQuantityMaterial: number = 0;
  onHandleTotalQuantityMaterial() {
    this.totalQuantityMaterial = this.listMaterial.reduce(
      (sum, item) => sum + parseFloat(item.quantity),
      0
    );
  }

  totalHoldQuantityMaterial: number = 0;
  onHandleTotalHoldQuantityMaterial() {
    this.totalHoldQuantityMaterial = this.listMaterial.reduce(
      (sum, item) => sum + parseFloat(item.holdQuantity),
      0
    );
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

  close() {
    this.router.navigate(['./manage-info/list-wo']);
  }

  columns: any[] = [
    {
      keyTitle: 'Mã sản phẩm',
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
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'Đơn vị tính',
      keyName: 'uom',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    // {
    //   keyTitle:
    //     'sidebar.information.child.listWorkOrder.list.completedQuantity',
    //   keyName: 'completedQuantity',
    //   width: '200px',
    //   check: true,
    //   count: 0,
    //   sortOrder: '',
    // },

  ];

  columnMaterial: any[] = [
    {
      keyTitle: 'sidebar.information.child.listWorkOrder.list.read.productCode',
      keyName: 'itemCode',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listWorkOrder.list.read.productName',
      keyName: 'itemName',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listWorkOrder.list.read.uom',
      keyName: 'uom',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'Số lượng yêu cầu',
      keyName: 'requestQuantity',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    }
  ];
}
