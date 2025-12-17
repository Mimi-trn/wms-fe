import { HttpClient } from '@angular/common/http';
import { Component, IterableDiffers, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CheckRoleService } from 'src/app/services/checkRole.service';
import { ExportRequestService } from 'src/app/services/export-warehouse/exportRequestService.service';
import { GrnService } from 'src/app/services/import-warehouse/GRN/grn.service';
import { ReceiptCommonService } from 'src/app/services/import-warehouse/common/receipt-common.service';
import { PoCommonService } from 'src/app/services/manage-information/common/po-common.service';
import { ContractService } from 'src/app/services/manage-information/contract-service/contract.service';
import { MessageService } from 'src/app/services/message.service';
import { TransferDataService } from 'src/app/services/transferData.service';
import { environment } from 'src/environment/environment';
import { BarcodeItemService } from 'src/app/services/barcode-item/barcode-item.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-create-GRN',
  templateUrl: './create-GRN.component.html',
  styleUrls: ['./create-GRN.component.css'],
})
export class CreateGRNComponent implements OnInit {
  dataChild: any = '';
  constructor(
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    private loading: NgxUiLoaderService,
    private receiptCommonService: ReceiptCommonService,
    private grnService: GrnService,
    private checkRole: CheckRoleService,
    private transferData: TransferDataService,
    private http: HttpClient,
    private commonService: PoCommonService,
    private contractService: ContractService,
    private exportRequestService: ExportRequestService,
    private qrService: BarcodeItemService
  ) {
    this.getWarehouse();
    this.getImportRequest().then(() => {
      this.transferData.currentMessage.subscribe(
        (data) => (this.dataChild = data)
      );
      // Nhận dữ liệu từ màn lấy danh sách
      if (Object.keys(this.dataChild).length !== 0) {
        let data = this.findByImportRequestCode(this.dataChild);
        if (data) {
          this.chooseRow(data);
        }
      }
      // Nhân dữ liệu từ màn xem chi tiết
      let dataFromDetailImportRequest =
        this.transferData.getObjectFromImportRequest();
      if (Object.keys(dataFromDetailImportRequest).length !== 0) {
        this.fileList = dataFromDetailImportRequest.fileList;
        this.dataInformation = {
          ...dataFromDetailImportRequest.information,
          contractCreatedAt: new Date(
            dataFromDetailImportRequest.dataInformation.contractCreatedAt
          ),
          deliveryAt: new Date(
            dataFromDetailImportRequest.dataInformation.deliveryAt
          ),
        };
        this.chooseRow(dataFromDetailImportRequest.dataInformation);
      }
      this.receiptCommonService
        .getListReportFile(this.dataInformation.importRequestCode)
        .then((response) => {
          this.listFileReport = response.data;
        });
    });
    this.getTeamGroup();
    this.getEmployee();
    this.getUom();
    this.listStatus = [
      { text: 'Chờ duyệt', value: 1 },
      // { text: 'Đã duyệt', value: 2 },
      // { text: 'Từ chối', value: 3 },
    ];
    this.listItemType = [
      { text: 'Mới', value: 'Mới' },
      { text: 'Đặc biệt', value: 'Đặc biệt' },
      { text: 'Thông thường', value: 'Thông thường' },
      { text: 'NVL', value: 'NVL' },
      { text: 'LKDT', value: 'LKDT' },
    ];
  }

  findByImportRequestCode(importRequestCode: any): any {
    return this.dataImportRequestCode.find(
      (item) => item.importRequestCode === importRequestCode.code
    );
  }

  listUom: any[] = [];
  async getUom() {
    let resp = await this.commonService.getUnit();
    resp.data.forEach((element: any) => {
      this.listUom.push({
        text: element.paramValue,
        value: element.paramValue,
      });
    });
  }

  onFileChange(event: any) {
    this.fileList = event.target.files;
  }

  onHandleChangePoCode(event: any) {
    this.getListItem(event);
  }

  onHandleActualChange(event: any) {
    this.calculateTotalActualQuantity();
  }

  countActualQuantity: number = 0;
  calculateTotalActualQuantity() {
    this.countActualQuantity = this.dataItem.reduce(
      (sum, item) => sum + parseFloat(item.actualQuantity),
      0
    );
  }

  countRequestQuantity: number = 0;
  calculateTotalRequestQuantity() {
    this.countRequestQuantity = this.dataItem.reduce(
      (sum, item) => sum + item.requestQuantity,
      0
    );
  }

  countPoQuantity: number = 0;
  calculateTotalSupplierQuantity() {
    this.countPoQuantity = this.dataItem.reduce(
      (sum, item) => sum + item.requestQuantity,
      0
    );
  }

  dataImportRequestCode: any[] = [];
  totalImportRequest: any = 0;
  pageImportRequest: number = 1;
  perPageImportRequest: number = 10;

  async getImportRequest() {
    let data = {
      pageIndex: this.pageImportRequest - 1,
      pageSize: this.perPageImportRequest,
      filter: {
        importRequestCode: this.dataFilterImportRequest.code,
        importType: this.dataFilterImportRequest.importType,
        warehouseCode: this.dataFilterImportRequest.warehouseCode,
        poCode: this.dataFilterImportRequest.poCode,
        consignmentContractCode:
          this.dataFilterImportRequest.consignmentContractCode,
        shipper: this.dataFilterImportRequest.shipper,
        createdBy: this.dataFilterImportRequest.createdBy,
        status: 5,
        deliveryAt: new Date(this.dataFilterImportRequest.deliveryAt[0]),
        deliveryAt2: new Date(this.dataFilterImportRequest.deliveryAt[1]),
        updatedAt: new Date(this.dataFilterImportRequest.updatedAt[0]),
        updatedAt2: new Date(this.dataFilterImportRequest.updatedAt[1]),
      },
      common: '',
      sortProperty: 'updatedAt',
      sortOrder: 'DESC',
    };
    let resp = await this.receiptCommonService.getImportRequestCode(data);
    if (resp.result.responseCode == '00') {
      this.dataImportRequestCode = resp.data;
      this.totalImportRequest = resp.dataCount;
      resp.data.forEach((element: any) => {
        this.listImportRequestCode.push({
          text: element.code,
          value: element.code,
        });
      });
    } else {
      this.messageService.error(`${resp.result.message}`, `Lỗi`);
    }
  }

  async paginationImportRequest(event: any) {
    this.pageImportRequest = event.page;
    this.perPageImportRequest = event.size;
    this.getImportRequest();
  }

  async getListItem(poCode: any) {
    if (poCode) {
      let res = await this.grnService.getListItem(poCode, true);
      if (res.result.responseCode == '00') {
        this.dataItem = res.data.listItem.map((item: any) => ({
          ...item,
          listPackage: [],
        }));
        this.dataItem = this.dataItem.filter((item) => item?.openQuantity > 0);
        this.dataInformation.deliveryAt = new Date(
          res.data.purchaseOrderDTO.deliveryAt
        );
        this.calculateTotalSupplierQuantity();
        this.calculateTotalActualQuantity();
      } else {
        this.messageService.error(`${res.result.message}`, `Lỗi`);
      }
    } else {
      this.dataItem = [];
    }
    if (this.dataItem.length == 0) {
      this.messageService.warning(`Không có hàng hóa`, `Cảnh báo`);
    }
  }
  async getWarehouse() {
    let resp = await this.receiptCommonService.getWarehouse();
    if (resp.result.responseCode == '00') {
      resp.data.forEach((element: any) => {
        if (element.status == 1) {
          this.listWarehouse.push({
            text: element.warehouseName,
            value: element.warehouseCode,
          });
        }
      });
    } else {
      this.messageService.error(`${resp.result.message}`, `Lỗi`);
    }
  }

  ngOnInit() {
    this.loading.start();
    this.getLocation();
    // this.translateService.get('ui.receipt.GRN.create').subscribe((text) => {
    //   this.title.setTitle(text);
    // });
    this.setBreadcrumb();
    this.columns = [
      {
        keyTitle: 'ui.receitp.GRN.create.item_code',
        keyName: 'productCode',
        width: '140px',
        check: true,
      },
      {
        keyTitle: 'ui.receitp.GRN.create.item_name',
        keyName: 'itemName',
        width: '140px',
        check: true,
      },
      {
        keyTitle: 'ui.receipt.GRN.warehouse_code',
        keyName: 'warehouseCode',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'ui.receitp.GRN.create.unit',
        keyName: 'uom',
        width: '100px',
        check: true,
      },
      {
        keyTitle: 'Số lượng NCC',
        keyName: 'supplierQuantity',
        width: '150px',
        check: true,
      },
      {
        keyTitle: 'Tỷ số quy đổi',
        keyName: 'exchangeRate',
        width: '150px',
        check: true,
      },
      {
        keyTitle: 'ui.receitp.GRN.create.po_quantity',
        keyName: 'requestQuantity',
        width: '150px',
        check: true,
      },
      {
        keyTitle: 'manage.receipt.create.list.receiptQuantity',
        keyName: 'inventoryQuantity',
        width: '180px',
        check: true,
      },
      {
        keyTitle: 'Số lượng cần nhập',
        keyName: 'openQuantity',
        width: '180px',
        check: true,
      },
      {
        keyTitle: 'ui.receitp.GRN.create.actual_quantity',
        keyName: 'actualQuantity',
        width: '150px',
        check: true,
      },
    ];

    this.loading.stop();
  }

  // Hàm xử lý sự kiện breadscrumb
  setBreadcrumb() {
    this.breadcrumbs = [
      {
        name: 'menu.manage.receipt',
        route: ``,
      },
      {
        name: 'Tiến hành nhập kho',
        route: `/manage-warehouse-receipt/create-good-receipt-note`,
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

  async getContractDetail(contractCode: any) {
    let data = {
      pageIndex: 0,
      pageSize: 1,
      filter: {
        consignmentContractCode: contractCode,
      },
    };
    let resp = await this.contractService.getList(data);
    this.dataContract = resp.data[0];
  }
  dataContract: any = {};

  async chooseRow(row: any) {
    this.showPopover = false;
    this.dataItem = [];
    console.log('1', row);
    // == 1 ( Nhập kho mua hàng)
    if (row.importType == 1) {
      this.dataInformation.importRequestCode = row.importRequestCode;
      this.dataInformation.importType = row.importType;
      // this.dataInformation.warehouseCode = row.warehouseCode;
      this.dataInformation.poCode = row.poCode;
      this.dataInformation.note = row.note;
      this.dataInformation.customerName = row.customerName;
      this.dataInformation.productCode = row.productCode;
      this.dataInformation.productName = row.productName;
      this.dataInformation.soCode = row.soCode;
      this.dataInformation.importTypeId = row.importTypeId;
      this.dataInformation.importAt = new Date();
      this.dataInformation.shipper = row.shipper;
      this.dataInformation.vendorName = row.vendorName;
      if (row.deliveryAt) {
        this.dataInformation.deliveryAt = new Date(row.deliveryAt);
      }
      this.dataInformation.importRequestCode = row.importRequestCode;
      // if (row.poCode) {
      //   await this.getListItem(row.poCode);
      // }
      if (row.importRequestCode) {
        await this.getListItemsByImportRequest(row.importRequestCode);
      }
      this.receiptCommonService
        .getListFile(this.dataInformation.importRequestCode)
        .then((response) => {
          this.fileList = response.data;
        });
      this.listOfRadioButton = ['button.detail'];
    }
    // == 4 (Nhập kho hàng ký gửi)
    if (row.importType == 4) {
      this.dataInformation.importRequestCode = row.importRequestCode;
      this.dataInformation.importType = row.importType;
      this.dataInformation.vendorName = row.vendorName;
      // this.dataInformation.warehouseCode = row.warehouseCode;
      this.dataInformation.note = row.note;
      this.dataInformation.importAt = new Date();
      this.getContractDetail(row.consignmentContractCode).then(() => {
        this.dataInformation.consignmentContractCode =
          this.dataContract.consignmentContractCode;
        this.dataInformation.contractCreatedAt = new Date(
          this.dataContract.contractCreatedAt
        );
        this.dataInformation.customerCode = this.dataContract.customerCode;
        this.dataInformation.customerName = this.dataContract.customerName;
        this.dataInformation.address = this.dataContract.address;
        this.dataInformation.customerPhone = this.dataContract.customerPhone;
        this.dataInformation.importTypeId = row.importTypeId;
      });
      let resp = await this.grnService.getListItemWithWarehouseOther(
        row.importRequestCode
      );
      if (resp.data.listItem.length == 0) {
        this.messageService.warning(`Không có hàng hóa`, `Cảnh báo`);
      } else {
        this.dataItem = resp.data.listItem.map((item: any) => ({
          ...item,
          actualQuantity: item.requestQuantity,
          listPackage: [],
        }));
        this.dataItem = this.dataItem.filter((item) => item?.openQuantity > 0);
      }
    }
    // == 6 (Nhập kho khác)
    if (row.importType == 6) {
      this.dataInformation = {
        ...row,
        importRequestCode: row.importRequestCode,
        importType: row.importType,
        warehouseCode: row.warehouseCode,
        note: row.note,
        importAt: new Date(),
      };
      let resp = await this.grnService.getListItemWithWarehouseOther(
        row.importRequestCode
      );
      if (resp.data.listItem.length == 0) {
        this.messageService.warning(`Không có hàng hóa`, `Cảnh báo`);
      } else {
        this.dataItem = resp.data.listItem.map((item: any) => ({
          ...item,
          actualQuantity: item.requestQuantity,
          listPackage: [],
        }));
        this.dataItem = this.dataItem.filter((item) => item?.openQuantity > 0);
        // console.log(this.dataItem)
      }
    }
    //  == 2 (Nhập kho thành phẩm)
    if (row.importType == 2 || row.importType == 5) {
      this.dataInformation = {
        ...row,
        deliveryAt: row.deliveryAt ? new Date(row.deliveryAt) : '',
        startAt: row.startAt ? new Date(row.startAt) : '',
        endAt: row.endAt ? new Date(row.endAt) : '',
        importAt: new Date(),
      };

      this.onHandleFetchListWo();
      await this.getListItemsByImportRequest(
        this.dataInformation.importRequestCode
      );
      this.columns = [
        {
          keyTitle: 'ui.receitp.GRN.create.item_code',
          keyName: 'productCode',
          width: '140px',
          check: true,
        },
        {
          keyTitle: 'ui.receitp.GRN.create.item_name',
          keyName: 'itemName',
          width: '140px',
          check: true,
        },
        {
          keyTitle: 'sidebar.receipt.child.ProceedToReceipt.child.warehouse',
          keyName: 'warehouseCode',
          width: '200px',
          check: true,
        },
        {
          keyTitle: 'ui.receitp.GRN.create.unit',
          keyName: 'uom',
          width: '100px',
          check: true,
        },
        {
          keyTitle: 'ui.receitp.GRN.create.po_quantity',
          keyName: 'requestQuantity',
          width: '150px',
          check: true,
        },
        {
          keyTitle: 'manage.receipt.create.list.receiptQuantity', //So luong da nhap
          keyName: 'inventoryQuantity',
          width: '180px',
          check: true,
        },
        {
          keyTitle: 'Số lượng cần nhập',
          keyName: 'openQuantity',
          width: '180px',
          check: true,
        },
        {
          keyTitle: 'ui.receitp.GRN.create.actual_quantity',
          keyName: 'actualQuantity',
          width: '150px',
          check: true,
        },
      ];
    }

    if (row.importType == 3) {
      this.dataInformation = {
        ...row,
        startAt: row.startAt ? new Date(row.startAt) : '',
        endAt: row.endAt ? new Date(row.endAt) : '',
        importAt: new Date(),
      };
      await this.getListItemsByImportRequest(
        this.dataInformation.importRequestCode
      );
      this.columns = [
        {
          keyTitle: 'ui.receitp.GRN.create.item_code',
          keyName: 'productCode',
          width: '140px',
          check: true,
        },
        {
          keyTitle: 'ui.receitp.GRN.create.item_name',
          keyName: 'itemName',
          width: '140px',
          check: true,
        },
        {
          keyTitle: 'ui.receitp.GRN.create.unit',
          keyName: 'uom',
          width: '100px',
          check: true,
        },
        {
          keyTitle: 'ui.receitp.GRN.create.po_quantity',
          keyName: 'requestQuantity',
          width: '150px',
          check: true,
        },
        {
          keyTitle: 'manage.receipt.create.list.receiptQuantity',
          keyName: 'inventoryQuantity',
          width: '180px',
          check: true,
        },
        {
          keyTitle: 'Số lượng cần nhập',
          keyName: 'openQuantity',
          width: '180px',
          check: true,
        },
        {
          keyTitle: 'ui.receitp.GRN.create.actual_quantity',
          keyName: 'actualQuantity',
          width: '150px',
          check: true,
        },
      ];
    }
    this.receiptCommonService
      .getListReportFile(this.dataInformation.importRequestCode)
      .then((response) => {
        this.listFileReport = response.data;
      });
    this.calculateTotalActualQuantity();
    this.calculateTotalSupplierQuantity();
    this.dataItem.forEach((element: any) => {
      this.expandSet.add(element.id);
    });
  }

  disableFutureDates = (current: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return current > today;
  };

  async onHandleFetchListWo() {
    let dataRequest = {
      pageNumber: 0,
      pageSize: 0,
      filter: {
        workOrderParentId: -1,
        woCode: this.dataInformation.woCode,
      },
      common: '',
      sortProperty: 'updatedAt',
      sortOrder: 'DESC',
    };

    let res = await this.exportRequestService.getListWo(dataRequest);
    if (res) {
      if (res.result.responseCode == '00') {
        this.dataInformation.lotId = res.data.content[0].lotId
          ? res.data.content[0].lotId
          : '';
        this.dataInformation.lotNumber = res.data.content[0].lotNumber
          ? res.data.content[0].lotNumber
          : '';
        this.dataInformation.startDate = res.data.content[0].startDate
          ? new Date(res.data.content[0].startDate)
          : '';
        this.dataInformation.endDate = res.data.content[0].endDate
          ? new Date(res.data.content[0].endDate)
          : '';
        this.dataInformation.soCode = res.data.content[0].soCode || '';
        this.dataInformation.customerName =
          res.data.content[0].customerName || '';
      } else {
        this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
      }
    } else {
      this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
    }
  }

  async getListItemsByImportRequest(code: any) {
    this.loading.start();
    let res = await this.grnService.getListItemWithWarehouseOther(code);
    if (res) {
      this.loading.stop();
      if (res.result.responseCode == '00') {
        this.loading.stop();
        this.dataItem = res.data.listItem.map((item: any) => ({
          ...item,
          actualQuantity: item.requestQuantity,
          listPackage: [],
        }));
        this.dataItem = this.dataItem.filter((item) => item?.openQuantity > 0);
      } else {
        this.loading.stop();
        this.messageService.error(
          ` Có lỗi xảy ra, vui lòng thử lại`,
          ` Cảnh báo`
        );
      }
    } else {
      this.loading.stop();
      this.messageService.error(
        ` Có lỗi xảy ra, vui lòng thử lại`,
        ` Cảnh báo`
      );
    }
    this.calculateTotalRequestQuantity();
  }

  // Tìm kiếm
  dataFilter: any = {};
  dataFilterImportRequest: any = {
    deliveryAt: [],
    updatedAt: [],
  };

  enterSearch($event: any) {
    if ($event.keyCode == 13) {
      this.getImportRequest();
    }
  }

  search() {
    this.getImportRequest();
  }
  // Gửi duyệt
  dataInformation: any = {};
  titleCreateGrn = 'Bạn có chắc chắn muốn tạo phiếu nhập kho';
  async save() {
    try {
      if (!this.dataInformation.importRequestCode) {
        this.messageService.warning(
          `Bạn phải chọn mã yêu cầu nhập kho`,
          `Cảnh báo`
        );
        return;
      } else {
        if (this.dataItem.length == 0) {
          this.messageService.warning(`Không có hàng hóa`, `Cảnh báo`);
          return;
        } else {
          let check = false;
          let checkActual = false;

          for (const element of this.dataItem) {
            if (element?.listPackage && element?.listPackage?.length > 0) {
              check = true;
              if (!element.actualQuantity || element.actualQuantity <= 0) {
                this.messageService.warning(
                  `Số lượng thực nhập phải lớn hơn 0`,
                  `Cảnh báo`
                );
                return;
              }
              if (element.openQuantity < element.actualQuantity) {
                checkActual = true;
              }
              for (let chill of element?.listPackage) {
                if (!chill.locationCode) {
                  this.messageService.warning(
                    `Vui lòng chọn vị trí`,
                    `Cảnh báo`
                  );
                  return;
                }
              }
            }
          }
          if (check) {
            if (checkActual) {
              this.titleCreateGrn =
                'Số lượng thực nhập đang lớn hơn số lượng cần nhập. Bạn có chắc chắn muốn tạo phiếu nhập kho';
            } else {
              this.titleCreateGrn = 'Bạn có chắc chắn muốn tạo phiếu nhập kho';
            }
            this.modalConfirmSave = true;
          } else {
            this.messageService.warning(
              `Vui lòng thêm vị trí cho ít nhất một hàng hóa`,
              `Cảnh báo`
            );
          }
        }
      }
    } catch (error) {
      this.messageService.error(`Có lỗi xảy ra, ui lòng thử lại`, `Lỗi`);
    } finally {
      this.loading.stop();
    }
  }

  async createGrn() {
    try {
      this.loading.start();
      let data = {
        grnDTO: {
          importType: this.dataInformation.importType,
          // warehouseCode: this.dataInformation.warehouseCode,
          status: 1,
          importRequestCode: this.dataInformation.importRequestCode,
          poCode: this.dataInformation.poCode,
          shipper: this.dataInformation.shipper,
          deliveryAt: this.dataInformation.deliveryAt,
          importAt: this.dataInformation.importAt,
          note: this.dataInformation.note,
          approverCode: this.dataApprovedBy.approverCode,
          approverName: this.dataApprovedBy.approverName,
          woCode: this.dataInformation.woCode,
          consignmentContractCode: this.dataInformation.consignmentContractCode,
          importTypeId: this.dataInformation.importTypeId,
          vendorName: this.dataInformation.vendorName,
          productCode: this.dataInformation.productCode,
          productName: this.dataInformation.productName,
        },
        listItem: this.dataItem,
      };
      let formData: FormData = new FormData();
      formData.append(
        'textData',
        new Blob([JSON.stringify(data)], {
          type: 'application/json',
        })
      );

      for (let file of this.listFile) {
        formData.append('fileData', file);
      }
      let resp = await this.grnService.postGrn(formData);
      if (resp.result.responseCode == '00') {
        this.loading.stop();
        // this.showApprovedBy = false;
        this.messageService.success(`${resp.result.message}`, `Thành công`);
        this.router.navigate(['./manage-warehouse-receipt/good-receipt-note']);
      }
      else {
        this.loading.stop();
        this.messageService.error(`${resp.result.message}`, `Lỗi`);
      }
    } catch (error: any) {
      if (error.status === 400) {
        let errBody = error.error;
        this.messageService.warning(
          errBody?.result?.message || 'Bad Request',
          'Cảnh báo'
        );
      } else {
        this.messageService.error('Có lỗi xảy ra, vui lòng thử lại sau', 'Lỗi');
      }
    } finally {
      this.loading.stop();
    }
  }

  async onHandleSave() {
    if (this.dataApprovedBy.approverCode) {
      let data = {
        grnDTO: {
          importType: this.dataInformation.importType,
          // warehouseCode: this.dataInformation.warehouseCode,
          status: 1,
          importRequestCode: this.dataInformation.importRequestCode,
          poCode: this.dataInformation.poCode,
          shipper: this.dataInformation.shipper,
          deliveryAt: this.dataInformation.deliveryAt,
          note: this.dataInformation.note,
          approverCode: this.dataApprovedBy.approverCode,
          approverName: this.dataApprovedBy.approverName,
          woCode: this.dataInformation.woCode,
          consignmentContractCode: this.dataInformation.consignmentContractCode,
          vendorName: this.dataInformation.vendorName,
        },
        listItem: this.dataItem,
      };
      let resp = await this.grnService.postGrn(data);
      if (resp.result.responseCode == '00') {
        this.showApprovedBy = false;
        this.messageService.success(`${resp.result.message}`, `Thành công`);
        this.router.navigate(['./manage-warehouse-receipt/good-receipt-note']);
      } else {
        this.messageService.error(`${resp.result.message}`, `Lỗi`);
      }
    } else {
      this.messageService.warning(
        'Bạn chưa chọn người duyệt phiếu',
        `Cảnh báo`
      );
    }
  }

  async drag() {
    let data = {
      grnDTO: {
        importType: this.dataInformation.importType,
        // warehouseCode: this.dataInformation.warehouseCode,
        status: 0,
        importRequestCode: this.dataInformation.importRequestCode,
        poCode: this.dataInformation.poCode,
        deliveryAt: this.dataInformation.deliveryAt,
        shipper: this.dataInformation.shipper,
        note: this.dataInformation.note,
        woCode: this.dataInformation.woCode,
        consignmentContractCode: this.dataInformation.consignmentContractCode,
        vendorName: this.dataInformation.vendorName,
      },
      listItem: this.dataItem,
    };
    console.log(data);

    let resp = await this.grnService.saveDraft(data);
    if (resp.result.responseCode == '00') {
      this.messageService.success(`Tạo bản nháp thành công`, `Thành công`);
      this.router.navigate(['./manage-warehouse-receipt/good-receipt-note']);
    } else {
      this.messageService.error(`${resp.result.message}`, `Lỗi`);
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
  // Hủy bỏ
  close() {
    this.modalConfirmClose = true;
  }

  onHandleModalCancelClose(event: any) {
    this.modalConfirmClose = event;
  }

  async onHandleModalConfirmClose(event: any) {
    if (event) {
      this.router.navigate(['./manage-warehouse-receipt/good-receipt-note']);
    }
  }
  // Thay đổi lựa chọn hiển thị danh sách hàng hóa
  listOfRadioButton: string[] = [
    'button.detail'
  ];

  changeSelect(event: any) {
    this.choose = event;
  }

  downloadFile(file: any) {
    this.http
      .post(environment.api_end_point + `/api/file/download/${file.id}`, '', {
        observe: 'response',
        responseType: 'blob',
      })
      .subscribe((response) => {
        let a = document.createElement('a');
        a.download = file.fileName;
        a.href = window.URL.createObjectURL(response.body as Blob);
        a.click();
      });
  }

  showPopover: boolean = false;
  showPopoverSupplier() {
    this.showPopover = true;
  }
  popoverVisibleChangeSupplier(event: any) {
    this.showPopover = event;
  }

  // Value
  isBreadcrumb: boolean = false;
  isHidden: boolean = true;
  breadcrumbs: Object[] = [];
  // File
  fileList: any = [];
  // Column
  columns: any[] = [];
  // Filter
  listItemType: any[] = [];
  // List data item
  dataItem: any[] = [];
  // List select
  listImportType: any[] = [
    {
      value: 1,
      text: 'Nhập kho mua hàng',
    },
    {
      value: 2,
      text: 'Nhập kho thành phẩm',
    },
    // {
    //   value: 3,
    //   text: 'Nhập kho NVL dư thừa',
    // },
    // {
    //   value: 4,
    //   text: 'Nhập kho hàng ký gửi',
    // },
    {
      value: 5,
      text: 'Nhập kho hàng lỗi',
    },
    {
      value: 6,
      text: 'Nhập kho khác',
    },
  ];
  listWarehouse: any[] = [];
  listStatus: any[] = [];
  listImportRequestCode: any[] = [];
  listPOCode: any[] = [];
  // Button radio
  choose: number = 0;

  // Thêm người duyệt
  showApprovedBy: boolean = false;
  isVisibleCancel: boolean = false;
  showEmployee: boolean = false;
  listEmployee: any[] = [];
  listTeamGroup: any[] = [];
  dataApprovedBy: any = {
    approverCode: '',
    approverName: '',
  };
  dataFilterEmployee: any = {};
  onClickCancel() {
    this.isVisibleCancel = true;
  }

  onHandleCancelPopup(event: any) {
    this.isVisibleCancel = event;
  }

  onHandleConfirmPopup(event: any) {
    this.showApprovedBy = event;
  }

  showPopoverEmployee() {
    this.showEmployee = true;
  }
  popoverVisibleChangeEmployee(event: any) {
    this.showEmployee = event;
  }
  chooseEmployee(row: any) {
    this.dataApprovedBy.approverCode = row.employeeCode;
    this.dataApprovedBy.approverName = row.employeeName;
    this.showEmployee = false;
  }
  async getEmployee() {
    let res = await this.receiptCommonService.getListApprovedBy();
    this.listEmployee = res.data;
  }

  async getTeamGroup() {
    let res = await this.receiptCommonService.getTeamGroup();
    if (res.result.responseCode == '00') {
      res.data.forEach((element: any) => {
        this.listTeamGroup.push({
          text: element.teamGroupName,
          value: element.teamGroupId,
        });
      });
    }
  }

  // Đính kèm
  dataFile: any[] = [];

  filterFile: any = {};

  downFileTag(row: any) { }

  rangeDateFile() { }

  checked = false;
  indeterminate = false;
  listOfCurrentPageData: readonly any[] = [];
  listOfData: readonly any[] = [];
  setOfCheckedId = new Set<number>();
  columnFile: any[] = [
    {
      keyTitle: 'Tệp đính kèm',
      keyName: 'file',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'Người gửi',
      keyName: 'sendBy',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'Ngày gửi',
      keyName: 'sendAt',
      width: '200px',
      check: true,
    },
  ];

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(value: boolean): void {
    this.listOfCurrentPageData.forEach((item) =>
      this.updateCheckedSet(item.productCode, value)
    );
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
  // Hàm xử lý sự kiện onResize
  onResizeFile({ width }: NzResizeEvent, col: any): void {
    this.columnFile = this.columnFile.map((e) =>
      e.keyTitle === col.keyTitle ? { ...e, width: `${width}px` } : e
    );
  }

  ngOnDestroy(): void {
    this.transferData.changeMessage({});
  }
  expandSet = new Set<number>();
  isExpand: boolean = false;

  onClickIcon(element: any) {
    if (this.expandSet.has(element.id)) {
      this.expandSet.delete(element.id);
    } else {
      this.expandSet.add(element.id);
    }
  }

  showUploadFile: boolean = false;
  onClickAddNew() {
    this.showUploadFile = true;
  }

  cancelUploadFile() {
    this.showUploadFile = false;
  }

  listFile: any[] = [];
  @ViewChild('fileInput') fileInput: any;
  uploadedFiles: File[] = [];

  onFileChangeShowUpload(event: any) {
    event.preventDefault();
    const selectedFiles: File[] = Array.from(event.target.files);
    this.handleFileSelection(selectedFiles);
  }

  handleFileSelection(selectedFiles: File[]) {
    for (const file of selectedFiles) {
      if (this.isFileExist(file.name)) {
        this.messageService.warning(
          `File ${file.name} đã tồn tại trong danh sách`,
          ` Thông báo`
        );
      } else {
        this.uploadedFiles.push(file);
        this.listFile = [...this.uploadedFiles];
        this.showUploadFile = false;
        console.log(this.listFile);
      }
    }
  }

  isFileExist(fileName: string): boolean {
    return this.uploadedFiles.some((file) => file.name === fileName);
  }

  deleteFile(row: any) {
    const index = this.listFile.findIndex((file) => file.name === row.name);
    if (index !== -1) {
      this.uploadedFiles.splice(index, 1);
      this.messageService.success(`Đã xóa ${row.name} khỏi danh sách`, ``);
    }
    this.listFile = this.listFile.filter((item) => item.name !== row.name);
  }
  listFileReport: any[] = [];
  // Modal confirm
  modalConfirmClose: boolean = false;
  modalConfirmDraft: boolean = false;
  modalConfirmSave: boolean = false;

  // giá trị ẩn hiện popup import file
  isVisibleUploadFile: boolean = false;

  onHandleOpenImportFile() {
    this.isVisibleUploadFile = true;
  }

  onHandleCloseImportFile() {
    this.isVisibleUploadFile = false;
  }
  // Hàm lấy danh sách vị trí
  listLocationFromBE: any[] = [];
  async getLocation() {
    let data = {
      pageIndex: 0,
      pageSize: 0,
      filter: {
        locationCode: '',
        locationName: '',
        locationWarehouseCode: '',
        locationWarehouseName: '',
      },
      common: '',
      sortProperty: '',
      sortOrder: '',
    };
    let resp = await this.qrService.getSmallLocation(data);
    if (resp.result.responseCode == '00') {
      this.listLocationFromBE = resp.data;
    } else {
      this.messageService.error(`${resp.result.message}`, ` Lỗi`);
    }
  }

  /** Tải template */
  downloadTemplateFile() {
    let link = document.createElement('a');
    link.download = 'Template_DS_QR_Code';
    link.href = '../../../../../assets/templateFile/Template_DS_QR_Code.xlsx';
    link.click();
  }

  // Định nghĩa kiểu cho merged cells (vùng ô gộp)
  checkMergedCells(ws: XLSX.WorkSheet, row: number, col: number): number {
    if (!ws['!merges']) return 1; // Nếu không có ô gộp, trả về 0
    // Duyệt qua tất cả các ô gộp
    for (const merge of ws['!merges']) {
      const { s, e } = merge; // Lấy thông tin bắt đầu (s) và kết thúc (e)

      // Kiểm tra nếu ô được kiểm tra nằm trong vùng ô gộp
      if (s.r <= row && row <= e.r && s.c === col) {
        return e.r - s.r + 1; // Tính số hàng gộp
      }
    }
    return 1; // Nếu không tìm thấy ô gộp
  }
  readExcelFile(file: File) {
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      // Chọn sheet đầu tiên trong file
      const sheetName: string = workbook.SheetNames[0];
      const worksheet: XLSX.WorkSheet = workbook.Sheets[sheetName];
      // Chuyển đổi sheet thành mảng hai chiều
      const arrDataFromExcel: Array<Array<any>> = XLSX.utils.sheet_to_json(
        worksheet,
        { header: 1, raw: false }
      );
      const rowCount = arrDataFromExcel.length;
      const colCount = arrDataFromExcel[0].length;
      const colListProduct = 1; // Số cột của phần dữ liệu hàng hóa
      const colListQR = 1; // Số cột của phần QR code
      let successfulRecord = 0;
      let resultArray: any[][] = [];
      // Duyệt qua từng hàng
      for (let row = 1; row < rowCount; row++) {
        const listProduct: Array<string | null> = [];
        const listQR: any[][] = [];
        // Kiểm tra số hàng gộp cho phần hàng hóa
        const mergeCellsProduct = this.checkMergedCells(worksheet, row, 0);
        // Lấy dữ liệu hàng hóa từ cột 0 đến colListProduct
        for (let col = 0; col < colListProduct; col++) {
          const cellValue = arrDataFromExcel[row][col];
          listProduct.push(cellValue === undefined ? null : cellValue);
        }
        // Xử lý phần dữ liệu QR và kho hàng
        for (let mergeCell = 0; mergeCell < mergeCellsProduct; mergeCell++) {
          const listQrItem: any[] = [];
          const listWarehouse: any[] = [];
          // Kiểm tra số hàng gộp cho phần QR code
          const qrMergeCells = this.checkMergedCells(
            worksheet,
            row + mergeCell,
            colListProduct
          );
          // Lấy dữ liệu QR từ cột colListProduct đến colListProduct + colListQR
          for (
            let col = colListProduct;
            col < colListProduct + colListQR;
            col++
          ) {
            const cellValue = arrDataFromExcel[row + mergeCell][col];
            listQrItem.push(cellValue === undefined ? null : cellValue);
          }

          // Xử lý phần kho hàng từ cột colListProduct + colListQR đến hết
          for (let qrMergeCell = 0; qrMergeCell < qrMergeCells; qrMergeCell++) {
            const listWarehouseItem: any[] = [];
            for (let col = colListProduct + colListQR; col < colCount; col++) {
              const cellValue =
                arrDataFromExcel[row + mergeCell + qrMergeCell][col];
              listWarehouseItem.push(
                cellValue === undefined ? null : cellValue
              );
            }
            listWarehouse.push(listWarehouseItem);
          }
          listQR.push([listQrItem, listWarehouse]);
          // Bỏ qua các hàng đã gộp cho QR
          mergeCell += qrMergeCells - 1;
        }
        resultArray.push([listProduct, listQR]);
        // Bỏ qua các hàng đã gộp cho phần sản phẩm
        row += mergeCellsProduct - 1;
      }
      if (this.dataItem.length > 0) {
        // Duyệt qua từng hàng hóa
        for (let i = 0; i < resultArray.length; i++) {
          let elementFind: any = undefined;
          elementFind = this.dataItem.find(
            (element: any) => element.productCode === resultArray[i][0][0]
          );
          if (elementFind) {
            successfulRecord++; // số hàng hóa hợp lệ
            elementFind.listPackage = []; // xóa danh sách vị trí cũ
            let idListPackage = 100000;
            // Duyệt qua từng qr code hàng hóa của ds hàng hóa
            for (let index = 0; index < resultArray[i][1].length; index++) {
              let listLocationPackage: any[] = []; // danh sách vị trí hàng hóa
              let idListLocationPackage = 100000;
              let packageQuantity = 0;
              // Duyệt qua từng vị trí của qr code hàng hóa
              let isWrongLocation = false; // Biến kiểm tra vị trí không hợp lệ
              for (
                let j = 0;
                j < resultArray[i][1][index][1].length &&
                isWrongLocation == false;
                j++
              ) {
                if (
                  resultArray[i][1][index][1][j][0] !== null &&
                  resultArray[i][1][index][1][j][1] !== null
                ) {
                  let objToPush: any = undefined;
                  objToPush = this.listLocationFromBE.find(
                    (obj: any) =>
                      obj.locationCode === resultArray[i][1][index][1][j][0]
                  );
                  if (objToPush) {
                    objToPush = {
                      ...objToPush,
                      id: idListLocationPackage++,
                      idLocationPackage: idListLocationPackage++,
                      packageQuantity: resultArray[i][1][index][1][j][1],
                    };
                    packageQuantity += Number(
                      resultArray[i][1][index][1][j][1]
                    );
                    listLocationPackage.push(objToPush);
                  } else {
                    isWrongLocation = true;
                  }
                }
              }
              let objToPush = {};
              objToPush = {
                id: idListPackage++,
                idPackage: idListPackage++,
                itemQuantity: resultArray[i][1][index][0][0],
                packageQuantity: packageQuantity,
                status: listLocationPackage.length > 0 ? 2 : 1,
                // status: 1,
                totalItem: resultArray[i][1][index][0][0] * packageQuantity,
                valid: true,
                listLocationPackage: listLocationPackage,
              };
              if (isWrongLocation) {
                objToPush = {
                  ...objToPush,
                  status: 1,
                  // listLocationPackage: [],
                };
              }
              elementFind.listPackage.push(objToPush);
            }
          }
        }
      }
      if (successfulRecord == resultArray.length) {
        this.messageService.success(
          '',
          `Có ${successfulRecord} / ${resultArray.length} hàng hóa hợp lệ`
        );
      } else {
        this.messageService.error(
          '',
          `Có ${successfulRecord} / ${resultArray.length} hàng hóa hợp lệ`
        );
      }
    };
    reader.readAsArrayBuffer(file);
  }

  onHandleImportFile(event: any) {
    try {
      const files: File[] = event;
      if (files[0]) {
        this.readExcelFile(files[0]);
      }
    } catch (error) {
      this.messageService.error('Import file thất bại', 'Thất bại');
    }
  }
}
