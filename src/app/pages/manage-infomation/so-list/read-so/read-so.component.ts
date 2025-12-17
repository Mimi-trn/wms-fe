import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SoService } from 'src/app/services/manage-information/so/so.service';
import { MessageService } from 'src/app/services/message.service';
import { TransferDataService } from 'src/app/services/transferData.service';

@Component({
  selector: 'app-read-so',
  templateUrl: './read-so.component.html',
  styleUrls: ['./read-so.component.css'],
})
export class ReadSoComponent implements OnInit {
  // Param
  param: string = '';
  // Breadscrumb
  isBreadcrumb: boolean = false;
  isHidden: boolean = true;
  breadcrumbs: Object[] = [];
  // Thông tin đơn hàng
  dataInformation: any = {};
  listStatus: Select[] = [
    {
      text: 'Mở',
      value: 1,
    },
    {
      text: 'Đóng',
      value: 0,
    },
  ];
  // Danh sách hàng hóa
  dataItems: any[] = [];
  columns: Column[] = [];
  dataFilter: any = {};
  // Tính só lượng
  calculateQuantity: number = 0;
  calculateHoldQuantity: number = 0;
  constructor(
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    private loading: NgxUiLoaderService,
    private transferData: TransferDataService,
    private activatedRoute: ActivatedRoute,
    private soService: SoService
  ) {}

  ngOnInit() {
    this.param = this.activatedRoute.snapshot.params['id'];
    this.readSO(this.param);
    this.listItem(this.param);
    this.setBreadcrumb();
    this.columns = [
      {
        keyTitle:
          'sidebar.information.child.listSO.child.listProduct.productCode',
        keyName: 'productCode',
        check: true,
        width: '200px',
      },
      {
        keyTitle: 'sidebar.information.child.listSO.child.listProduct.itemName',
        keyName: 'productName',
        check: true,
        width: '300px',
      },
      {
        keyTitle:
          'sidebar.information.child.listSO.child.listProduct.description',
        keyName: 'description',
        check: true,
        width: '300px',
      },
      {
        keyTitle: 'sidebar.information.child.listSO.child.listProduct.uom',
        keyName: 'uom',
        check: true,
        width: '200px',
      },
      {
        keyTitle:
          'sidebar.information.child.listSO.child.listProduct.soQuantity',
        keyName: 'quantity',
        check: true,
        width: '200px',
      },
      {
        keyTitle:
          'sidebar.information.child.listSO.child.listProduct.holdQuantity',
        keyName: 'holdQuantity',
        check: true,
        width: '200px',
      },
    ];
  }

  async readSO(productOrderCode: string) {
    let data = {
      pageIndex: 0,
      pageSize: 0,
      sortProperty: '',
      sortOrder: '',
      common: '',
      filter: {
        productOrderCode: productOrderCode,
      },
    };
    let resp = await this.soService.listSO(data);
    if (resp.result.responseCode == '00') {
      this.dataInformation = {
        ...resp.data[0],
        orderDate: new Date(resp.data[0].orderDate),
        deliveryAt: new Date(resp.data[0].deliveryAt),
      };
    }
  }

  clear(keyName: any) {
    this.dataFilter[keyName] = '';
  }

  async listItem(productOrderCode: string) {
    let data = {
      pageIndex: 0,
      pageSize: 0,
      common: '',
      sortProperty: '',
      sortOrder: '',
      filter: {
        productOrderCode: productOrderCode,
        productCode: '',
        productName: '',
        description: '',
        note: '',
        uom: '',
      },
    };
    let resp = await this.soService.listItem(data);
    if (resp.result.responseCode == '00') {
      this.dataItems = resp.data;
    }
    this.calculateTotalQuantity();
    this.calculateTotalHoldQuantity();
  }

  id = -1;
  onResize({ width }: NzResizeEvent, i: number): void {
      cancelAnimationFrame(this.id);
      this.id = requestAnimationFrame(() => {
          this.columns[i].width = width + 'px';

      })
  }

  lastObject(obj: any) {
    if (obj == this.columns[this.columns.length - 1]) {
      return false;
    } else {
      return true;
    }
  }

  // Tính toán số lượng
  calculateTotalHoldQuantity() {
    this.calculateHoldQuantity = this.dataItems.reduce(
      (sum, item) => sum + parseFloat(item.holdQuantity),
      0
    );
  }

  calculateTotalQuantity() {
    this.calculateQuantity = this.dataItems.reduce(
      (sum, item) => sum + parseFloat(item.quantity),
      0
    );
  }

  setBreadcrumb() {
    this.breadcrumbs = [
      {
        name: 'menu.manage.information',
        route: ``,
      },
      {
        name: 'sidebar.information.child.listSO.name',
        route: `/manage-info/list-so`,
      },
      {
        name: 'sidebar.information.child.listSO.child.readSO',
        route: `/manage-info/list-so/${this.param}`,
      },
    ];
    this.isBreadcrumb = true;
  }

  onHandleClose() {
    this.router.navigate(['./manage-info/list-so']);
  }

  onHandleCreateExportRequest() {
    let data = {
      dataObj: this.dataInformation,
      listItem: this.dataItems,
    };
    this.transferData.setObjSo(data);
    this.router.navigate(['./export/list-request-export/new']);
  }

  onHandleCreateIQC() {
    let data = {
      data: this.dataInformation,
      listItem: this.dataItems,
    };
    this.transferData.setObjSo(data);
    this.router.navigate(['./manage-warehouse-receipt/create-iqc-request']);
  }
}

interface Select {
  text: string;
  value: any;
}
interface Column {
  keyTitle: string;
  keyName: string;
  width: string;
  check: boolean;
}
