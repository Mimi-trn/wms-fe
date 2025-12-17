import { Component, OnInit } from '@angular/core';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { StockService } from 'src/app/services/manage-information/stock-service/stock.service';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-location-stock',
  templateUrl: './location-stock.component.html',
  styleUrls: ['./location-stock.component.css'],
})
export class LocationStockComponent implements OnInit {
  constructor(
    private router: Router,
    private loading: NgxUiLoaderService,
    private stockService: StockService,
    private messageService: MessageService,
    private activatedRoute: ActivatedRoute
  ) { }
  isBreadcrumb: boolean = false;
  breadcrumbs: Object[] = [];
  isHidden: boolean = true;
  dataInformation: any = {};
  param: any = {};
  dataItems: any = [];
  dataGrnLocations: any = []
  dataGdnLocations: any = []
  columns: any = [];
  grnColumms: any = [];
  gdnColumms: any = [];


  ngOnInit() {
    this.setBreadcrumb();
    this.activatedRoute.queryParams.subscribe((params: any) => {
      this.param = params;
    });
    this.columns = [
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
        keyTitle: 'Số lượng tồn',
        keyName: 'stockLocationQuantity',
        width: '200px',
        check: true,
      },
    ];
    this.grnColumms = [
      {
        keyTitle: 'Mã phiếu',
        keyName: 'grnCode',
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
        keyTitle: 'Số lượng nhập',
        keyName: 'importedQuantity',
        width: '200px',
        check: true,
      },
    ];
    this.gdnColumms = [
      {
        keyTitle: 'Mã phiếu',
        keyName: 'gdnCode',
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
        keyTitle: 'Số lượng xuất',
        keyName: 'exportedQuantity',
        width: '200px',
        check: true,
      },
    ];
    this.getLocationStock();
  }
  setBreadcrumb() {
    this.breadcrumbs = [
      {
        name: 'Quản lý tồn kho',
        route: ``,
      },
      {
        name: 'Chi tiết tồn kho',
        route: ``,
      },
    ];
    this.isBreadcrumb = true;
  }

  id = -1;
  onResize({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.columns[i].width = width + 'px';
    });
  }

  async getLocationStock() {
    try {
      this.loading.start();
      const request = {
        warehouseCode: this.param.warehouseCode,
        itemCode: this.param.itemCode,
      };
      const resp = await this.stockService.getLocationStock(request);
      if (resp.result.ok) {
        this.dataInformation = {
          ...resp.data,
          ...this.param,
        };
        this.dataItems = resp.data?.locations;
        this.dataGrnLocations = resp.data?.grnLocationList;
        this.dataGdnLocations = resp.data?.gdnLocationList;
      } else {
        this.messageService.warning(resp.result.message, 'Cảnh báo');
      }
    } catch (error) {
      this.messageService.error('Có lỗi xảy ra, vui lòng thử lại sau', 'Lỗi');
    } finally {
      this.loading.stop();
    }
  }

  handleClose() {
    this.router.navigate(['/manage-stock/inventory-situation']);
  }



}
