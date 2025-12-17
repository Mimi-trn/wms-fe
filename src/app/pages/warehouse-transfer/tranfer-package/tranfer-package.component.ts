import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { WarehouseTransferService } from 'src/app/services/warehouse-transfer/warehouse-transfer.service';
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
  selector: 'app-tranfer-package',
  templateUrl: './tranfer-package.component.html',
  styleUrls: ['./tranfer-package.component.css'],
})
export class TranferPackageComponent implements OnInit {
  @Input() warehouseCode: any = '';
  @Input() product: any = {};
  @Input() isFromWarehouse: boolean = true;
  @Input() actualQuantity: any = 0;
  @Input() title: any = 'Danh sách vị trí';
  @Input() isView: boolean = false;
  dataLocations: any[] = [];
  listLocation: any[] = [];
  pageLocation: number = 1;
  perPageLocation: number = 10;
  totalLocation: number = 0;
  checked = false;
  indeterminate = false;
  filterLocation: any = {};
  setOfCheckedId = new Set<any>();
  isShowPopoverTableLocation: boolean = false;
  errorMessage: any = '';
  columns: any[] = [
    {
      keyTitle: 'Mã kho',
      keyName: 'warehouseCode',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'Mã vị trí',
      keyName: 'locationCode',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'Tên vị trí',
      keyName: 'locationName',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'Số lượng hàng mỗi kiện',
      keyName: 'itemQuantity',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'Số lượng kiện hàng',
      keyName: 'packageQuantity',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'Tổng số lượng hàng',
      keyName: 'totalQuantity',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'Số lượng tồn kho',
      keyName: 'stockLocationQuantity',
      width: '200px',
      check: true,
    },
  ];

  constructor(
    private warehouseTransferService: WarehouseTransferService,
    private keycloakService: KeycloakService,
    private messageService: MessageService,
    private checkRole: CheckRoleService
  ) {}
  ngOnInit() {
    this.getLocationList();
    this.dataLocations = [];
    if (this.isFromWarehouse) {
      this.dataLocations = this.product['listFromWarehouse'] || [];
    } else {
      this.dataLocations = this.product['listToWarehouse'] || [];
    }
  }

  updateDataLocations() {
    if (this.isFromWarehouse) {
      this.product['listFromWarehouse'] = this.dataLocations;
    } else {
      this.product['listToWarehouse'] = this.dataLocations;
    }
  }

  getLocationList() {
    let request = {
      warehouseCode: this.warehouseCode || '',
      itemCode: this.product.itemCode || '',
    };

    this.warehouseTransferService.getListLocation(request).then((res: any) => {
      if (res.result.ok) {
        this.listLocation = res.data.locations;
      } else {
        this.messageService.warning(res.result.message, 'Cảnh báo');
      }
    });
  }

  id = -1;
  onResize({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.columns[i].width = width + 'px';
    });
  }
  onHandleDelete(row: any) {
    this.dataLocations = this.dataLocations.filter(
      (item) => item.id !== row.id
    );
    this.setOfCheckedId.delete(row.id);
    this.updateDataLocations();
  }
  addRow() {
    this.isShowPopoverTableLocation = true;
  }

  changeVisible(event: any) {
    this.isShowPopoverTableLocation = event;
  }
  onAllChecked(value: boolean): void {
    if (value) {
      this.dataLocations = this.listLocation;
      this.setOfCheckedId.clear();
      this.listLocation.map((item) => {
        this.setOfCheckedId.add(item.id);
      });
    } else {
      this.dataLocations = [];
      this.setOfCheckedId.clear();
    }
    this.updateDataLocations();
  }
  clickRow(data: any) {
    if (!Array.isArray(this.dataLocations)) {
      this.dataLocations = [];
    }
    if (this.setOfCheckedId.has(data.id)) {
      this.dataLocations = this.dataLocations.filter(
        (item) => item.id !== data.id
      );
      this.setOfCheckedId.delete(data.id);
    } else {
      this.dataLocations = [...this.dataLocations, data];
      this.setOfCheckedId.add(data.id);
    }
    this.updateDataLocations();
  }
  filter($event: any) {
    if ($event.keyCode == 13) {
      this.getLocationList();
    } else if ($event.type == 'click') {
      this.getLocationList();
    }
  }
  calculateTotalActualQuantity(row: any) {
    const quantity = this.dataLocations?.reduce(
      (sum, item) => sum + item.itemQuantity * item.packageQuantity,
      0
    );
    if (this.isFromWarehouse) {
      this.product.actualQuantity = quantity;
      this.errorMessage = '';
      this.product['check'] = true;
      this.product['message'] = '';
      if (row.itemQuantity * row.packageQuantity > row.stockLocationQuantity) {
        this.product['check'] = false;
        this.product['message'] = 'Quá số lượng tồn kho';
      }
    } else {
      if (quantity > this.actualQuantity) {
        this.errorMessage = 'Số lượng nhập đang lớn hơn số lượng xuất';
      }
      if (quantity < this.actualQuantity) {
        this.errorMessage = 'Số lượng nhập đang nhỏ hơn số lượng xuất';
      }
      if (quantity == this.actualQuantity) {
        this.errorMessage = '';
      }
    }
  }
  clearFilter(keyName: any) {
    this.filterLocation[keyName] = '';
    this.getLocationList();
  }
  paginationLocation(event: any) {
    this.pageLocation = event.page;
    this.perPageLocation = event.size;
    this.getLocationList();
  }
}
