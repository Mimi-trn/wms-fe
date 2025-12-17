import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { ExportRequestService } from 'src/app/services/export-warehouse/exportRequestService.service';

@Component({
  selector: 'app-location-export',
  templateUrl: './location-export.component.html',
  styleUrls: ['./location-export.component.css'],
})
export class LocationExportComponent implements OnInit {
  @Input() product: any = '';
  @Input() listLocation: any[] = [];
  @Output() productChild: any = new EventEmitter<any>();
  @Output() totalActualQuantity: any = new EventEmitter<any>();
  constructor(private exportService: ExportRequestService) {}

  ngOnInit() {
    console.log(this.listLocation);

    if (this.listLocation !== undefined) {
      this.dataLocations = this.listLocation;
      console.log(this.dataLocations);
    }

    this.getListLocationWarehouse();
  }

  async getListLocationWarehouse() {
    let dataRequest = {
      pageIndex: 0,
      pageSize: 0,
      filter: {
        has_child: null,
        parent: 0,
      },
      common: '',
      sortProperty: '',
      sortOrder: '',
    };

    let res = await this.exportService.getLocationWarehouse(dataRequest);
    if (res) {
      if (res.result.responseCode == '00') {
        this.listLocationWarehouseName = res.data;
      }
    }
  }

  async changeLocationWarehouse(event: any, row: any) {
    row['locationCode'] = '';
    row['grnCode'] = '';
    console.log(event);

    let res = await this.exportService.getLocationCode(row.productCode, event);
    if (res) {
      if (res.result.responseCode == '00') {
        this.listLocationCode = res.data;
      }
    }
  }

  async changeLocationCode(event: any, row: any) {
    row['grnCode'] = '';
    row['locationName'] = this.listLocationCode.filter(
      (item) => item.id == event
    )[0].locationName;
    let res = await this.exportService.getGrnCode(row.productCode, event);
    if (res) {
      if (res.result.responseCode == '00') {
        this.listGrnCode = res.data;
      }
    }
  }

  async changeGrnCode(event: any, row: any) {
    if (event) {
      row['exportPackageQuantity'] = 0;
      row['itemQuantity'] = '';
      console.log(event);
      console.log(row);
      let res = await this.exportService.getItemQuantity(
        row.productCode,
        event,
        row['locationCode']
      );
      if (res) {
        if (res.result.responseCode == '00') {
          this.listItemQuantity = res.data;
        }
      }
    }
  }

  itemQuantityId: any = 0;
  changeItemQuantity(event: any, row: any) {
    row['exportPackageQuantity'] = 0;
    row['packageQuantity'] = this.listItemQuantity.filter(
      (item) => item.id == event
    )[0].packageQuantity;
    this.itemQuantityId = event;
  }

  onHandleExportPackageQuantity(event: any, row: any) {
    console.log(row['itemQuantity']);
    console.log(event);

    let itemQuantity = this.listItemQuantity.filter(
      (item) => (item.id = this.itemQuantityId)
    )[0].itemQuantity;

    row['exportItemQuantity'] = itemQuantity * event;
    this.calculateTotalActualQuantity();
  }

  countTotalActualQuantity: number = 0;
  calculateTotalActualQuantity() {
    this.countTotalActualQuantity = this.dataLocations.reduce(
      (sum, item) => sum + parseFloat(item.exportItemQuantity),
      0
    );
    this.totalActualQuantity.emit(this.countTotalActualQuantity);
  }

  dataLocations: any[] = [];
  listLocationWarehouseName: any[] = [];
  listLocationCode: any[] = [];
  listGrnCode: any[] = [];
  listItemQuantity: any[] = [];

  id = -1;
  onResize({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.columns[i].width = width + 'px';
    });
  }
  sortProperty: string = 'updatedAt';
  sortOrder: string = 'descend';
  customSortFunction(sortColumn: any) {
    if (sortColumn.sortOrder == '' || sortColumn.sortOrder == 'ascend') {
      sortColumn.sortOrder = 'descend';
    } else {
      sortColumn.sortOrder = 'ascend';
    }
    this.sortOrder = sortColumn.sortOrder;
    this.sortProperty = sortColumn.keyName;
    // this.getData();
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

  onHandleDelete(row: any) {
    this.dataLocations = this.dataLocations.filter(
      (item) => item.id !== row.id
    );
  }

  nextId: number = 1;
  addRow() {
    const newItem: any = {
      id: this.nextId++,
      productCode: this.product.productCode,
      itemName: this.product.itemName,
      locationWarehouseName: '',
      locationCode: '',
      locationName: '',
      itemQuantity: 0,
      packageQuantity: 0,
      exportItemQuantity: 0,
      exportPackageQuantity: 0,
    };
    this.dataLocations = [...this.dataLocations, newItem];
  }

  saveLocation() {
    console.log(this.dataLocations);

    let dataSend: any[] = [];
    this.dataLocations.forEach((item) => {
      dataSend.push({
        ...item,
        exportItemId: this.product.id, //Id hàng hóa cha
        locationPackageId: item.itemQuantity, //id kiện
        exportPackageQuantity: item.exportPackageQuantity, //số lượng kiện xuất
      });
    });
    this.productChild.emit(dataSend);
  }

  allChecked: boolean = true;
  indeterminate: boolean = false;
  columns: any[] = [
    {
      keyTitle: 'Mã hàng hóa',
      keyName: 'productCode',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'Tên hàng hóa',
      keyName: 'itemName',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'Kho',
      keyName: 'locationWarehouseName',
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
      keyTitle: 'GRN code',
      keyName: 'grnCode',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'Vị trí',
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
      keyTitle: 'Số lượng kiện xuất',
      keyName: 'exportPackageQuantity',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'Số lượng thực xuất',
      keyName: 'exportItemQuantity',
      width: '200px',
      check: true,
    },
  ];
}
