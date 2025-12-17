import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-create-product-on-location-package',
  templateUrl: './create-product-on-location-package.component.html',
  styleUrls: ['./create-product-on-location-package.component.css'],
})
export class CreateProductOnLocationPackageComponent implements OnInit {
  constructor(
    private messageService: MessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private loading: NgxUiLoaderService,
    private checkRole: CheckRoleService,
    private transferData: TransferDataService,
    private keycloakService: KeycloakService,
    private locationPackageService: LocationPackageService,
    private el: ElementRef
  ) {}

  filterProductFromServer: any = {
    importDate: [],
    expiredDate: [],
  };
  filterProductFromClient: any = {};
  filterLocation: any = {};
  locationWarehouseId: number = 0;
  isOpenTableLocation: boolean = false;

  listProductFromClient: any[] = [];
  listProductFromServer: any[] = [];
  listWarehouse: any = []; // Danh sách kho
  listLocation: any = []; // Danh sách vị trí
  listItemQuantity: any = [
    {
      value: 10,
      text: '10',
    },
    {
      value: 20,
      text: '20',
    },
    {
      value: 30,
      text: '30',
    },
  ]; // Danh sách số lượng hàng mỗi kiện

  page: number = 1;
  perPage: number = 10;
  total: number = 0;
  searchGeneral: string = '';
  sortProperty: string = 'updatedAt';
  sortOrder: string = 'DESC';

  bodyLocation: any = {
    locationWarehouseId: '',
    locationId: '',
    // id: '',
    locationName: '',
  };

  visiblePopOver: boolean = false;
  checked = false;
  indeterminate = false;
  listOfCurrentPageData: readonly any[] = [];
  setOfCheckedId = new Set<any>();

  ngOnInit() {
    this.onHandleFetchItem();
    this.onHandleFetchWarehouse();
    this.onHandleFetchDetailLocation();
  }

  async onHandleFetchWarehouse() {
    let dataRequest = {
      pageIndex: 0,
      pageSize: 0,
      common: '',
      sortProperty: 'updatedAt',
      sortOrder: 'DESC',
      filter: {
        description: null,
        locationCode: null,
        locationName: null,
        isLocked: null,
        hasChild: null,
        parent: 0,
        storeId: null,
      },
    };
    let resp = await this.locationPackageService.getListLocation(dataRequest);
    if (resp.result.responseCode == '00') {
      this.listWarehouse = resp.data;
    } else {
      this.messageService.error(`${resp.result.message}`, ` Lỗi`);
    }
  }

  async onHandleFetchListItemQuantity(row: any) {
    let data = {
      pageIndex: 0,
      pageSize: 0,
      filter: {
        id: '',
        productCode: row.productCode,
        itemName: '',
        description: '',
        uom: '',
        grnCode: row.grnCode,
        quantity: '',
        locationId: '',
        locationName: '',
      },
      common: '',
      sortProperty: '',
      sortOrder: '',
    };
    let resp = await this.locationPackageService.getListQR(data);
    if (resp.result.responseCode == '00') {
      this.listItemQuantity = resp.data;
    } else {
      this.messageService.error(`${resp.result.message}`, ` Lỗi`);
    }
  }

  async onHandleFetchLocation() {
    let dataRequest = {
      pageIndex: 0,
      pageSize: 0,
      common: '',
      sortProperty: 'updatedAt',
      sortOrder: 'DESC',
      filter: {
        description: this.filterLocation.description,
        locationCode: this.filterLocation.locationCode,
        locationName: null,
        isLocked: null,
        hasChild: false,
        parent: null,
        storeId: this.bodyLocation.locationWarehouseId,
      },
    };
    let resp = await this.locationPackageService.getLocationInCreateNewLocation(
      dataRequest
    );
    if (resp.result.responseCode == '00') {
      this.listLocation = resp.data;
    } else {
      this.messageService.error(`${resp.result.message}`, ` Lỗi`);
    }
  }

  itemQuantityById: any;
  listDetailLocation: any[] = [];
  productQR!: string;

  isScanning = false;
  isInclude = false;

  @ViewChild('productQRInput') productQRInput!: ElementRef;
  @ViewChild('locationQRInput') locationQRInput!: ElementRef;

  startScanning() {
    this.isScanning = true;
    this.locationQRInput.nativeElement.focus();
    console.log(this.bodyLocation);
  }

  async onHandleFetchListItemQuantityById(id: string) {
    let data = {
      pageIndex: 0,
      pageSize: 0,
      filter: {
        id: id,
        productCode: '',
        itemName: '',
        description: '',
        uom: '',
        grnCode: '',
        quantity: '',
        locationId: '',
        locationName: '',
      },
      common: '',
      sortProperty: '',
      sortOrder: '',
    };
    let resp = await this.locationPackageService.getListQR(data);
    if (resp.result.responseCode == '00') {
      this.itemQuantityById = resp.data;
    } else {
      this.messageService.error(`${resp.result.message}`, ` Lỗi`);
    }
  }

  onAutoFillLocation(qrLocation: string) {
    const foundedDetailLocation = this.listDetailLocation.find(
      (location: any) => location.locationCode == qrLocation.toUpperCase()
    );

    if (foundedDetailLocation) {
      const foundedWarehouse = this.listWarehouse.find(
        (warehouse: any) => warehouse.id == foundedDetailLocation.storeId
      );
      if (foundedWarehouse) {
        this.bodyLocation.locationId = foundedDetailLocation.locationCode;
        this.bodyLocation.locationName = foundedDetailLocation.description;
        this.bodyLocation.locationWarehouseId = foundedWarehouse.id;
        this.bodyLocation.id = foundedDetailLocation.id;
        this.productQRInput.nativeElement.focus();
      }
    }
  }

  onAutoFillProduct() {
    this.productQRInput.nativeElement.select();
    this.onHandleFetchListItemQuantityById(this.productQR).then(() => {
      const foundedProduct = this.listProductFromServer.find(
        (product: any) => product.id == this.itemQuantityById[0].itemId
      );

      const cloneFoundedProduct = { ...foundedProduct };
      if (cloneFoundedProduct) {
        cloneFoundedProduct.packageId = this.itemQuantityById[0].id;
        cloneFoundedProduct.itemQuantity =
          this.itemQuantityById[0].itemQuantity;

        this.isInclude = this.listProductFromClient.some(
          (item: any) => item.packageId == cloneFoundedProduct.packageId
        );

        if (!this.isInclude) {
          this.listProductFromClient.push({
            ...cloneFoundedProduct,
            packageQuantity: 1,
          });
          this.listProductFromClient = [...this.listProductFromClient];
        } else {
          const index = this.listProductFromClient.findIndex(
            (item: any) => item.packageId == cloneFoundedProduct.packageId
          );
          this.listProductFromClient[index].packageQuantity++;
        }
      }
      this.productQRInput.nativeElement.value = '';
    });
  }

  async onHandleFetchDetailLocation() {
    let dataRequest = {
      pageIndex: 0,
      pageSize: 0,
      common: '',
      sortProperty: 'updatedAt',
      sortOrder: 'DESC',
      filter: {
        description: null,
        locationCode: null,
        locationName: null,
        isLocked: null,
        hasChild: false,
        parent: null,
        storeId: null,
      },
    };
    let resp = await this.locationPackageService.getLocationInCreateNewLocation(
      dataRequest
    );
    if (resp.result.responseCode == '00') {
      this.listDetailLocation = resp.data;
    } else {
      this.messageService.error(`${resp.result.message}`, ` Lỗi`);
    }
  }

  onHandleChooseLocation(row: any, rowLocation: any) {
    this.bodyLocation.locationName = rowLocation.description;
    this.bodyLocation.locationId = rowLocation.locationCode;
    this.bodyLocation.id = rowLocation.id;
    this.isOpenTableLocation = false;
  }

  onHandleChangeLocation(event: any) {
    this.isOpenTableLocation = event;
  }

  onHandleOpenLocation() {
    this.isOpenTableLocation = true;
    if (this.bodyLocation.locationWarehouseId) {
      this.onHandleFetchLocation();
    }
  }

  searchLocation() {
    if (this.bodyLocation.locationWarehouseId) this.onHandleFetchLocation();
  }

  enterSearchLocation($event: any) {
    if ($event.keyCode == 13) {
      if (this.bodyLocation.locationWarehouseId) this.onHandleFetchLocation();
    }
  }

  onHandleClose() {
    this.router.navigate(['./manage-info/manage-goods-location']);
  }

  async onHandleSave() {
    let dataRequest: any[] = [];
    this.listProductFromClient.forEach((element) => {
      dataRequest.push({
        locationId: this.bodyLocation.id,
        locationWarehouseId: this.bodyLocation.locationWarehouseId,
        packageId: element.packageId,
        packageQuantity: element.packageQuantity,
      });
    });

    if (dataRequest.length !== 0) {
      let checkLocationWarehouseId = true;
      let checkLocationId = true;
      let checkPackageId = true;
      let checkPackageQuantity = true;

      dataRequest.forEach((element) => {
        if (!element.locationWarehouseId) {
          checkLocationWarehouseId = false;
          this.messageService.warning(`Kho không được để trống`, ` Cảnh báo`);
          return;
        }

        if (!element.locationId) {
          checkLocationId = false;
          this.messageService.warning(
            `Mã vị trí không được để trống`,
            ` Cảnh báo`
          );
          return;
        }

        if (!element.packageId) {
          checkPackageId = false;
          this.messageService.warning(
            `Số lượng hàng mỗi kiện không được để trống`,
            ` Cảnh báo`
          );
          return;
        }

        if (!element.packageQuantity) {
          checkPackageQuantity = false;
          this.messageService.warning(
            `Số lượng kiện hàng không được để trống`,
            ` Cảnh báo`
          );
          return;
        }
      });

      if (
        checkLocationId &&
        checkLocationWarehouseId &&
        checkPackageId &&
        checkPackageQuantity
      ) {
        let resp = await this.locationPackageService.createLocation(
          dataRequest
        );
        if (resp.result.responseCode == '00') {
          this.messageService.success(`${resp.result.message}`, ` Thành công`);
          this.router.navigate(['./manage-info/manage-goods-location']);
        } else {
          this.messageService.error(`${resp.result.message}`, ` Lỗi`);
        }
      } else {
        return;
      }
    } else {
      this.messageService.warning(
        ` Không có hàng hóa nào được chọn`,
        ` Cảnh báo`
      );
    }
  }

  onHandleClearInput(keyName: string) {
    this.filterProductFromClient[keyName] = '';
  }

  onHandlePackgaQuantity(event: any, row: any) {
    row.packageQuantity = event;
    this.calculateTotalTotalQuantity();
  }

  countPackageQuantity: number = 0;
  calculateTotalTotalQuantity() {
    this.countPackageQuantity = this.listProductFromClient.reduce(
      (sum, item) => sum + parseFloat(item.packageQuantity),
      0
    );
  }

  id = -1;
  onResize({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.columns[i].width = width + 'px';
    });
  }

  onHandleVisiblePopOver() {
    this.visiblePopOver = true;
  }

  onHandleChangeVisiblePopOver(event: any) {
    this.visiblePopOver = event;
  }

  onHandleDeleteItem(row: any) {
    this.setOfCheckedId.delete(row.productCode);
    return (this.listProductFromClient = this.listProductFromClient.filter(
      (obj) => obj.productCode !== row.productCode
    ));
  }
  isOpenSelectItemQuantity: boolean = false;
  // Xử lý bảng danh sách hàng hóa từ client
  onHandleOpenItemQuantity(row: any) {
    row.isOpenSelectItemQuantity = true;
    this.onHandleFetchListItemQuantity(row);
  }

  onHanndleChangeSelectItemQuantity(event: any, row: any) {
    row.isOpenSelectItemQuantity = event;
  }

  onHandleChoosePackage(row: any, item: any) {
    row.itemQuantity = item.itemQuantity;
    row.isOpenSelectItemQuantity = false;
    row.packageId = item.id;
  }

  // Xử lý bảng danh sách hàng hóa lấy từ server
  async onHandleFetchItem() {
    let dataRequest = {
      pageIndex: 0,
      pageSize: 0,
      filter: {
        ...this.filterProductFromServer,
        importDate: this.filterProductFromServer.importDate[0],
        importDate2: this.filterProductFromServer.importDate[1],
        expiredDate: this.filterProductFromServer.expiredDate[0],
        expiredDate2: this.filterProductFromServer.expiredDate[1],
      },
      common: '',
      sortProperty: '',
      sortOrder: '',
    };
    let resp = await this.locationPackageService.getListItem(dataRequest);
    if (resp.result.responseCode == '00') {
      this.listProductFromServer = resp.data;
    } else {
      this.messageService.error(resp.result.message, ` Lỗi`);
    }
  }

  onHandleEnterSearch($event: any) {
    if ($event.keyCode == 13) {
      this.onHandleFetchItem();
    }
  }

  onHandleClickSearch() {
    this.onHandleFetchItem();
  }

  idColumn = -1;
  onResizeItemFromServer({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.idColumn);
    this.idColumn = requestAnimationFrame(() => {
      this.columnFromServer[i].width = width + 'px';
    });
  }

  onHandleClearInputServer(keyName: string) {
    this.filterProductFromServer[keyName] = '';
  }

  updateCheckedSet(id: any, checked: boolean): void {
    let arrTemp: any[] = [];
    arrTemp = JSON.parse(JSON.stringify(this.listProductFromClient));
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
      arrTemp = arrTemp.filter((element: any) => {
        return element.productCode != id;
      });
    }

    this.setOfCheckedId.forEach((element) => {
      this.listProductFromServer.forEach((item) => {
        if (
          item.productCode == element &&
          !arrTemp.find((ele: any) => {
            return ele.productCode == element;
          })
        ) {
          arrTemp.push({
            productCode: item.productCode,
            grnCode: item.grnCode,
            productName: item.itemName,
            importDate: new Date(item.importDate),
            expiredDate: new Date(item.expiredDate),
            uom: item.uom,
            packageQuantity: 0,
            packageId: item.id,
          });
        }
      });
    });
    this.listProductFromClient = arrTemp;
  }

  clickRow(item: any) {
    item.rowCheck = !item.rowCheck;
    this.updateCheckedSet(item.productCode, item.rowCheck);
    this.refreshCheckedStatus();
  }

  onItemChecked(item: any, checked: boolean): void {
    this.updateCheckedSet(item.productCode, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(value: boolean): void {
    this.listOfCurrentPageData.forEach((item) => {
      this.updateCheckedSet(item.productCode, value);
    });
    this.refreshCheckedStatus();
  }

  onCurrentPageDataChange($event: readonly any[]): void {
    this.listOfCurrentPageData = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfCurrentPageData.every((item) =>
      this.setOfCheckedId.has(item.productCode)
    );
    this.indeterminate =
      this.listOfCurrentPageData.some((item) =>
        this.setOfCheckedId.has(item.productCode)
      ) && !this.checked;
  }

  breadcrumbs: any = [
    {
      name: 'menu.manage.information',
      route: ``,
    },
    {
      name: 'sidebar.information.child.listLocation.name',
      route: `/manage-info/list-of-goods-location`,
    },
    {
      name: 'sidebar.information.child.listLocation.create',
      route: `/manage-info/list-of-goods-location/new`,
    },
  ];

  columns: any = [
    {
      keyTitle: 'sidebar.information.child.listLocation.productCode',
      keyName: 'productCode',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listLocation.grnCode',
      keyName: 'grnCode',
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
      keyTitle: 'sidebar.information.child.listLocation.uom',
      keyName: 'uom',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listLocation.itemQuantity',
      keyName: 'itemQuantity',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listLocation.packageQuantity',
      keyName: 'packageQuantity',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
  ];

  columnFromServer: any = [
    {
      keyTitle: 'sidebar.information.child.listLocation.productCode',
      keyName: 'productCode',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listLocation.grnCode',
      keyName: 'grnCode',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listLocation.productName',
      keyName: 'itemName',
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
      keyTitle: 'sidebar.information.child.listLocation.uom',
      keyName: 'uom',
      width: '120px',
      check: true,
      count: 0,
      sortOrder: '',
    },
  ];
}
