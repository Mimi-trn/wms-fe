import jwt_decode from 'jwt-decode';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { KeycloakService } from 'keycloak-angular';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CheckRoleService } from 'src/app/services/checkRole.service';
import { ContractService } from 'src/app/services/manage-information/contract-service/contract.service';
import { PoService } from 'src/app/services/manage-information/list-po-service/po.service';
import { MessageService } from 'src/app/services/message.service';
import { TransferDataService } from 'src/app/services/transferData.service';
@Component({
  selector: 'app-contract-list',
  templateUrl: './contract-list.component.html',
  styleUrls: ['./contract-list.component.css'],
})
export class ContractListComponent implements OnInit {
  checkIsRole(role: string) {
    return this.checkRole.checkRole(role);
  }
  constructor(
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    private loading: NgxUiLoaderService,
    private activatedRoute: ActivatedRoute,
    private poService: PoService,
    private transferData: TransferDataService,
    private checkRole: CheckRoleService,
    private contractService: ContractService,
    private keycloakService: KeycloakService
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
      this.checkGroupsInFcimAdmin = encodedToken.groups.includes('/FCIM_ADMIN');
    });
    this.listStatus = [
      { text: 'Đóng', value: 1 },
      { text: 'Mở', value: 2 },
      { text: 'Bản nháp', value: 0 },
    ];
  }
  token: any = '';
  checkGroupsInTokenQcer: boolean = false;
  checkGroupsInTokenKeeper: boolean = false;
  checkGroupsInTokenSaler: boolean = false;
  checkGroupsInTokenAdmin: boolean = false;
  checkGroupsInFcimAdmin: boolean = false;
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

  async getListContract() {
    this.loading.start();
    let data = {
      pageIndex: this.page - 1,
      pageSize: this.per_page,
      common: this.searchGeneral,
      sortProperty: this.sortProperty,
      sortOrder: this.sortOrder,
      filter: {
        consignmentContractCode: this.dataFilter.consignmentContractCode,
        customerCode: this.dataFilter.customerCode,
        customerName: this.dataFilter.customerName,
        customerPhone: this.dataFilter.customerPhone,
        customerEmail: this.dataFilter.customerEmail,
        address: this.dataFilter.address,
        status: this.dataFilter.status,
        note: this.dataFilter.note,
        contractCreatedAt: this.dataFilter.contractCreatedAt[0],
        contractCreatedAt2: this.dataFilter.contractCreatedAt[1],
        createdAt: this.dataFilter.createdAt[0],
        createdAt2: this.dataFilter.createdAt[1],
        createdBy: this.dataFilter.createdBy,
        updatedAt: this.dataFilter.updatedAt[0],
        updatedAt2: this.dataFilter.updatedAt[1],
      },
    };
    let resp = await this.contractService.getList(data);
    if (resp.result.responseCode == '00') {
      console.log(resp);
      this.loading.stop();
      this.datas = resp.data;
      this.total = resp.dataCount;
    } else {
      this.loading.stop();
      this.messageService.warning(
        `Có lỗi xảy ra trong quá trình tải trang`,
        `Cảnh báo`
      );
    }
  }

  ngOnInit() {
    this.getListContract();
    // this.translateService
    //   .get('sidebar.information.child.listContract.name')
    //   .subscribe((text) => {
    //     this.title.setTitle(text);
    //   });

    this.columns = [
      {
        keyTitle:
          'sidebar.information.child.listContract.child.consignmentContractCode',
        keyName: 'consignmentContractCode',
        width: '150px',
        check: true,
      },
      {
        keyTitle:
          'sidebar.information.child.listContract.child.contractCreatedAt',
        keyName: 'contractCreatedAt',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'sidebar.information.child.listContract.child.deliveryDate',
        keyName: 'deliveryAt',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'sidebar.information.child.listContract.child.customerCode',
        keyName: 'customerCode',
        width: '150px',
        check: true,
      },
      {
        keyTitle: 'sidebar.information.child.listContract.child.customerName',
        keyName: 'customerName',
        width: '150px',
        check: true,
      },
      {
        keyTitle: 'sidebar.information.child.listContract.child.address',
        keyName: 'address',
        width: '150px',
        check: false,
      },
      {
        keyTitle: 'sidebar.information.child.listContract.child.customerPhone',
        keyName: 'customerPhone',
        width: '150px',
        check: false,
      },
      {
        keyTitle: 'sidebar.information.child.listContract.child.createdAt',
        keyName: 'createdAt',
        width: '200px',
        check: false,
      },
      {
        keyTitle: 'sidebar.information.child.listContract.child.createdBy',
        keyName: 'createdBy',
        width: '150px',
        check: false,
      },
      {
        keyTitle: 'sidebar.information.child.listContract.child.updatedAt',
        keyName: 'updatedAt',
        width: '200px',
        check: false,
      },
      {
        keyTitle: 'sidebar.information.child.listContract.child.status',
        keyName: 'status',
        width: '150px',
        check: true,
      },
    ];
    this.datas = [];
    this.setBreadcrumb();
  }

  setBreadcrumb() {
    this.breadcrumbs = [
      {
        name: 'menu.manage.information',
        route: ``,
      },
      {
        name: 'sidebar.information.child.listContract.name',
        route: `/manage-info/list-contract`,
      },
    ];
    this.isBreadcrumb = true;
  }

  searchGeneralFunc() {
    this.getListContract();
  }

  onClickAddNew() {
    this.router.navigate(['./manage-info/list-contract/new']);
  }

  updateAllChecked(): void {
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

  onClickCheckBox(column: any) {
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

  id = -1;
  onResize({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.columns[i].width = width + 'px';
    });
  }

  countSort = 0;
  customSortFunction(sortColumn: string) {
    this.countSort = this.countSort + 1;
    if (this.countSort % 2 == 1) {
      this.sortOrder = 'descend';
    } else {
      this.sortOrder = 'ascend';
    }
    this.sortProperty = sortColumn;
    this.getListContract();
  }

  search() {
    this.getListContract();
  }

  clear(row: any) {
    this.dataFilter[row.keyName] = '';
    this.getListContract();
  }

  enterSearch($event: any) {
    if ($event.keyCode == 13) {
      this.getListContract();
    }
  }

  async rangeDate() {
    this.getListContract();
  }

  async onHandleView(row: any) {
    this.router.navigate([
      `./manage-info/list-contract/${row.consignmentContractCode}`,
    ]);
  }

  async onHandleNewIQC(row: any) {
    this.transferData.setObjectFromConsignmentContractCode(row);
    this.router.navigate([
      './manage-warehouse-receipt/required-receipt-warehouse/create',
    ]);
  }

  // Hàm xử lý sự kiện phân trang
  async pagination(event: any) {
    this.page = event.page;
    this.per_page = event.size;
    this.getListContract();
  }

  listStatus: listSelect[] = [];
  columns: any[] = [];
  sortProperty: any = 'updatedAt';
  sortOrder: any = 'descend';
  isBreadcrumb: boolean = false;
  isHidden: boolean = true;
  breadcrumbs: Object[] = [];
  searchGeneral: any = '';
  allChecked: boolean = false;
  indeterminate: boolean = true;
  datas: any[] = [];
  dataFilter: any = {
    consignmentContractCode: '',
    customerCode: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    address: '',
    status: '',
    note: '',
    contractCreatedAt: '',
    createdAt: '',
    createdBy: '',
    updatedAt: '',
  };
  page: number = 1;
  per_page: number = 10;
  total: number = 0;
}

interface listSelect {
  text: string;
  value: any;
}
