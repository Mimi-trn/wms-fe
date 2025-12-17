import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { PoCommonService } from 'src/app/services/manage-information/common/po-common.service';
import { ContractService } from 'src/app/services/manage-information/contract-service/contract.service';
import { PoService } from 'src/app/services/manage-information/list-po-service/po.service';
import { MessageService } from 'src/app/services/message.service';
import { TransferDataService } from 'src/app/services/transferData.service';

@Component({
  selector: 'app-create-contract',
  templateUrl: './create-contract.component.html',
  styleUrls: ['./create-contract.component.css'],
})
export class CreateContractComponent implements OnInit {
  constructor(
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    private loading: NgxUiLoaderService,
    private poCommonService: PoCommonService,
    private poService: PoService,
    private transferService: TransferDataService,
    private contractService: ContractService
  ) {
    this.listStatus = [
      {
        text: 'Mở',
        value: 2,
      },
    ];
    this.dataInformation['status'] = 2;
    // this.dataInformation['contractCreatedAt'] = new Date();
    this.dataInformation['note'] = '';
    this.dataInformation['consignmentContractCode'] = '';
  }
  ngOnInit() {
    // this.translateService
    //   .get('sidebar.information.child.listContract.child.create')
    //   .subscribe((text) => {
    //     this.title.setTitle(text);
    //   });
    this.setBreadcrumb();
    this.getListCustomer();
    this.getListItem();
    this.columns = [
      {
        keyTitle: 'sidebar.information.child.listContract.child.productCode',
        keyName: 'productCode',
        check: true,
        width: '200px',
      },
      {
        keyTitle: 'sidebar.information.child.listContract.child.productName',
        keyName: 'itemName',
        check: true,
        width: '200px',
      },
      {
        keyTitle:
          'sidebar.information.child.listContract.child.productDescription',
        keyName: 'description',
        check: true,
        width: '200px',
      },
      {
        keyTitle: 'sidebar.information.child.listContract.child.productUom',
        keyName: 'uom',
        check: true,
        width: '200px',
      },

      {
        keyTitle:
          'sidebar.information.child.listContract.child.quantityInContract',
        keyName: 'quantityInContract',
        check: true,
        width: '200px',
      },
    ];
  }
  setBreadcrumb() {
    this.breadcrumbs = [
      {
        name: 'menu.manage.information',
        route: ``,
      },
      {
        name: 'sidebar.information.child.listContract.name',
        route: `/manage-info/list-contract`,
      },
      {
        name: 'sidebar.information.child.listContract.child.create',
        route: `/manage-info/list-contract/new`,
      },
    ];
    this.isBreadcrumb = true;
  }

  showPopoverCustomer() {
    this.showCustomer = true;
  }

  popoverVisibleChangeSupplier(event: any) {
    this.showCustomer = event;
  }

  chooseCustomer(row: any) {
    this.showCustomer = false;
    this.dataInformation['customerCode'] = row.customerCode;
    this.dataInformation['customerName'] = row.customerName;
    this.dataInformation['address'] = row.address;
    this.dataInformation['customerPhone'] = row.customerPhone;
  }

  id = -1;
  onResize({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.columns[i].width = width + 'px';
    });
  }

  clear(keyName: any) {
    this.dataFilterProduct[keyName] = '';
  }

  calculateTotalOpenQuantity() {
    this.countOpenQuantity = this.dataItems.reduce(
      (sum, item) => sum + parseFloat(item.openQuantity),
      0
    );
  }

  calculateTotalQuantityInContract() {
    this.countQuantityInContract = this.dataItems.reduce(
      (sum, item) => sum + parseFloat(item.quantityInContract),
      0
    );
  }

  deleteRecord(row: any) {
    this.countOpenQuantity -= row.openQuantity;
    this.countQuantityInContract -= row.quantityInContract;
    this.setOfCheckedId.delete(row.productCode);
    return (this.dataItems = this.dataItems.filter(
      (obj) => obj.productCode !== row.productCode
    ));
  }

  onHandleQuantityInContract(row: any) {
    row.openQuantity = row.quantityInContract;
    this.calculateTotalQuantityInContract();
    this.calculateTotalOpenQuantity();
  }

  onHandleVisiblePopup() {
    this.visiblePopup = true;
  }

  changeVisible(event: any) {
    this.visiblePopup = event;
  }

  updateCheckedSet(id: any, checked: boolean): void {
    let arrTemp: any[] = [];
    // if (this.dataDarft.consignmentContractCode) {
    // }
    arrTemp = JSON.parse(JSON.stringify(this.dataItems));
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
      arrTemp = arrTemp.filter((element: any) => {
        return element.productCode != id;
      });
    }

    this.setOfCheckedId.forEach((element) => {
      this.listItem.forEach((item) => {
        if (
          item.productCode == element &&
          !arrTemp.find((ele: any) => {
            return ele.productCode == element;
          })
        ) {
          arrTemp.push({
            productCode: item.productCode,
            itemName: item.proName,
            description: item.proName,
            uom: item.unit,
            quantityInContract: 0,
          });
        }
      });
    });
    this.dataItems = arrTemp;
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

  close() {
    this.modalConfirmClose = true;
  }

  onHandleModalCancelClose(event: any) {
    this.modalConfirmClose = event;
  }

  async onHandleModalConfirmClose(event: any) {
    if (event) {
      this.router.navigate(['./manage-info/list-contract']);
    }
  }

  draft() {
    this.modalConfirmDraft = true;
  }

  save() {
    if (!this.dataInformation.contractCreatedAt) {
      this.messageService.warning('Bạn chưa chọn ngày tài liệu', `Cảnh báo`);
    } else if (
      this.dataInformation.status !== 0 &&
      this.dataInformation.status !== 1 &&
      this.dataInformation.status !== 2
    ) {
      this.messageService.warning('Bạn chưa chọn trạng thái', `Cảnh báo`);
    } else if (!this.dataInformation.customerCode) {
      this.messageService.warning('Bạn chưa chọn mã khách hàng', `Cảnh báo`);
    } else if (this.dataItems.length <= 0) {
      this.messageService.warning('Danh sách hàng hóa rỗng', `Cảnh báo`);
    } else {
      let check = true;
      this.dataItems.forEach((element) => {
        if (element.quantityInContract == 0) check = false;
      });

      if (check) {
        this.modalConfirmSave = true;
      } else {
        this.messageService.warning(
          'Số lượng theo hợp đồng phải lớn hơn 0',
          `Cảnh báo`
        );
      }
    }
  }

  onHandleModalCancelSave(event: any) {
    this.modalConfirmSave = event;
  }

  async onHandleModalConfirmSave(event: any) {
    if (event) {
      let data = {
        consignmentContractCode: this.dataInformation.consignmentContractCode,
        contractCreatedAt: this.dataInformation.contractCreatedAt,
        deliveryAt: this.dataInformation.deliveryAt,
        customerCode: this.dataInformation.customerCode,
        status: 2,
        note: this.dataInformation.note,
        itemList: this.dataItems,
      };

      let resp = await this.contractService.newContract(data);
      if (resp.result.responseCode == '00') {
        this.messageService.success(
          `Lưu hợp đồng ký gửi thành công`,
          `Thành công`
        );
        this.router.navigate(['./manage-info/list-contract']);
      } else {
        this.messageService.warning(
          `Đã có lỗi xảy ra trong quá trình xử lý, vui lòng thử lại`,
          ` Cảnh báo`
        );
      }
    }
  }

  onHandleModalCancelDraft(event: any) {
    this.modalConfirmDraft = event;
  }

  async onHandleModalConfirmDraft(event: any) {
    if (event) {
      let data = {
        consignmentContractCode: this.dataInformation.consignmentContractCode,
        contractCreatedAt: this.dataInformation.contractCreatedAt,
        deliveryAt: this.dataInformation.deliveryAt,
        customerCode: this.dataInformation.customerCode,
        status: 0,
        note: this.dataInformation.note,
        itemList: this.dataItems,
      };

      let resp = await this.contractService.newContract(data);
      if (resp.result.responseCode == '00') {
        this.messageService.success(
          `Lưu bản nháp hợp đồng ký gửi thành công`,
          `Thành công`
        );
        this.router.navigate(['./manage-info/list-contract']);
      } else {
        this.messageService.warning(
          `Đã có lỗi xảy ra trong quá trình xử lý, vui lòng thử lại`,
          ` Cảnh báo`
        );
      }
    }
  }

  async getListCustomer() {
    let data = {
      pageNumber: this.pageCustomer - 1,
      pageSize: this.perPageCustomer,
      filter: {
        customerCode: this.dataFilterCustomer.customerCode,
        customerName: this.dataFilterCustomer.customerName,
        customerPhone: this.dataFilterCustomer.customerPhone,
        address: this.dataFilterCustomer.address,
      },
    };
    let resp = await this.contractService.getListCustomer(data);
    if (resp.result.responseCode == '00') {
      this.listCustomer = resp.data;
      this.totalCustomer = resp.dataCount;
    } else {
      this.messageService.warning(
        `Lấy danh sách khách hàng thất bại`,
        `Cảnh báo`
      );
    }
  }

  paginationCustomer(event: any) {
    this.pageCustomer = event.page;
    this.perPageCustomer = event.size;
    this.getListCustomer();
  }

  filterSearchCustomer($event: any) {
    if ($event.keyCode == 13) {
      this.getListCustomer();
    } else if ($event.type == 'click') {
      this.getListCustomer();
    }
  }

  // Items
  async getListItem() {
    let data = {
      pageNumber: this.pageItem - 1,
      pageSize: this.perPageItem,
      sortProperty: 'createdAt',
      sortOrder: 'DESC',
      filter: {
        productCode: this.filterChildItems.productCode,
        proName: this.filterChildItems.proName,
        unit: this.filterChildItems.unit,
      },
    };
    let resp = await this.contractService.getItems(data);
    if (resp.result.responseCode == '00') {
      this.listItem = resp.data;
      this.totalItem = resp.dataCount;
    } else {
      this.messageService.warning(
        `Lấy danh sách hàng hóa thất bại`,
        `Cảnh báo`
      );
    }
  }

  paginationItem(event: any) {
    this.pageItem = event.page;
    this.perPageItem = event.size;
    this.getListItem();
  }

  filterSearchItem($event: any) {
    if ($event.keyCode == 13) {
      this.getListItem();
    } else if ($event.type == 'click') {
      this.getListItem();
    }
  }

  dataDarft: any;

  // Value
  isBreadcrumb: boolean = false;
  isHidden: boolean = true;
  breadcrumbs: Object[] = [];
  // Customer
  pageCustomer: any = 1;
  perPageCustomer: any = 10;
  totalCustomer: any = 0;
  // Items
  pageItem: any = 1;
  perPageItem: any = 10;
  totalItem: any = 0;
  // Datainformation
  dataInformation: any = {};
  listStatus: any[] = [];
  showCustomer: boolean = false;
  listCustomer: any[] = [];
  dataFilterCustomer: any = {
    customerCode: '',
    customerName: '',
    customerPhone: '',
    address: '',
  };
  columns: any[] = [];
  dataItems: any[] = [];
  dataFilterProduct: any = {};
  // Count
  countOpenQuantity: number = 0;
  countQuantityInContract: number = 0;
  // Checkbox
  checked = false;
  indeterminate = false;
  listOfCurrentPageData: readonly any[] = [];
  setOfCheckedId = new Set<any>();
  visiblePopup: boolean = false;
  listItem: any[] = [];
  filterChildItems: any = {
    productCode: '',
    proName: '',
    unit: '',
  };
  // Modal confirm
  modalConfirmClose: boolean = false;
  modalConfirmDraft: boolean = false;
  modalConfirmSave: boolean = false;
}
