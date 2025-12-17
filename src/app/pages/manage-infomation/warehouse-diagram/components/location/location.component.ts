import { Component, Input, Output } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CheckRoleService } from 'src/app/services/checkRole.service';
import { MessageService } from 'src/app/services/message.service';
import { WarehouseDiagramService } from 'src/app/services/warehouse-diagram/warehouse-diagram.service';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.css'],
})
export class LocationComponent {
  checkIsRole(role: string) {
    return this.checkRole.checkRole(role);
  }
  constructor(
    private warehouseDiagramService: WarehouseDiagramService,
    private loading: NgxUiLoaderService,
    private messageService: MessageService,
    private checkRole: CheckRoleService
  ) {}

  @Input() listLocations: any = [];

  isVisiblePopupAdd: boolean = false;
  isVisiblePopupDelete: boolean = false;
  isVisiblePopupLock: boolean = false;
  isVisiblePopupFocusOut: boolean = false;
  currentLocation: any = {};
  selectDeleteLocation: any = {};
  newLocation: any = {
    isLocked: false,
  };

  visibleQR: boolean = false;
  valueQR: string = '';
  createQR(location: any) {
    this.valueQR = location.locationCode;
    this.visibleQR = true;
  }

  onHandleCancel() {
    this.visibleQR = false;
  }

  openListLocation(location: any) {
    let data = {
      pageIndex: 0,
      pageSize: 0,
      common: '',
      sortProperty: 'createdAt',
      sortOrder: 'ASC',
      filter: {
        parent: location.id,
      },
    };
    if (!location.isOpen) {
      this.loading.start();
      this.warehouseDiagramService
        .getListLocation(data)
        .then((response) => {
          if (response.result.responseCode == '00') {
            location.child = response.data.map((data: any) => {
              return { ...data, isOpen: false, child: [], isAddNew: false };
            });
            location.isOpen = true;
          } else {
            this.messageService.error('Không lấy được dữ liệu vị trí', 'Lỗi');
          }
        })
        .finally(() => {
          this.loading.stop();
        });
    } else {
      location.isOpen = false;
    }
  }

  openLocations(location: any) {
    location.isOpen = !location.isOpen;
  }

  // khai: xoa vi tri
  handleDeleteLocation() {
    this.loading.start();
    this.warehouseDiagramService
      .deleteLocation(this.selectDeleteLocation.locationCode)
      .then((res) => {
        if (res.result.responseCode == '00') {
          this.messageService.success(res.result.message, 'Thành công');
          this.listLocations[this.selectDeleteLocation?.index].locationList =
            this.listLocations[
              this.selectDeleteLocation?.index
            ].locationList.filter(
              (loc: any) =>
                loc.locationCode !== this.selectDeleteLocation.locationCode
            );
          this.isVisiblePopupDelete = false;
          this.selectDeleteLocation = {};
        } else {
          this.messageService.warning(res.result.message, 'Cảnh báo');
        }
      });

    this.loading.stop();
  }

  handleAddNewLocation() {
    this.newLocation.parent = this.currentLocation.id;
    this.warehouseDiagramService
      .createNewLocation(this.newLocation)
      .then((response) => {
        if (response.result.responseCode == '00') {
          this.currentLocation.isAddNew = false;
          this.newLocation = { isLocked: false };
          this.openListLocation(this.currentLocation);
          this.messageService.success(
            'Tạo vị trị mới thành công',
            'Thành công'
          );
        } else {
          this.messageService.error('Tạo vị trị mới thất bại', 'Thất bại');
        }
      });
  }

  handleEnterAddNewLocation(event: any, location: any) {
    if (event.keyCode == 13) {
      if (this.newLocation.locationName) {
        this.isVisiblePopupAdd = true;
        this.currentLocation = location;
      } else {
        this.messageService.warning('Bạn phải nhập tên vị trí', 'Cảnh báo');
      }
    }
    event.stopPropagation();
  }

  handleLockLocation(event: any, location: any) {
    this.isVisiblePopupLock = true;
    this.currentLocation = location;
    event.stopPropagation();
  }

  handleOpenInputNewLocation(location: any) {
    location.isAddNew = true;
    setTimeout(() => {
      document.getElementById('new-location')?.focus();
    }, 300);
  }

  handleCancelAddNewLocation() {
    this.currentLocation.isAddNew = false;
    this.isVisiblePopupFocusOut = false;
    this.newLocation = { isLocked: false };
  }

  onHandleFocusOut(location: any) {
    if (this.newLocation.locationName) {
      this.isVisiblePopupFocusOut = true;
    } else {
      this.currentLocation.isAddNew = false;
    }
    this.currentLocation = location;
  }

  handleClickCreate() {
    if (this.newLocation.locationName) {
      this.isVisiblePopupAdd = true;
    } else {
      document.getElementById('new-location')?.focus();
      this.messageService.warning('Bạn phải nhập tên vị trí', 'Cảnh báo');
    }
  }

  handlePositionLock() {
    this.currentLocation = {
      ...this.currentLocation,
      isLocked: !this.currentLocation.isLocked,
    };

    this.warehouseDiagramService
      .updateLocation(this.currentLocation)
      .then((response) => {
        if (response.result.responseCode == '00') {
          if (this.currentLocation.isLocked) {
            this.messageService.success('Khóa vị trí thành công', 'Thành công');
          } else {
            this.messageService.success(
              'Mở khóa vị trí thành công',
              'Thành công'
            );
          }
        } else {
          if (this.currentLocation.isLocked) {
            this.messageService.error('Khóa vị trí thất bại', 'Lỗi');
          } else {
            this.messageService.error('Mở khóa vị trí thất bại', 'Lỗi');
          }
        }
      });
  }

  isVisiblePopupMap: boolean = false;
  currentLocationCode: any = {};
  handleOpenMapped(location: any) {
    this.currentLocationCode = location.locationCode;
    this.isVisiblePopupMap = true;
  }

  openPopupDelete(location: any, index: any) {
    this.isVisiblePopupDelete = true;
    this.selectDeleteLocation = { ...location, index: index };
  }

  handleCancelDeleteLocation() {
    this.isVisiblePopupDelete = false;
  }
}
