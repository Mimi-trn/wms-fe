import { Component, EventEmitter, OnInit } from '@angular/core';
import { StockService } from '../../../services/manage-information/stock-service/stock.service';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-export-stock',
  templateUrl: './export-stock.component.html',
  styleUrls: ['./export-stock.component.css'],
})
export class ExportStockComponent implements OnInit {
  warehouseList: {
    locationCode: string;
    locationName: string;
    isChecked: boolean;
  }[] = [];
  productList: any[] = [];
  date!: any;
  exportOption: 1 | 2 = 1;
  dataLocationFilter: any = {};
  dataProductFilter: any = {};
  listWarehouse: any = [];
  warehouse: any = '';
  get exportExcelPayload() {
    return {
      productList: this.productList
        .filter((e: any) => e.isChecked)
        .map((e: any) => e.productCode),
      locationWarehouseList: this.warehouseList
        .filter((e: any) => e.isChecked)
        .map((e: any) => e.locationCode),
      startDate: this.date[0],
      endDate: this.date[1],
    };
  }

  constructor(
    private message: NzMessageService,
    private stockService: StockService,
    private loading: NgxUiLoaderService
  ) {}

  ngOnInit() {
    // this.getLocationWarehouseList();
    this.getWarehouse();
    this.getProductList();
  }

  // getLocationWarehouseList() {
  //   this.loading.start();
  //   this.stockService
  //     .getLocationWarehouseList(0, 99999)
  //     .pipe(
  //       finalize(() => {
  //         this.loading.stop();
  //       })
  //     )
  //     .subscribe(
  //       (res: any) => {
  //         this.warehouseList = res.data.map((e: any) => ({
  //           locationCode: e.locationCode,
  //           locationName: e.locationName,
  //           isChecked: false,
  //         }));
  //       },
  //       (err) => {
  //         console.error('Error fetching warehouse list:', err);
  //       }
  //     );
  // }

  async getWarehouse() {
    try {
      this.loading.start();
      let resp = await this.stockService.getWarehouse();
      resp.data.forEach((element: any) => {
        let data = {
          text: element.warehouseName,
          value: element.warehouseCode,
        };
        this.listWarehouse.push(data);
      });
    } catch (error) {
    } finally {
      this.loading.stop();
    }
  }

  pageProduct: number = 1;
  pageSizeProduct: number = 10;
  totalProduct: number = 0;
  async getProductList() {
    try {
      this.loading.start();
      const request = {
        pageIndex: this.pageProduct - 1,
        pageSize: this.pageSizeProduct,
        filter: this.dataProductFilter,
        common: '',
        sortProperty: 'id',
        sortOrder: 'asc',
      };
      const resp = await this.stockService.getGroupProductList(request);
      if (resp.result.ok) {
        this.productList = resp.data?.content?.map((e: any) => ({
          ...e,
          isChecked: false,
        }));
        this.totalProduct = resp.data.totalElements;
      } else {
        this.message.error('Có lỗi xảy ra');
      }
    } catch (eror) {
    } finally {
      this.loading.stop();
    }
  }

  paginationProduct(event: any) {
    this.pageProduct = event.page;
    this.pageSizeProduct = event.size;
    this.getProductList();
  }

  onWarehouseCheckedChange(e: boolean) {
    this.warehouseList.forEach((product) => {
      product.isChecked = e;
    });
  }

  onProductCheckedChange(e: boolean) {
    this.productList.forEach((product) => {
      product.isChecked = e;
    });
  }

  exportToExcel() {
    if (
      !this.date ||
      !this.warehouse ||
      this.productList.filter((e: any) => e.isChecked).length <= 0
    ) {
      this.message.warning('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    this.loading.start();
    const request = {
      startDate: this.date[0],
      endDate: this.date[1],
      itemGroupId: this.productList
        .filter((e: any) => e.isChecked)
        .map((e: any) => e.itemGroupId),
      warehouseCode: this.warehouse,
    };
    this.stockService
      .exportStockNew(request)
      .pipe(
        finalize(() => {
          this.loading.stop();
        })
      )
      .subscribe({
        next: (res: any) => {
          let a = document.createElement('a');
          a.download = 'BCTK-' + this.warehouse + '.xlsx';
          a.href = window.URL.createObjectURL(res.body as Blob);
          a.click();
        },
        error: () => {
          this.message.error('Có lỗi xảy ra khi xuất file Excel');
        },
      });
  }
}
