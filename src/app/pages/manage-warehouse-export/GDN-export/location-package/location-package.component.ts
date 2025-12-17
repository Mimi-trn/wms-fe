import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { ExportRequestService } from './../../../../services/export-warehouse/exportRequestService.service';
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
} from '@angular/core';
import jwt_decode from 'jwt-decode';
import { KeycloakService } from 'keycloak-angular';
import { MessageService } from 'src/app/services/message.service';
import { CheckRoleService } from 'src/app/services/checkRole.service';

@Component({
  selector: 'app-location-package',
  templateUrl: './location-package.component.html',
  styleUrls: ['./location-package.component.css'],
})
export class LocationPackageComponent implements OnInit {
  @Input() product: any = '';
  @Input() status: number = 0;
  @Input() dataInformation: any = {};
  @Input() listCurrentLocation: any = [];
  @Output() productChild: any = new EventEmitter<any>();
  @Output() totalActualQuantity: any = new EventEmitter<any>();
  @Input() isView = false;

  //param
  pageLocation: number = 1;
  perPageLocation: number = 10;
  totalLocation: number = 0;
  token: any = '';
  checkGroupsInTokenQcer: boolean = false;
  checkGroupsInTokenKeeper: boolean = false;
  checkGroupsInTokenSaler: boolean = false;
  checkGroupsInTokenAdmin: boolean = false;
  isShowPopoverTableQRLocation: boolean = false;
  // checkLocationQuantity: boolean = false; // Xóa biến global này

  // data
  dataLocations: any[] = [];
  listLocation: any[] = [];
  itemQuantity: number = 0;
  packageQuantity: number = 0;
  countTotalActualQuantity: number = 0;
  // listTotalActualQuantity: number[] = [];

  @ViewChild('locationQRInput') locationQRInput!: ElementRef;
  @ViewChild('idPackageQRInput') idPackageQRInput!: ElementRef;

  locationQR: string = '';
  idPackageQR: string = '';
  listLocationByQR: any[] = [];

  // Thêm getter để kiểm tra tổng thể
  get isAllLocationsValid(): boolean {
    return this.dataLocations.every(
      (location) => !this.validateTotalQuantity(location)
    );
  }

  get hasInvalidLocations(): boolean {
    return this.dataLocations.some((location) => !location.isValid);
  }

  // Method để lấy danh sách các vị trí không hợp lệ
  getInvalidLocations(): any[] {
    return this.dataLocations.filter((location) => !location.isValid);
  }

  // Method để kiểm tra và hiển thị thông báo tổng thể
  checkOverallValidation(): void {
    if (this.hasInvalidLocations) {
      const invalidLocations = this.getInvalidLocations();
      const locationCodes = invalidLocations
        .map((loc) => loc.locationCode)
        .join(', ');
      this.messageService.warning(
        `Các vị trí sau vượt quá số lượng tồn kho: ${locationCodes}`,
        'Cảnh báo'
      );
    }
  }
  checkIsRole(role: string) {
    return this.checkRole.checkRole(role);
  }
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
    private exportService: ExportRequestService,
    private keycloakService: KeycloakService,
    private messageService: MessageService,
    private checkRole: CheckRoleService
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
    });
  }

  ngOnInit() {
    if (this.product.locationList !== undefined) {
      this.dataLocations = this.product.locationList.map((item: any) => ({
        ...item,
        exportItemQuantity: item.itemQuantity * item.packageQuantity,
        isValid: true, // Khởi tạo validation
        validationMessage: '', // Khởi tạo message
      }));
      this.product.locationList.forEach((e: any) => {
        this.setOfCheckedId.add(e.locationPackageId);
      });

      // Kiểm tra validation cho các vị trí đã có
      this.dataLocations.forEach((location) => {
        this.validateTotalQuantity(location);
      });
    }
    // this.onHandleFetchListLocation();

    this.getLocationList();
  }

  // Fetch data
  async onHandleFetchListLocation() {
    let dataRequest = {
      pageIndex: this.pageLocation - 1,
      pageSize: this.perPageLocation,
      filter: {
        locationWarehouseCode: null,
        warehouseCode: this.filterLocation.warehouseCode,
        locationCode: this.filterLocation.locationCode,
        locationName: this.filterLocation.locationName,
        itemQuantity: null,
        packageQuantity: null,
        // warehouseCode: this.dataInformation.warehouseCode,
      },
      sortProperty: 'updatedAt',
      sortOrder: 'DESC',
    };

    let res = await this.exportService.getListLocation(dataRequest);
    if (res) {
      if (res.result.responseCode == '00') {
        this.listLocation = res.data;
        this.totalLocation = res.dataCount;
      } else {
        this.messageService.warning(res.result.message, 'Cảnh báo');
      }
    }
    if (this.listCurrentLocation?.length > 0) {
      this.listCurrentLocation.forEach((item: any) => {
        const listNewLocation = this.listLocation.filter(
          (newLocation) => newLocation.locationWarehouseCode === item
        );
        const checkNewLocation = listNewLocation.every(
          (newLocation) => !newLocation.rowCheck
        );
        if (checkNewLocation && listNewLocation.length > 0) {
          this.clickRow(listNewLocation[0]);
        }
      });
    }
  }

  // Khai: Lay location list
  getLocationList() {
    let request = {
      warehouseCode: this.product.warehouseCode || '',
      itemCode: this.product.itemCode || '',
    };

    this.exportService.getListLocation(request).then((res: any) => {
      if (res.result.ok) {
        this.listLocation = res.data.locations;
      } else {
        this.messageService.warning(res.result.message, 'Cảnh báo');
      }
    });
  }

  addRowQR() {
    this.isShowPopoverTableQRLocation = true;
    setTimeout(() => this.locationQRInput.nativeElement.focus());
  }

  changeVisibleQR(event: any) {
    this.isShowPopoverTableQRLocation = event;
  }

  reScan() {
    this.messageService.success('Thêm kiện hàng thành công', 'Thông báo');
    setTimeout(() => (this.idPackageQR = ''));
    this.listLocationByQR = [];
    this.locationQR = '';
    this.locationQRInput.nativeElement.select();
  }

  onAutoFillLocation(qr: string) {
    this.locationQR = qr;

    if (this.listLocation.length > 0) {
      this.listLocationByQR = this.listLocation.filter(
        (location: any) =>
          location.locationCode == this.locationQR.toUpperCase()
      );
      if (this.listLocationByQR.length > 0) {
        this.idPackageQRInput.nativeElement.focus();
      }
    }
  }

  onFilterPackageByQR(qr: string) {
    this.idPackageQR = qr;

    const foundedLocations = this.listLocationByQR.filter(
      (location: any) =>
        location.locationCode == this.locationQR.toUpperCase() &&
        location.packageId == this.idPackageQR
    );

    if (foundedLocations.length > 0) {
      const indexLocation = this.dataLocations.findIndex(
        (location: any) =>
          location.locationCode == this.locationQR.toUpperCase() &&
          location.packageId == this.idPackageQR
      );
    } else {
      this.messageService.warning('Không tìm thấy ID kiện hàng', 'Cảnh báo');
    }
  }

  paginationLocation(event: any) {
    this.pageLocation = event.page;
    this.perPageLocation = event.size;
  }

  onHandleDelete(row: any) {
    this.updateCheckedSet(row.locationPackageId, false);
    this.listLocation.find((item: any) => {
      if (item.id == row.id) {
        item.rowCheck = false;
      }
    });
  }

  isShowPopoverTableLocation: boolean = false;
  addRow() {
    this.isShowPopoverTableLocation = true;
  }

  changeVisible(event: any) {
    this.isShowPopoverTableLocation = event;
  }

  id = -1;
  onResize({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.columns[i].width = width + 'px';
    });
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

  onClickCheckBox() {
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

  filterLocation: any = {};

  filter($event: any) {
    if ($event.keyCode == 13) {
      // this.getItemsOfOtherExport();
      this.onHandleFetchListLocation();
    } else if ($event.type == 'click') {
      // this.getItemsOfOtherExport();
      this.onHandleFetchListLocation();
    }
  }

  clearFilter(keyName: any) {
    this.filterLocation[keyName] = '';
    // this.getListItemsMaterial();
    this.onHandleFetchListLocation();
  }

  checked = false;
  indeterminate = false;
  listOfCurrentPageData: readonly any[] = [];
  setOfCheckedId = new Set<any>();

  updateCheckedSet(id: any, checked: boolean): void {
    let arrTemp: any[] = [];
    arrTemp = JSON.parse(JSON.stringify(this.dataLocations));
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
      arrTemp = arrTemp.filter((element: any) => {
        return element.locationPackageId != id;
      });
    }

    this.setOfCheckedId.forEach((element) => {
      this.listLocation.forEach((item) => {
        if (
          item.id == element &&
          !arrTemp.find((ele: any) => {
            return ele.locationPackageId == element;
          })
        ) {
          arrTemp.push({
            ...item,
            id: null,
            itemQuantity: 0,
            packageQuantity: 0,
            exportItemId: this.product.id, //Id hàng hóa cha
            locationPackageId: item.id, //id kiện
            isValid: true, // Thêm thuộc tính validation cho từng vị trí
            validationMessage: '', // Thêm message validation
          });
        }
      });
    });
    this.dataLocations = arrTemp;
    this.productChild.emit(this.dataLocations);
  }

  emitDataToParent() {
    // this.dataLocations.forEach((item) => {
    //   item.itemQuantity = this.itemQuantity;
    //   item.packageQuantity = this.packageQuantity;
    // });
    this.calculateTotalActualQuantity();
    this.productChild.emit(this.dataLocations);
    // this.checkOverallValidation();
  }

  onItemChecked(item: any, checked: boolean): void {
    this.updateCheckedSet(item.id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(value: boolean): void {
    this.listOfCurrentPageData.forEach((item) => {
      this.updateCheckedSet(item.id, value);
    });
    this.refreshCheckedStatus();
  }

  // onHandleExportPackageQuantity(event: any, row: any) {
  //   row['exportItemQuantity'] = row['itemQuantity'] * event;
  //   this.calculateActualQuantity(row);
  //   this.productChild.emit(this.dataLocations);
  // }

  calculateActualQuantity(row: any) {
    this.validateTotalQuantity(row);
    this.emitDataToParent();
  }

  calculateTotalActualQuantity() {
    this.countTotalActualQuantity = 0;
    this.dataLocations.map((item) => {
      this.countTotalActualQuantity += item.itemQuantity * item.packageQuantity;
    });

    this.product['actualQuantity'] = this.countTotalActualQuantity;
  }

  clickRow(item: any) {
    item.rowCheck = !item.rowCheck;
    this.updateCheckedSet(item.id, item.rowCheck);
    this.refreshCheckedStatus();
  }

  onCurrentPageDataChange($event: readonly any[]): void {
    this.listOfCurrentPageData = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfCurrentPageData.every((item) =>
      this.setOfCheckedId.has(item.id)
    );
    this.indeterminate =
      this.listOfCurrentPageData.some((item) =>
        this.setOfCheckedId.has(item.id)
      ) && !this.checked;
  }

  // return true: có lỗi, false: không có lỗi
  validateTotalQuantity(row: any) {
    row.validationMessage = '';
    if (row.itemQuantity <= 0 || row.packageQuantity <= 0) {
      row.isValid = false;
      return true;
    }

    let total = row.itemQuantity * row.packageQuantity;
    if (total > row.stockLocationQuantity) {
      // Cập nhật trạng thái validation cho vị trí này
      row.isValid = false;
      row.validationMessage = `Vượt quá số lượng tồn kho (${row.stockLocationQuantity})`;
      return true;
    } else {
      // Cập nhật trạng thái validation cho vị trí này
      row.isValid = true;
      row.validationMessage = '';
      return false;
    }
  }

  allChecked: boolean = true;
  indeterminated: boolean = false;
  columns: any[] = [
    {
      keyTitle: 'Mã kho',
      keyName: 'warehouseCode',
      width: '120px',
      check: true,
    },
    {
      keyTitle: 'Mã vị trí',
      keyName: 'locationCode',
      width: '120px',
      check: true,
    },
    {
      keyTitle: 'Tên vị trí',
      keyName: 'locationName',
      width: '120px',
      check: true,
    },
    {
      keyTitle: 'SL hàng mỗi kiện',
      keyName: 'itemQuantity',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'SL kiện hàng',
      keyName: 'packageQuantity',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'Tổng SL hàng',
      keyName: 'totalQuantity',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'SL tồn kho',
      keyName: 'stockLocationQuantity',
      width: '200px',
      check: true,
    },
  ];
}
