import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { KeycloakService } from 'keycloak-angular';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CheckRoleService } from 'src/app/services/checkRole.service';
import { MessageService } from 'src/app/services/message.service';
import { TransferDataService } from 'src/app/services/transferData.service';
import jwt_decode from 'jwt-decode';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { LocationPackageService } from 'src/app/services/manage-information/location-package/location-package.service';

@Component({
  selector: 'app-list-of-goods-location',
  templateUrl: './list-of-goods-location.component.html',
  styleUrls: ['./list-of-goods-location.component.css'],
})
export class ListOfGoodsLocationComponent implements OnInit {
  constructor(
    private messageService: MessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private loading: NgxUiLoaderService,
    private checkRole: CheckRoleService,
    private transferData: TransferDataService,
    private keycloakService: KeycloakService,
    private locationPackageService: LocationPackageService
  ) {}
  // Danh sách breadcrumb
  breadcrumbs: any = [
    {
      name: 'menu.manage.information',
      route: ``,
    },
    {
      name: 'sidebar.information.child.listLocation.name',
      route: `/manage-info/list-of-goods-location`,
    },
  ];

  filterLocationPackage: any = {
    importDate: [],
    expiredDate: [],
  };

  listLocationPackage: any[] = []; // Danh sách vị trí hàng hóa
  listGrnCode: any[] = []; // Danh sách số chứng từ
  listPorductCode: any[] = []; // Danh sách mã hàng hóa
  listProductName: any[] = []; // Danh sách tên hàng hóa
  listItemType: any[] = []; // Danh sách nhóm hàng hóa
  listUom: any[] = []; // Danh sách đơn vị tính
  listLocationWarehouseCode: any[] = []; // Danh sách mã kho
  listLocationWarehouseName: any[] = []; // Danh sách tên kho
  listLocationCode: any[] = []; // Danh sách mã vị trí
  listLocationName: any[] = []; // Danh sách vị trí

  page: number = 1;
  perPage: number = 10;
  total: number = 0;
  searchGeneral: string = '';
  sortProperty: string = 'updatedAt';
  sortOrder: string = 'descend';

  allChecked: boolean = false;
  indeterminate: boolean = true;

  ngOnInit() {
    this.onHandleFetchData();
  }

  async onHandleFetchData() {
    let dataRequest = {
      pageIndex: this.page - 1,
      pageSize: this.perPage,
      filter: {
        ...this.filterLocationPackage,
        importDate: this.filterLocationPackage.importDate[0],
        importDate2: this.filterLocationPackage.importDate[1],
        expiredDate: this.filterLocationPackage.expiredDate[0],
        expiredDate2: this.filterLocationPackage.expiredDate[1],
      },
      common: this.searchGeneral,
      sortProperty: this.sortProperty,
      sortOrder: this.sortOrder,
    };
    let resp = await this.locationPackageService.getListLocationPackage(
      dataRequest
    );
    if (resp.result.responseCode == '00') {
      this.listLocationPackage = resp.data;
      this.total = resp.dataCount;
      this.loading.stop();
    } else {
      this.loading.stop();
      this.messageService.error(resp.result.message, `Lỗi`);
    }
  }

  onHandleSearchCommon() {
    this.onHandleFetchData();
  }

  onHandleCreateNewLocationPackage() {
    this.router.navigate(['./manage-info/manage-goods-location/new']);
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

  onHandleClearInput(keyName: string) {
    this.filterLocationPackage[keyName] = '';
    this.onHandleFetchData();
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

  checkIsRole(role: string) {
    return this.checkRole.checkRole(role);
  }
  columns: any[] = [
    {
      keyTitle: 'sidebar.information.child.listLocation.grnCode',
      keyName: 'grnCode',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listLocation.productCode',
      keyName: 'productCode',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listLocation.productName',
      keyName: 'productName',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listLocation.itemType',
      keyName: 'itemType',
      width: '200px',
      check: false,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listLocation.uom',
      keyName: 'uom',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listLocation.importDate',
      keyName: 'importDate',
      width: '240px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listLocation.expiredDate',
      keyName: 'expiredDate',
      width: '240px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listLocation.itemQuantity',
      keyName: 'itemQuantity',
      width: '200px',
      check: false,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listLocation.packageQuantity',
      keyName: 'packageQuantity',
      width: '200px',
      check: false,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listLocation.quantity',
      keyName: 'quantity',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listLocation.locationWarehouseCode',
      keyName: 'locationWarehouseCode',
      width: '200px',
      check: false,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listLocation.locationWarehouseName',
      keyName: 'locationWarehouseName',
      width: '200px',
      check: false,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listLocation.locationCode',
      keyName: 'locationCode',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listLocation.locationDesc',
      keyName: 'locationDesc',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
  ];
}
