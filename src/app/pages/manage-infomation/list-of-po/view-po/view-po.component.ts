import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CheckRoleService } from 'src/app/services/checkRole.service';
import { PoCommonService } from 'src/app/services/manage-information/common/po-common.service';
import { PoService } from 'src/app/services/manage-information/list-po-service/po.service';
import { MessageService } from 'src/app/services/message.service';
import { TransferDataService } from 'src/app/services/transferData.service';

@Component({
  selector: 'app-view-po',
  templateUrl: './view-po.component.html',
  styleUrls: ['./view-po.component.css'],
})
export class ViewPoComponent implements OnInit {
  constructor(
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    private loading: NgxUiLoaderService,
    private activatedRoute: ActivatedRoute,
    private poService: PoService,
    private poCommonService: PoCommonService,
    private transferData: TransferDataService,
    private checkRole: CheckRoleService
  ) {
    this.param = this.activatedRoute.snapshot.params['id'];
    this.listStatus = [
      { text: 'Mở', value: 2 },
      { text: 'Đóng', value: 1 },
    ];
    this.listSource = [
      { text: 'Trong nước', value: 1 },
      { text: 'Nước ngoài', value: 2 },
    ];
    this.getCurrency().then(() => {
      this.getData();
    });
    this.getUnit();
    this.getTransport();
    this.currency = 'VNĐ';
  }

  async getUnit() {
    let resp = await this.poCommonService.getUnit();
    if (resp.result.responseCode == '00') {
      resp.data.forEach((ele: any) => {
        this.listSupplierUom.push({
          text: ele.paramValue,
          value: ele.paramValue,
        });
      });
    } else {
      this.messageService.error(`${resp.result.message}`, 'Lỗi');
    }
  }

  async getCurrency() {
    let resp = await this.poCommonService.getCurrency();
    if (resp.result.responseCode == '00') {
      resp.data.forEach((ele: any) => {
        this.listCurrency.push({
          text: `${ele.paramValue}`,
          value: ele.paramId,
        });
      });
    } else {
      this.messageService.error(`${resp.result.message}`, 'Lỗi');
    }
  }

  async getTransport() {
    let resp = await this.poCommonService.getTransport();
    if (resp.result.responseCode == '00') {
      resp.data.forEach((ele: any) => {
        this.listTransportation.push({
          text: `${ele.paramValue}`,
          value: ele.paramId,
        });
      });
    } else {
      this.messageService.error(`${resp.result.message}`, 'Lỗi');
    }
  }

  async getData() {
    this.loading.start();
    let resp = await this.poService.viewPO(this.param);
    if (resp.result.responseCode == '00') {
      this.loading.stop();

      const po = resp.data.purchaseOrderDTO;

      this.dataInformation = {
        ...this.dataInformation,
        poCode: po.poCode,
        prCode: po.prCode,
        source: po.source,
        documentAt: po.documentAt ? new Date(po.documentAt) : null,
        deliveryAt: po.deliveryAt ? new Date(po.deliveryAt) : null,
        status: po.status,
        currency: po.currency,
        exchangeRate: po.exchangeRate,
        createdBy: po.createdBy,
        createdAt: po.createdAt ? new Date(po.createdAt) : null,
        updatedAt: po.updatedAt ? new Date(po.updatedAt) : null,
        note: po.note,
        vendorCode: po.vendorCode,
        vendorName: po.vendorName, // ✅ Lấy trực tiếp từ API
        iqcCreated: po.iqcCreated
      };

      this.discount = po.discount;
      this.tax = po.tax;

      this.dataLogistics = {
        ...this.dataLogistics,
        transport: po.shippingType,
        deliveryAddress: po.shipTo,
        vendorAddress: po.supplierAddress
      };

      this.dataItem = resp.data.listItem;
      this.dataItem.forEach((element) => {
        element.amountInRow = this.onHandleConvertToString(element.amount);
      });

    } else {
      this.loading.stop();
      this.messageService.warning(`${resp.result.message}`, `Lỗi`);
      this.router.navigate(['./manage-info/manage-list-po']);
    }

    this.calculateTotalAmount();
    this.calculateTotalOpenQuantity();
    this.calculateTotalSupplierQuantity();
    this.onHandleDiscountInput();
  }

  checkIsRole(role: string) {
    return this.checkRole.checkRole(role);
  }

  ngOnInit() {
    this.loading.start();
    this.setBreadcrumb();
    this.columns = [
      {
        keyTitle: 'menu.manage.po.item.itemCode',
        keyName: 'itemCode',
        check: true,
        width: '200px',
      },
      {
        keyTitle: 'menu.manage.po.item.itemName',
        keyName: 'itemName',
        check: true,
        width: '200px',
      },

      {
        keyTitle: 'menu.manage.po.item.supplierUom',
        keyName: 'supplierUom',
        check: true,
        width: '200px',
      },
      {
        keyTitle: 'menu.manage.po.item.uom',
        keyName: 'uom',
        check: true,
        width: '200px',
      },
      {
        keyTitle: 'menu.manage.po.item.exchangeRate',
        keyName: 'exchangeRate',
        check: true,
        width: '200px',
      },
      {
        keyTitle: 'menu.manage.po.item.supplierQuantity',
        keyName: 'supplierQuantity',
        check: true,
        width: '200px',
      },
      {
        keyTitle: 'menu.manage.po.item.supplierUnitPrice',
        keyName: 'supplierUnitPrice',
        check: true,
        width: '200px',
      },
      {
        keyTitle: 'menu.manage.po.item.discount',
        keyName: 'discount',
        check: true,
        width: '200px',
      },
      {
        keyTitle: 'menu.manage.po.item.amount',
        keyName: 'amount',
        check: true,
        width: '200px',
      },
    ];

    this.loading.stop();
  }

  // Hàm xử lý select list item
  onHandleChangeItemCode(row: any) {
    const foundItem = this.listItem.find(
      (item) => item.itemCode === row.itemCode
    );
    if (foundItem) {
      this.dataItem = this.dataItem.map((item) => {
        if (item.itemCode === row.itemCode) {
          return {
            ...item,
            itemName: foundItem.itemName,
            uom: foundItem.uom,
            openQuantity: foundItem.openQuantity,
          };
        }
        return item;
      });
    }
    this.calculateTotalOpenQuantity();
  }

  onHandleChangeSupplier(row: any) { }

  onHandleChangeSupplierUom(row: any) { }

  onHandleExchangeRate(row: any) {
    if (!row.discount) {
      row.discount = 0;
    }
    if (!row.exchangeRate) {
      row.exchangeRate = 1;
    }
    if (!row.supplierUnitPrice) {
      row.supplierUnitPrice = 1;
    }
    if (!row.supplierQuantity) {
      row.supplierQuantity = 1;
    }
    row.amount =
      ((100 - row.discount) / 100) *
      row.supplierQuantity * (row.supplierUnitPrice * this.dataInformation.exchangeRate);
    row.openQuantity = row.supplierQuantity * row.exchangeRate;
    this.calculateTotalAmount();
  }

  onHandleSupplierQuantity(row: any) {
    if (!row.discount) {
      row.discount = 0;
    }
    if (!row.exchangeRate) {
      row.exchangeRate = 1;
    }
    if (!row.supplierUnitPrice) {
      row.supplierUnitPrice = 1;
    }
    if (!row.supplierQuantity) {
      row.supplierQuantity = 1;
    }
    row.amount =
      ((100 - row.discount) / 100) *
      row.supplierQuantity * (row.supplierUnitPrice * this.dataInformation.exchangeRate);
      row.openQuantity = row.supplierQuantity * row.exchangeRate;
    this.calculateTotalAmount();
    this.calculateTotalSupplierQuantity();
  }

  onHandleSupplierUnitPrice(row: any) {
    if (!row.discount) {
      row.discount = 0;
    }
    if (!row.exchangeRate) {
      row.exchangeRate = 1;
    }
    if (!row.supplierUnitPrice) {
      row.supplierUnitPrice = 1;
    }
    if (!row.supplierQuantity) {
      row.supplierQuantity = 1;
    }
    row.amount =
      ((100 - row.discount) / 100) *
      row.supplierQuantity * (row.supplierUnitPrice * this.dataInformation.exchangeRate);
      row.openQuantity = row.supplierQuantity * row.exchangeRate;
    this.calculateTotalAmount();
  }

  onHandleDiscount(row: any) {
    if (!row.discount) {
      row.discount = 0;
    }
    if (!row.exchangeRate) {
      row.exchangeRate = 1;
    }
    if (!row.supplierUnitPrice) {
      row.supplierUnitPrice = 1;
    }
    if (!row.supplierQuantity) {
      row.supplierQuantity = 1;
    }
    row.amount =
      ((100 - row.discount) / 100) *
      row.supplierQuantity * (row.supplierUnitPrice * this.dataInformation.exchangeRate);
      row.openQuantity = row.supplierQuantity * row.exchangeRate;
    this.calculateTotalAmount();
  }

  /** Thành tiền trong hàng */
  onHandleCalculateAmountInRow(row: any) {
    return (
      ((100 - row.discount) / 100) *
      row.supplierQuantity * (row.supplierUnitPrice * this.dataInformation.exchangeRate)
    );
  }

  /**Phương thức xử lý chức năng convert thành tiền -> string
   * @param {number} price - Số tiền
   */
  onHandleConvertToString(price: any) {
    price = price.toString();
    let result: any = '';
    if (price.length == 0) result = 'Chưa nhập giá';
    if (price.length >= 5 && price.length <= 6) {
      result += price.slice(-price.length, -3) + ' Ngàn';
    } else if (price.length >= 7 && price.length <= 9) {
      result +=
        price.slice(-price.length, -6) +
        ' Triệu ' +
        price.slice(-6, -3) +
        ' Ngàn ';
    } else if (price.length >= 10)
      result +=
        price.slice(-price.length, -9) +
        ' Tỷ ' +
        price.slice(-9, -6) +
        ' Triệu ' +
        price.slice(-6, -3) +
        ' Ngàn ';
    else result += price;
    return result;
  }

  totalAmount: number = 0;
  calculateTotalAmount() {
    this.countAmount = this.dataItem.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    this.totalAmount = this.onHandleConvertToString(this.countAmount);
    this.showCountAmount = this.countAmount + ' ' + this.currency;
  }
  showCountAmount: any = '';

  calculateTotalSupplierQuantity() {
    this.countSupplierQuantity = this.dataItem.reduce(
      (sum, item) => sum + item.supplierQuantity,
      0
    );
  }

  calculateTotalOpenQuantity() {
    this.countOpenQuantity = this.dataItem.reduce(
      (sum, item) => sum + parseInt(item.openQuantity),
      0
    );
  }

  countDiscountConvertString: any = '';
  countTaxConvertString: any = '';
  countConvertString: any = '';

  onHandleDiscountInput() {
    this.countDiscount = (this.countAmount * this.discount) / 100;
    this.countDiscountConvertString = this.onHandleConvertToString(
      this.countDiscount
    );
    this.onHandleTaxInput();
  }

  onHandleTaxInput() {
    this.countTax = (this.countAmount * this.tax) / 100;
    this.count = this.countAmount - this.discount - this.countTax;
    this.countTaxConvertString = this.onHandleConvertToString(this.countTax);
    this.countConvertString = this.onHandleConvertToString(this.count);
    this.showCount = this.count + ' ' + this.currency;
  }

  showCount: any = '';

  deleteRecord(row: any) {
    if (!row.amount) {
      this.countAmount -= 0;
    }
    return (this.dataItem = this.dataItem.filter(
      (obj) => obj.itemCode !== row.itemCode
    ));
  }

  // Hàm xử lý sự kiện breadscrumb
  setBreadcrumb() {
    this.breadcrumbs = [
      {
        name: 'menu.manage.receipt',
        route: ``,
      },
      {
        name: 'menu.manage.po',
        route: `/manage-info/manage-list-po`,
      },
      {
        name: 'menu.manage.po.view',
        route: `/manage-info/manage-list-po/${this.param}`,
      },
    ];
    this.isBreadcrumb = true;
  }

  // Xử lý file
  handleChange({ file, fileList }: NzUploadChangeParam): void {
    const status = file.status;
    if (status !== 'uploading') {
    }
    if (status === 'done') {
    } else if (status === 'error') {
    }
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    this.fileList = this.fileList.concat(file);
    return false;
  };
  // Hàm xử lý sự kiện onResize
  // onResize({ width }: NzResizeEvent, col: any): void {
  //   this.columns = this.columns.map((e) =>
  //     e.keyTitle === col.keyTitle ? { ...e, width: `${width}px` } : e
  //   );
  // }
  id = -1;
  onResize({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.columns[i].width = width + 'px';
    });
  }
  // Tìm kiếm
  search() { }
  // Gửi duyệt
  createRequriedIQC() {
    this.transferData.setObjectFromPO(this.dataInformation);
    this.router.navigate(['./manage-warehouse-receipt/create-iqc-request']);
  }
  // Kiểm tra phần tử cuối để loại bỏ chức năng resize
  lastObject(obj: any) {
    if (obj == this.columns[this.columns.length - 1]) {
      return false;
    } else {
      return true;
    }
  }
  // Hủy bỏ
  close() {
    this.router.navigate(['./manage-info/manage-list-po']);
  }
  // Thay đổi lựa chọn hiển thị danh sách hàng hóa
  changeSelect(event: any) {
    this.choose = event;
  }

  // Xóa
  clearFilter(column: any) { }

  // add row
  onHandleAddRow() {
    this.dataItem = [...this.dataItem, {}];
  }

  // Params
  param: any = '';
  // Value
  isBreadcrumb: boolean = false;
  isHidden: boolean = true;
  breadcrumbs: Object[] = [];
  // File
  fileList: NzUploadFile[] = [];
  // Column
  columns: any[] = [];
  // Filter
  listItemType: any[] = [];
  // List data item
  dataItem: any[] = [];
  dataLogistics: any = {};
  dataInformation: any = {
    documentAt: '',
  };
  dataFilter: any = {};
  // List select
  listImportType: any[] = [];
  listWarehouse: any[] = [];
  listStatus: any[] = [];
  listImportRequestCode: any[] = [];
  listPOCode: any[] = [];
  listSource: any[] = [];
  listCurrency: any[] = [];
  listItem: any[] = [];
  listSupplier: any[] = [];
  listSupplierUom: any[] = [];
  listTransportation: any[] = [];
  // Button radio
  choose: number = 0;
  // Count
  countSupplierQuantity: number = 0;
  countOpenQuantity: number = 0;
  countAmount: number = 0;
  discount: number = 0;
  countDiscount: number = 0;
  tax: number = 0;
  countTax: number = 0;
  count: number = 0;
  currency: string = '';
  listOfRadioButton: string[] = ['button.detail'];

}
