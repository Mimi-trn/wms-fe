import { Component, OnInit, Pipe } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { PoCommonService } from 'src/app/services/manage-information/common/po-common.service';
import { PoService } from 'src/app/services/manage-information/list-po-service/po.service';
import { MessageService } from 'src/app/services/message.service';
import { TransferDataService } from 'src/app/services/transferData.service';

@Component({
  selector: 'app-create-po',
  templateUrl: './create-po.component.html',
  styleUrls: ['./create-po.component.css'],
})
export class CreatePoComponent implements OnInit {
  constructor(
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    private loading: NgxUiLoaderService,
    private poCommonService: PoCommonService,
    private poService: PoService,
    private transferService: TransferDataService
  ) {
    this.listItemType = [
      { text: 'Mới', value: 1 },
      { text: 'Đặc biệt', value: 2 },
      { text: 'Thông thường', value: 3 },
    ];
    this.listImportType = [
      { text: 'Nhập kho mua hàng', value: 1 },
      { text: 'Nhập kho sản xuất', value: 2 },
      { text: 'Nhập kho NVL dư thừa', value: 3 },
      { text: 'Nhập kho hàng ký gửi', value: 4 },
      { text: 'Nhập kho hàng bán bị trả lại', value: 5 },
    ];
    this.listTax = [
      { text: "0%", value: 0 },
      { text: "5%", value: 5 },
      { text: "7%", value: 7 },
      { text: "8%", value: 8 },
      { text: "10%", value: 10 },
    ];
    this.listWarehouse = [
      { text: 'Kho nhà máy', value: '1' },
      { text: 'Kho 157', value: '2' },
    ];
    this.listImportRequestCode = [
      { text: 'PN01', value: 'PN01' },
      { text: 'PN02', value: 'PN02' },
      { text: 'PN03', value: 'PN03' },
    ];
    this.listPOCode = [
      { text: 'PO01', value: 'PO01' },
      { text: 'PO02', value: 'PO02' },
      { text: 'PO03', value: 'PO03' },
    ];
    this.listStatus = [
      { text: 'Mở', value: 2 },
      // { text: 'Đóng', value: 2 },
    ];
    this.listSource = [
      { text: 'Trong nước', value: 1 },
      { text: 'Quốc tế', value: 2 },
    ];
    this.getItems();
    this.getCurrency();
    this.getUnit();
    this.getTransport();
    this.getVendor();
  }

  changeCurrency(event: any) {
    if (event == null) {
      this.dataInformation.exchangeRate = 0;
    }
    this.listCurrency.forEach((element: any) => {
      if (element.value == event) {
        this.dataInformation.exchangeRate = element.exchangeRate;
      }
    });
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
          text: ele.paramValue,
          value: ele.paramId,
          exchangeRate: ele.exchangeRate,
        });
      });
      this.dataInformation.currency = this.listCurrency[0].value;
      this.changeCurrency(this.listCurrency[0].value);
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

  async getVendor() {
    let resp = await this.poCommonService.getVendor();
    if (resp.result.responseCode == '00') {
      this.listVendor = resp.data;
      resp.data.forEach((ele: any) => {
        this.listSupplier.push({
          text: ele.vendorCode,
          value: ele.vendorCode,
        });
      });
    } else {
      this.messageService.error(`${resp.result.message}`, 'Lỗi');
    }
  }
  pageNVL: number = 1;
  perPageNVL: number = 10;
  totalNVL: number = 0;
  async getItems() {
    let data = {
      pageNumber: this.pageNVL - 1,
      pageSize: this.perPageNVL,
      common: '',
      filter: {
        itemCode: this.filterChildItems.itemCode,
        itemName: this.filterChildItems.itemName,
        unit: this.filterChildItems.uom,
      },
      sortOrder: 'DESC',
      sortProperty: 'updatedAt',
    };
    let resp = await this.poCommonService.getItemsNVL(data);
    this.listItem = resp.data;
    this.totalNVL = resp.dataCount;
    // this.totalNVL = resp.dataCount;
    if (resp.result.responseCode == '00') {
    } else {
      this.messageService.error(`${resp.result.message}`, 'Lỗi');
    }
  }

  searchItems($event: any) {
    if ($event.keyCode == 13) {
      this.getItems();
    } else if ($event.type == 'click') {
      this.getItems();
    }
  }

  paginationNVL(event: any) {
    this.pageNVL = event.page;
    this.perPageNVL = event.size;
    this.getItems();
  }

  filterChildItems: any = {
    itemCode: '',
    itemName: '',
    uom: '',
  };

  visiblePopup: any = false;
  onHandleVisiblePopup() {
    this.loading.start();
    this.visiblePopup = true;
    this.loading.stop();
  }
  changeVisible(event: any) {
    this.visiblePopup = event;
  }

  checked = false;
  indeterminate = false;
  listOfCurrentPageData: readonly any[] = [];
  setOfCheckedId = new Set<any>();

  updateCheckedSet(id: any, checked: boolean): void {
    let arrTemp: any[] = [];
    // if (this.dataDarft.poCode !== undefined)
    arrTemp = JSON.parse(JSON.stringify(this.dataItem));
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
      arrTemp = arrTemp.filter((element: any) => element.itemCode != id);
    }
    this.setOfCheckedId.forEach((element) => {
      this.listItem.forEach((item) => {
        if (
          item.itemCode == element &&
          !arrTemp.find((ele: any) => ele.itemCode == element)
        ) {
          arrTemp.push({
            id: null,
            itemCode: item.itemCode,
            itemName: item.itemName,
            uom: item.unit,
            exchangeRate: 0,
            supplierQuantity: 0,
            openQuantity: 0,
            supplierUnitPrice: 0,
            discount: 0,
            amount: 0,
            tax: 0,
          });
        }
      });
    });
    this.dataItem = arrTemp;
  }

  onHandleClickRowProduct(data: any, checked: boolean) {
    data.checked = !checked;
    this.updateCheckedSet(data.itemCode, data.checked);
    this.refreshCheckedStatus();
  }

  onItemChecked(item: any, checked: boolean): void {
    this.updateCheckedSet(item.itemCode, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(value: boolean): void {
    if (value) {
      const dataSelect = this.listItem.map((item: any) => ({
        id: null,
        itemCode: item.itemCode,
        itemName: item.proName,
        uom: item.unit,
        exchangeRate: 0,
        supplierQuantity: 0,
        openQuantity: 0,
        supplierUnitPrice: 0,
        discount: 0,
        amount: 0,
        tax: 0,
      }))
      this.dataItem = [...this.dataItem, ...dataSelect]
      this.setOfCheckedId = new Set(this.listItem.map(item => item.itemCode));
    } else {
      this.dataItem = [];
      this.setOfCheckedId.clear()
    }
    this.refreshCheckedStatus();
  }

  onCurrentPageDataChange($event: readonly any[]): void {
    this.listOfCurrentPageData = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfCurrentPageData.every((item) =>
      this.setOfCheckedId.has(item.itemCode)
    );
    this.indeterminate =
      this.listOfCurrentPageData.some((item) =>
        this.setOfCheckedId.has(item.itemCode)
      ) && !this.checked;
  }

  dataDarft: any;

  async getDetail(poCode: any) {
    let resp = await this.poService.viewPO(poCode);
    this.tax = resp.data.purchaseOrderDTO.tax;
    this.discount = resp.data.purchaseOrderDTO.discount;
    this.dataInformation = resp.data.purchaseOrderDTO;
    this.dataInformation['status'] = 2;
    this.dataInformation['deliveryAt'] = new Date(
      resp.data.purchaseOrderDTO.deliveryAt
    );
    this.dataInformation['createdAt'] = new Date(
      resp.data.purchaseOrderDTO.createdAt
    );
    this.dataInformation['updatedAt'] = new Date(
      resp.data.purchaseOrderDTO.updatedAt
    );
    this.dataInformation['documentAt'] = new Date(
      resp.data.purchaseOrderDTO.documentAt
    );
    this.dataItem = resp.data.listItem;
    this.dataItem.forEach((element) => {
      element.amountInRow = this.onHandleConvertToString(element.amount);
      this.setOfCheckedId.add(element.itemCode);
    });
    this.calculateTotalAmount();
    this.calculateTotalOpenQuantity();
    this.calculateTotalSupplierQuantity();
    this.onHandleDiscountInput();
    this.onHandleTaxInput();
    this.dataInformation.poCode = poCode;
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
        keyTitle: 'menu.manage.po.item.openQuantity',
        keyName: 'openQuantity',
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
        keyTitle: 'menu.manage.po.item.tax',
        keyName: 'tax',
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
    this.transferService.currentMessage.subscribe((data: any) => {
      this.dataDarft = data;
    });
    if (this.dataDarft.poCode) {
      this.getDetail(this.dataDarft.poCode);
    } else {
      this.dataInformation = {
        prCode: '',
        source: 1,
        documentAt: new Date(),
        deliveryAt: new Date(),
        status: 2,
        exchangeRate: 0,
        note: '',
      };
      this.dataItem = [];
    }
    this.test(2, 3);
  }

  checkDuplicate: boolean = false;
  onHandleChangeSupplier(row: any) {
    const duplicateRecord = this.dataItem.find((record) => {
      return (
        record.productCode === row.productCode &&
        record.supplier === row.supplier &&
        record !== row
      );
    });

    if (duplicateRecord) {
      this.checkDuplicate = true;
      this.messageService.warning(
        `${row.productCode}, ${row.supplier} trùng lặp, vui lòng chọn lại`,
        ` Cảnh báo`
      );
      return;
    }
    this.checkDuplicate = false;
  }

  onHandlelotNumber(row: any) { }


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
    row.amount = this.onHandleCalculateAmountInRow(row);
    row.amountInRow = this.onHandleConvertToString(row.amount);

    row.openQuantity = row.supplierQuantity * row.exchangeRate;

    this.calculateTotalAmount();
    this.calculateTotalOpenQuantity();
    this.calculateTotalSupplierQuantity();
    this.onHandleDiscountInput();
    this.onHandleTaxInput();
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
    row.amount = this.onHandleCalculateAmountInRow(row);
    row.amountInRow = this.onHandleConvertToString(row.amount);
    row.openQuantity = row.supplierQuantity * row.exchangeRate;

    this.calculateTotalAmount();
    this.calculateTotalOpenQuantity();
    this.calculateTotalSupplierQuantity();
    this.onHandleDiscountInput();
    this.onHandleTaxInput();
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
    row.amount = this.onHandleCalculateAmountInRow(row);
    row.amountInRow = this.onHandleConvertToString(row.amount);

    this.calculateTotalAmount();
    this.calculateTotalOpenQuantity();
    this.calculateTotalSupplierQuantity();
    this.onHandleDiscountInput();
    this.onHandleTaxInput();
  }

  onHandleTax(row: any) {
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
    row.amount = this.onHandleCalculateAmountInRow(row);
    row.amountInRow = this.onHandleConvertToString(row.amount);
    this.calculateTotalAmount();
    this.calculateTotalOpenQuantity();
    this.calculateTotalSupplierQuantity();
    this.onHandleDiscountInput();
    this.onHandleTaxInput();
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
    row.amount = this.onHandleCalculateAmountInRow(row);
    row.amountInRow = this.onHandleConvertToString(row.amount);

    this.calculateTotalAmount();
    this.calculateTotalOpenQuantity();
    this.calculateTotalSupplierQuantity();
    this.onHandleDiscountInput();
    this.onHandleTaxInput();
  }

  totalAmount: number = 0;
  /** Thành tiền tổng*/
  calculateTotalAmount() {
    this.countAmount = this.dataItem.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    console.log(typeof this.countAmount, this.countAmount)
    this.totalAmount = this.onHandleConvertToString(this.countAmount);
  }
  /** Thành tiền trong hàng */
  onHandleCalculateAmountInRow(row: any) {
    return (
      ((100 - row.discount) / 100) *
      row.supplierQuantity * (row.supplierUnitPrice * this.dataInformation.exchangeRate) * (1 + row.tax / 100)
    );
  }
  /**Phương thức xử lý chức năng convert thành tiền -> string */
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

  calculateTotalSupplierQuantity() {
    this.countSupplierQuantity = this.dataItem.reduce(
      (sum, item) => sum + item.supplierQuantity,
      0
    );
  }

  calculateTotalOpenQuantity() {
    this.countOpenQuantity = this.dataItem.reduce(
      (sum, item) => sum + parseFloat(item.openQuantity),
      0
    );
  }

  deleteRecord(row: any) {
    this.countAmount -= row.amount;
    this.totalAmount = this.onHandleConvertToString(this.countAmount);
    this.countOpenQuantity -= row.openQuantity;
    this.countSupplierQuantity -= row.supplierQuantity;
    this.onHandleDiscountInput();
    this.setOfCheckedId.delete(row.productCode);
    return (this.dataItem = this.dataItem.filter(
      (obj) => obj.productCode !== row.productCode
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
        name: 'menu.manage.po.new',
        route: `/manage-info/manage-list-po/new`,
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
  id = -1;
  onResize({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.columns[i].width = width + 'px';
    });
  }
  // Tìm kiếm
  dataFilter: any = {};
  search() { }
  // Gửi duyệt
  dataInformation: any = {};
  async save() {

    if (!this.dataInformation.source) {
      this.messageService.warning('Bạn chưa chọn nguồn', 'Cảnh báo');
      return;
    }
    if (!this.dataInformation.deliveryAt) {
      this.messageService.warning('Bạn chưa chọn ngày giao hàng', 'Cảnh báo');
      return;
    }
    if (!this.dataInformation.status) {
      this.messageService.warning('Bạn chưa chọn trạng thái', 'Cảnh báo');
      return;
    }
    if (!this.dataInformation.currency) {
      this.messageService.warning('Bạn chưa chọn đơn vị tiền tệ', 'Cảnh báo');
      return;
    }
    if (!this.dataInformation.exchangeRate) {
      this.messageService.warning(
        'Bạn chưa nhập tỷ giá chuyển đổi',
        'Cảnh báo'
      );
      return;
    }
    let check = true;

    if (!this.checkDuplicate) {
      if (check) {
        let data = {
          purchaseOrderDTO: {
            id: this.dataInformation.id,
            poCode: this.dataInformation.poCode, //Mã PO - string
            source: this.dataInformation.source, //Nguồn - number (1: Trong nước; 2: Ngoài nước)
            status: this.dataInformation.status, //Trạng thái - number
            currency: this.dataInformation.currency, //Đơn vị tính - number
            lotNumber: this.dataInformation.lotNumber, //Đơn vị tính - number
            exchangeRate: this.dataInformation.exchangeRate, //Tỷ lệ quy đổi - number
            deliveryAt: this.dataInformation.deliveryAt, //Ngày giao hàng - date
            note: this.dataInformation.note, //Ghi chú - string
            documentAt: this.dataInformation.documentAt, //Ngày tài liệu - string
            prCode: this.dataInformation.prCode, //Mã PR - string
            shippingType: this.dataLogistics.transport, //Phương thức vận chuyển - number
            shipTo: this.dataLogistics.deliveryAddress, //Địa chỉ nhận hàng - number
            supplierAddress: this.dataLogistics.vendorAddress, //Địa chỉ NCC - number
            discount: this.discount, //Giảm giá - number
            tax: this.tax, //Thuế - number
            vendorCode: this.dataInformation.vendorCode
          },
          listItem: this.dataItem,
        };
        //console.log(this.dataItem);
        if (this.dataDarft.poCode) {
          let resp = await this.poService.putPO(data);
          if (resp.result.responseCode == '00') {
            this.messageService.success(`${resp.result.message}`, `Thành công`);
            this.router.navigate(['./manage-info/manage-list-po']);
          } else {
            this.messageService.error(`${resp.result.message}`, `Lỗi`);
          }
        } else {
          let resp = await this.poService.createPO(data);
          if (resp.result.responseCode == '00') {
            this.messageService.success(`${resp.result.message}`, `Thành công`);
            this.router.navigate(['./manage-info/manage-list-po']);
          } else {
            this.messageService.error(`${resp.result.message}`, `Lỗi`);
          }
        }
      } else {
        this.messageService.warning(`Bạn phải nhập đầy đủ dữ liệu`, `Cảnh báo`);
      }
    } else {
      this.messageService.warning(
        `Vui lòng kiểm tra lại dữ liệu, có dữ liệu trùng lặp`,
        `Cảnh báo`
      );
    }
  }
  // Kiểm tra phần tử cuối để loại bỏ chức năng resize
  lastObject(obj: any) {
    if (obj == this.columns[this.columns.length - 1]) {
      return false;
    } else {
      return true;
    }
  }
  // Lưu nháp
  async draft() {
    let data = {
      purchaseOrderDTO: {
        id: this.dataInformation.id,
        poCode: this.dataInformation.poCode, //Mã PO - string
        source: this.dataInformation.source, //Nguồn - number (1: Trong nước; 2: Ngoài nước)
        status: 0, //Trạng thái - number
        currency: this.dataInformation.currency, //Đơn vị tính - number
        lotNumber: this.dataInformation.lotNumber, //Đơn vị tính - number
        exchangeRate: this.dataInformation.exchangeRate, //Tỷ lệ quy đổi - number
        deliveryAt: moment(this.dataInformation.deliveryAt).format(
          'YYYY-MM-DD'
        ), //Ngày giao hàng - date
        note: this.dataInformation.note, //Ghi chú - string
        documentAt: moment(this.dataInformation.documentAt).format(
          'YYYY-MM-DD'
        ), //Ngày tài liệu - string
        prCode: this.dataInformation.prCode, //Mã PR - string
        shippingType: this.dataLogistics.transport, //Phương thức vận chuyển - number
        shipTo: this.dataLogistics.deliveryAddress, //Địa chỉ nhận hàng - number
        supplierAddress: this.dataLogistics.vendorAddress, //Địa chỉ NCC - number
        discount: this.discount, //Giảm giá - number
        tax: this.tax, //Thuế - number
      },
      listItem: this.dataItem,
    };

    console.log(this.dataItem);
    // if (this.dataDarft.poCode) {
    //   let resp = await this.poService.putPO(data);
    //   if (resp.result.responseCode == '00') {
    //     this.messageService.success(`${resp.result.message}`, `Thành công`);
    //     this.router.navigate(['./manage-info/manage-list-po']);
    //   } else {
    //     this.messageService.error(`${resp.result.message}`, `Lỗi`);
    //   }
    // } else {
    //   let resp = await this.poService.createPO(data);
    //   if (resp.result.responseCode == '00') {
    //     this.messageService.success(`Lưu nháp`, `Thành công`);
    //     this.router.navigate(['./manage-info/manage-list-po']);
    //   } else {
    //     this.messageService.error(`${resp.result.message}`, `Lỗi`);
    //   }
    // }
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
  clearFilter(keyName: any) {
    this.filterChildItems[keyName] = '';
  }

  index: number = 1;

  countDiscountConvertString: any = '';
  onHandleDiscountInput() {
    this.countDiscount = (this.countAmount * this.discount) / 100;
    this.countDiscountConvertString = this.onHandleConvertToString(
      this.countDiscount
    );
    this.onHandleTaxInput();
  }

  countTaxConvertString: any = '';
  countConvertString: any = '';
  onHandleTaxInput() {
    this.countTax = (this.countAmount * this.tax) / 100;
    this.count = this.countAmount - this.countDiscount + this.countTax;
    this.countTaxConvertString = this.onHandleConvertToString(this.countTax);
    this.countConvertString = this.onHandleConvertToString(this.count);
  }

  // Xử lý thêm đơn vị tiền tệ
  visibleAddCurrency: boolean = false;
  objCurrency: any = {
    paramCode: 'DVTT',
    paramValue: '',
    paramDesc: '',
    exchangeRate: '',
  };
  onClickCancel() {
    this.visibleAddCurrency = false;
  }
  async addCurrency() {
    this.visibleAddCurrency = true;
  }

  /**
   * Returns đây là mô tả.
   *
   * - x The number to raise.
   * @param  n The power, must be a natural number.
   * @return {number} x raised to the n-th power.
   */
  test(x: any, n: any) {
    return x * n;
  }

  async addNewCurrency() {
    if (
      this.objCurrency.paramValue.trim() == '' ||
      this.objCurrency.paramDesc.trim() == '' ||
      this.objCurrency.exchangeRate == 0
    ) {
      this.messageService.warning(`Bạn phải nhập đầy đủ dữ liệu`, `Cảnh báo`);
    } else {
      let data = {
        paramCode: 'DVTT',
        paramValue: this.objCurrency.paramValue.trim(),
        paramDesc: this.objCurrency.paramDesc.trim(),
        exchangeRate: this.objCurrency.exchangeRate,
      };
      let resp = await this.poCommonService.postCurrency(data);
      if (resp.result.responseCode == '00') {
        this.messageService.success(
          `Thêm đơn vị tiền tệ thành công`,
          `Thành công`
        );
        this.visibleAddCurrency = false;
        this.listCurrency = [];
        this.getCurrency();
      }
    }
  }
  // Xử lý popover nhà cung cấp
  showSupplier: boolean = false;
  dataPopoverSupplier: any;
  showPopoverSupplier(row: any) {
    if (!row.productCode) {
      this.messageService.warning(`Bạn chưa chọn mã hàng hóa`, `Cảnh báo`);
    } else {
      row.showPopover = true;
      this.showSupplier = true;
      this.dataPopoverSupplier = row;
    }
  }
  popoverVisibleChangeSupplier(event: any, row: any) {
    row.showPopover = event;
  }
  async chooseRowSupplier(row: any) {
    this.dataPopoverSupplier['showPopover'] = false;
    this.dataPopoverSupplier['supplier'] = row.vendorCode;
    // khai
    this.dataPopoverSupplier['supplierName'] = row.vendorName;
    this.dataPopoverSupplier['supplierUom'] = row.vendorUnit;
    let data = {
      vendorCode: row.vendorCode,
      itemCode: this.dataPopoverSupplier.itemCode,
    };
    let resp = await this.poService.fillUnitAndExchangeRate(data);
    if (resp.result.responseCode == '00') {
      // if (resp.data !== undefined) {
      //   this.dataPopoverSupplier['supplierUom'] = resp.data.paramValue
      //     ? resp.data.paramValue
      //     : '';
      // }
      if (resp.data !== undefined) {
        this.dataPopoverSupplier['exchangeRate'] = resp.data.exchangeRate
          ? resp.data.exchangeRate
          : '';
      }
    }
  }

  clear(keyName: any) {
    this.dataFilter[keyName] = '';
  }

  listVendor: any = [];

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
  // List select
  /**List select */
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
  listTax: any[] = [];
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
  // filter vendor
  dataFilterVendor: any = {};
  listOfRadioButton: string[] = ['button.detail', 'Logistics'];
}
