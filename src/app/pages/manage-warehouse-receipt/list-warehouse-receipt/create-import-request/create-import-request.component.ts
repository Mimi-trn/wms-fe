import { HttpClient } from '@angular/common/http';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CheckRoleService } from 'src/app/services/checkRole.service';
import { ExportRequestService } from 'src/app/services/export-warehouse/exportRequestService.service';
import { ReceiptCommonService } from 'src/app/services/import-warehouse/common/receipt-common.service';
import { ImportRequestService } from 'src/app/services/import-warehouse/import-request/import-request.service';
import { PoCommonService } from 'src/app/services/manage-information/common/po-common.service';
import { ContractService } from 'src/app/services/manage-information/contract-service/contract.service';
import { SoService } from 'src/app/services/manage-information/so/so.service';
import { MessageService } from 'src/app/services/message.service';
import { RequestIqcService } from 'src/app/services/request-iqc/request-iqc.service';
import { TransferDataService } from 'src/app/services/transferData.service';
import { environment } from 'src/environment/environment';
import * as XLSX from 'xlsx';
type AOA = any[][];

@Component({
  selector: 'app-create-import-request',
  templateUrl: './create-import-request.component.html',
  styleUrls: ['./create-import-request.component.css'],
})
export class CreateImportRequestComponent implements OnInit {
  constructor(
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    private loading: NgxUiLoaderService,
    private receiptCommonService: ReceiptCommonService,
    private importRequestService: ImportRequestService,
    private transferData: TransferDataService,
    private requestIqcService: RequestIqcService,
    private checkRole: CheckRoleService,
    private soService: SoService,
    private exportRequestService: ExportRequestService,
    private contractService: ContractService
  ) {
    // Lấy danh sách loại nhập kho
    this.receiptCommonService.getImportType().then((response) => {
      this.listImportType = response.data.filter(
        (item: any) => item.importTypeId == 6 || item.importTypeId == 2
      );
    });
    // Lấy danh sách đơn hàng
    this.soService
      .listSO({
        pageIndex: 0,
        pageSize: 0,
        filter: { wh_status: 0 },
        common: '',
        sortProperty: '',
        sortOrder: '',
      })
      .then((response) => {
        this.listSO = response.data;
      });

    // Lấy danh sách họp đồng ký gửi
    if (
      this.checkIsRole('wms_consignment-contract_view') ||
      this.checkIsRole('FCIM_ADMIN')
    ) {
      this.receiptCommonService
        .getAllContract({
          pageIndex: 0,
          pageSize: 10,
          common: '',
          sortProperty: 'createdAt',
          sortOrder: 'descend',
          filter: {
            status: 2,
            iqcCreated: false,
          },
        })
        .then((response) => {
          this.listContract = response.data;
          this.totalContractTable = response.dataCount;
        });
    }

    // Lấy danh sách kho
    this.receiptCommonService.getWarehouse().then((response) => {
      this.listWarehouse = response.data.filter((warehouse: any) => {
        return warehouse.status == 1;
      });
    });
    // Lấy danh sách đơn vị tính (uom)
    this.requestIqcService.getListUom().then((response) => {
      this.listUom = response.data;
    });
    if (this.transferData.currentMessage) {
      this.transferData.currentMessage.subscribe((data: any) => {
        this.dataChild = data;
      });
      if (Object.keys(this.dataChild).length != 0) {
        this.importRequest = this.dataChild.importRequest;
        this.dataItem = this.dataChild.listItem;
        this.importTypeSelected = this.importRequest.importType;

        if (this.importRequest.importType == 1) {
          this.receiptCommonService.getPoCode().then((response) => {
            this.deliveryAt = response.data.find(
              (e: any) => e.poCode === this.importRequest.poCode
            ).deliveryAt;
          });
        }
      }
    }
  }

  // Danh sách breadcrumbs
  breadcrumbs: any = [
    {
      name: 'menu.manage.receipt',
      route: ``,
    },
    {
      name: 'manageWarehouse.requestIqc.importRequest',
      route: `/manage-warehouse-receipt/required-receipt-warehouse/create`,
    },
  ];
  // Danh sách file đã được upload lên (chỉ để hiển thị)
  fileList: any = [];
  // Danh sách file mới được upload lên (để gửi theo yêu cầu IQC)
  newFileList: File[] = [];
  // Các cột của bảng danh sách hàng hóa
  itemTableColumn: any[] = [
    {
      keyTitle: 'ui.receitp.GRN.create.item_code',
      keyName: 'productCode',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'ui.receitp.GRN.create.item_name',
      keyName: 'itemName',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'ui.receipt.GRN.warehouse_code',
      keyName: 'warehouseCode',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'ui.receitp.GRN.create.supplier',
      keyName: 'supplier',
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
      keyTitle: 'createIqc.tableItem.requestQuantity',
      keyName: 'requestQuantity',
      width: '200px',
      check: true,
    },
  ];
  // Các cột của bảng danh sách hàng hóa ký gửi
  contractTableColumn: any = [
    {
      keyTitle: 'createIqc.tableListContract.contactCode',
      keyName: 'consignmentContractCode',
      width: '200px',
      isSort: false,
    },
    {
      keyTitle: 'createIqc.tableListContract.documentDate',
      keyName: 'contractCreatedAt',
      isSort: false,
    },
    {
      keyTitle: 'createIqc.tableListContract.customerCode',
      keyName: 'customerCode',
      isSort: false,
    },
    {
      keyTitle: 'createIqc.tableListContract.customerName',
      keyName: 'customerName',
      isSort: false,
    },
    {
      keyTitle: 'createIqc.tableListContract.updatedAt',
      keyName: 'updatedAt',
      isSort: false,
    },
    {
      keyTitle: 'createIqc.tableListContract.createdBy',
      keyName: 'createdBy',
      isSort: false,
    },
  ];
  // Các cột của bảng danh sách po
  poTableColumn: any = [
    {
      keyTitle: 'createIqc.tableListPo.poCode',
      keyName: 'poCode',
      width: '200px',
      isSort: false,
    },
    {
      keyTitle: 'createIqc.tableListPo.source',
      keyName: 'source',
      isSort: false,
    },
    {
      keyTitle: 'createIqc.tableListPo.deliveryAt',
      keyName: 'deliveryAt',
      width: '240px',
      isSort: false,
    },
    {
      keyTitle: 'createIqc.tableListPo.documentAt',
      keyName: 'documentAt',
      width: '240px',
      isSort: false,
    },
    {
      keyTitle: 'createIqc.tableListPo.updatedAt',
      keyName: 'updatedAt',
      width: '240px',
      isSort: false,
    },
    {
      keyTitle: 'createIqc.tableListPo.createdBy',
      keyName: 'createdBy',
      isSort: false,
    },
  ];
  // Các cột của danh sách hàng hóa
  itemNewTableColumn: any = [
    {
      keyTitle: 'menu.manage.po.item.itemCode',
      keyName: 'itemCode',
      width: '200px',
      isSort: false,
    },
    {
      keyTitle: 'menu.manage.po.item.itemName',
      keyName: 'itemName',
      width: '200px',
      isSort: false,
    },
    {
      keyTitle: 'menu.manage.po.item.uom',
      keyName: 'unit',
      width: '200px',
      isSort: false,
    },
  ];
  // Danh sách loại hàng hóa
  listItemType: any[] = ['Mới', 'Đặc biệt', 'Thông thường', 'NVL', 'LKDT'];
  // Danh sách hàng hóa đi theo yêu cầu
  dataItem: any[] = [];
  // Lưu danh sách loại nhập kho
  listImportType: any = [];
  // Lưu danh sách kho
  listWarehouse: any = [];
  // Lưu danh sách po
  listPO: any = [];
  // Lưu danh sách so
  listSO: any = [];
  // Lưu danh sách hợp đồng ký gửi
  listContract: any = [];
  // Lưu danh sách đơn vị tính (uom)
  listUom: any = [];
  // Lưu danh sách hàng hóa
  listCustomer: any = [];
  // Lưu thông tin yêu cầu IQC
  importRequest: any = {
    importType: 1,
  };
  // Lưu giá trị ngày giao hàng được lấy theo mã po
  deliveryAt: any = '';
  // Lưu các giá trị filter của bảng hàng hóa
  dataFilter: any = {};
  // Giá trị để hiện thị giao diện theo loại nhập kho hiện tại được chọn
  importTypeSelected: number = 1;
  // Form data để gửi body theo api tạo mơi yêu cầu IQC
  formData: FormData = new FormData();
  // Lưu danh sách các hàng hóa để chọn khi ở loại nhập kho khác
  listItem: any = [];
  // Các giá trị ẩn hiện popup
  isVisibleSendConfirm: boolean = false;
  isVisibleSaveDraft: boolean = false;
  // Lưu giá trị filter po
  filterPagePO: any = {
    common: '',
    pageIndex: 0,
    pageSize: 10,
    filter: {
      documentAt: [],
      deliveryAt: [],
      updatedAt: [],
    },
    sortProperty: 'updatedAt',
    sortOrder: 'descend',
  };

  filterPageContract: any = {
    common: '',
    pageIndex: 0,
    pageSize: 10,
    filter: {},
    sortProperty: 'updatedAt',
    sortOrder: 'descend',
  };

  filterPageItem: any = {
    common: '',
    pageIndex: 0,
    pageSize: 0,
    filter: {},
    sortProperty: 'id',
    sortOrder: 'asc',
  };

  filterSO: any = {};
  isOpenTablePo: boolean = false;
  isVisibleTableListItem: boolean = false;
  checked = false;
  indeterminate = false;
  listOfCurrentPageData: readonly any[] = [];
  setOfCheckedId = new Set<any>();
  filterChildItems: any = {
    productCode: '',
    itemName: '',
    uom: '',
  };

  isOpenTableContract: boolean = false;
  isOpenTableSo: boolean = false;

  listOfRadioButton: string[] = ['button.detail'];
  // listOfRadioButton: string[] = ['button.detail', 'button.attach'];
  currentRadioButtonIndex: number = 0;
  dataFromSO: any = {};
  totalRequestQuantity: number = 0;

  pageIndexContractTable: number = 1;
  pageSizeContractTable: number = 10;
  totalContractTable: number = 100;

  pageIndexPoTable: number = 1;
  pageSizePoTable: number = 10;
  totalPoTable: number = 100;

  pageIndexItemTable: number = 1;
  pageSizeItemTable: number = 10;
  totalItemTable: number = 100;

  dataChild: any = {};

  checkIsRole(role: string) {
    return this.checkRole.checkRole(role);
  }
  ngOnInit() {
    this.loading.start();
    // Lấy danh sách po
    this.receiptCommonService
      .getPoAvailable(this.filterPagePO)
      .then((response) => {
        this.loading.stop();
        this.listPO = response.data.map((data: any) => {
          return {
            ...data,
            source: data.source == 1 ? 'Trong nước' : 'Nước ngoài',
          };
        });
        // Lấy dữ liệu danh sách po để tạo yêu cầu nhập kho mua hàng
        if (this.transferData.getObjectFromPO()) {
          let dataPO = this.transferData.getObjectFromPO();
          if (Object.keys(dataPO).length !== 0) {
            this.importRequest.importType = 1;
            this.importTypeSelected = 1;
            this.changePoCode(dataPO.poCode);
          }
        }
        this.totalPoTable = response.dataCount;
      });

    //Lấy dữ liệu dach sách hàng ký gửi để tạo yêu cầu nhập kho hàng ký gửi
    if (this.transferData.getObjectFromConsignmentContractCode()) {
      let dataFromConsignmentContractCode =
        this.transferData.getObjectFromConsignmentContractCode();
      if (Object.keys(dataFromConsignmentContractCode).length !== 0) {
        this.importTypeSelected = 4;
        this.importRequest.importType = 4;
        this.importRequest.consignmentContractCode =
          dataFromConsignmentContractCode.consignmentContractCode;
        this.importRequest.contractCreatedAt = new Date(
          dataFromConsignmentContractCode.contractCreatedAt
        );
        this.importRequest.customerCode =
          dataFromConsignmentContractCode.customerCode;
        this.importRequest.customerName =
          dataFromConsignmentContractCode.customerName;
        this.importRequest.address = dataFromConsignmentContractCode.address;
        this.importRequest.customerPhone =
          dataFromConsignmentContractCode.customerPhone;
        this.receiptCommonService
          .getListItemByContractCode(
            dataFromConsignmentContractCode.consignmentContractCode
          )
          .then((response) => {
            this.dataItem = response.data;
          });
      }
    }
    // Lấy dữ liệu từ dach sách SO để tạo yêu cầu nhập kho hàng bán bị trả lại
    if (this.transferData.getObjSo()) {
      this.dataFromSO = this.transferData.getObjSo();
      if (Object.keys(this.dataFromSO).length != 0) {
        this.importTypeSelected = 5;
        this.importRequest.importType = 5;
        this.importRequest.soCode = this.dataFromSO.productOrderCode;
        this.importRequest.customerCode = this.dataFromSO.customerCode;
      }
    }

    // BTP
    if (this.transferData.getObjectWO()) {
      this.dataWo = this.transferData.getObjectWO();
      if (Object.keys(this.dataWo).length != 0) {
        this.importTypeSelected = 2;
        this.importRequest.importType = 2;
        this.dataInformationWo.woCode = this.dataWo.woCode;
        this.dataInformationWo.lotId = this.dataWo.lotId;
        this.dataInformationWo.lotNumber = this.dataWo.lotNumber;
        this.dataInformationWo.startDate = this.dataWo.startDate;
        this.dataInformationWo.endDate = this.dataWo.endDate;
        if (this.dataInformationWo.woCode) {
          this.getListItemsProduct();
        }
      }
      this.transferData.setObjectWO({});
    }
    //NVL dư thừa
    if (this.transferData.getObjectWOForMaterial()) {
      this.dataWo = this.transferData.getObjectWOForMaterial();
      if (Object.keys(this.dataWo).length != 0) {
        this.importTypeSelected = 3;
        this.importRequest.importType = 3;
        this.dataInformationWo.woCode = this.dataWo.woCode;
        this.dataInformationWo.lotId = this.dataWo.lotId;
        this.dataInformationWo.lotNumber = this.dataWo.lotNumber;
        this.dataInformationWo.startDate = this.dataWo.startDate;
        this.dataInformationWo.endDate = this.dataWo.endDate;
        if (this.dataInformationWo.woCode) {
          this.getListItemsMaterial();
        }
      }
      this.transferData.setObjectWOForMaterial({});
    }
    this.changeSelectImportType(6);
    this.loading.stop();
  }
  dataWo: any = {};
  ngOnDestroy() {
    this.transferData.changeMessage('');
    this.transferData.setObjSo({});
    this.transferData.setObjectFromPO({});
    this.transferData.setObjectFromConsignmentContractCode({});
    this.transferData.setObjectWO({});
  }

  // Xử lý ẩn hiện popup thu hồi
  onHandleCancelPopup(event: any) {
    this.isVisibleSendConfirm = event;
  }

  // Hàm xử lý sự kiện onResize cho bảng danh sách hàng hóa
  // id = -1;
  // onResize({ width }: NzResizeEvent, i: number): void {
  //   cancelAnimationFrame(this.id);
  //   this.id = requestAnimationFrame(() => {
  //     this.itemTableColumn[i].width = width + 'px';
  //   });
  // }

  idPO = -1;
  onResizeListPO({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.idPO);
    this.idPO = requestAnimationFrame(() => {
      this.poTableColumn[i].width = width + 'px';
    });
  }

  idDataItem = -1;
  onResizeDataItem({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.idDataItem);
    this.idDataItem = requestAnimationFrame(() => {
      this.itemTableColumn[i].width = width + 'px';
    });
  }

  // Xử lý filter cho bảng danh sách hàng hóa
  filterForItemTable() { }

  // Kiểm tra valid cho danh sách hàng hóa
  isValidListItem(listItem: any): boolean {
    for (let i = 0; i < listItem.length; i++) {
      if (!listItem[i].requestQuantity || listItem[i].requestQuantity <= 0) {
        return false;
      }
      if (!listItem[i].warehouseCode) {
        return false;
      }
    }
    return true;
  }

  // Xử tạo yêu cầu nhập kho
  createIqcRequest(iqcData: any) {
    this.formData.delete('textData');
    this.formData.delete('fileData');

    iqcData = { ...iqcData, deliveryAt: this.deliveryAt };

    this.formData.append(
      'textData',
      new Blob([JSON.stringify(iqcData)], {
        type: 'application/json',
      })
    );

    for (let file of this.newFileList) {
      this.formData.append('fileData', file);
    }

    for (let file of this.listFileReport) {
      this.formData.append('reportData', file);
    }

    this.importRequestService
      .createImportRequest(this.importTypeSelected, this.formData)
      .then((response) => {
        if (response.result.ok == true) {
          this.messageService.success(
            'Thêm yêu cầu nhập kho thành công',
            'Thành công'
          );
          this.router.navigate([
            './manage-warehouse-receipt/required-receipt-warehouse',
          ]);
        } else {
          this.messageService.error(response.result.message, ' Thông báo');
        }
      });
  }

  async createIQCWithImportTypeTwo(dataRequest: any) {
    this.formData.delete('textData');
    this.formData.append(
      'textData',
      new Blob([JSON.stringify(dataRequest)], {
        type: 'application/json',
      })
    );

    for (let file of this.listFileReport) {
      this.formData.append('reportData', file);
    }

    let res = await this.importRequestService.createImportRequest(
      2,
      this.formData
    );
    if (res.result.responseCode == '00') {
      this.messageService.success(
        'Thêm yêu cầu nhập kho thành công',
        ` Thành công`
      );
      this.router.navigate([
        './manage-warehouse-receipt/required-receipt-warehouse',
      ]);
    } else {
      this.messageService.error(res.result.message, ' Thông báo');
    }
  }

  async createIQCWithImportTypeThree(dataRequest: any) {
    this.formData.append(
      'textData',
      new Blob([JSON.stringify(dataRequest)], {
        type: 'application/json',
      })
    );

    for (let file of this.listFileReport) {
      this.formData.append('reportData', file);
    }
    console.log(dataRequest);

    let res = await this.importRequestService.createImportRequest(
      3,
      this.formData
    );
    if (res.result.responseCode == '00') {
      this.messageService.success(
        'Thêm yêu cầu nhập kho thành công',
        ` Thành công`
      );
      this.router.navigate([
        './manage-warehouse-receipt/required-receipt-warehouse',
      ]);
    } else {
      this.messageService.error(res.result.message, ' Thông báo');
    }
  }

  async createDraftIQCWithImportTypeThree(dataRequest: any) {
    let res =
      await this.importRequestService.createDraftImportRequestWithTypeThree(
        dataRequest,
        3
      );
    if (res.result.responseCode == '00') {
      this.messageService.success(
        'Tạo bản nháp yêu cầu nhập kho thành công',
        ` Thành công`
      );
      this.router.navigate([
        './manage-warehouse-receipt/required-receipt-warehouse',
      ]);
    } else {
      this.messageService.error(res.result.message, ' Thông báo');
    }
  }

  // Hàm gửi tạo yêu cầu IQC
  sendRequestCreateIqc() {
    let iqcData = {
      importRequestDTO: this.importRequest,
      listItem: this.dataItem,
    };
    // if (this.listFileReport.length <= 0) {
    //   this.messageService.warning(
    //     ` Biên bản kiểm tra không được bỏ trống`,
    //     ` Cảnh báo`
    //   );
    //   return;
    // }
    switch (this.importTypeSelected) {
      case 1: {
        if (
          !this.importRequest.importType ||
          // !this.importRequest.warehouseCode ||
          !this.importRequest.poCode ||
          !this.isValidListItem(this.dataItem) ||
          (this.newFileList.length == 0 && this.fileList.length == 0)
        ) {
          this.messageService.warning('Hãy nhập đầy đủ thông tin', ' Cảnh báo');
        } else if (this.dataItem?.length == 0) {
          this.messageService.warning('Không có hàng hóa', ' Cảnh báo');
        } else {
          this.createIqcRequest(iqcData);
        }
        break;
      }

      case 4: {
        if (
          !this.importRequest.importType ||
          // !this.importRequest.warehouseCode ||
          !this.importRequest.consignmentContractCode ||
          !this.isValidListItem(this.dataItem) ||
          (this.newFileList.length == 0 && this.fileList.length == 0)
        ) {
          this.messageService.warning('Hãy nhập đầy đủ thông tin', ' Cảnh báo');
        } else if (this.dataItem?.length == 0) {
          this.messageService.warning('Không có hàng hóa', ' Cảnh báo');
        } else {
          this.createIqcRequest(iqcData);
        }
        break;
      }
      case 3: {
        if (
          !this.importRequest.importType ||
          // !this.importRequest.warehouseCode ||
          !this.isValidListItem(this.dataItem) ||
          !this.dataInformationWo.woCode
        ) {
          this.messageService.warning(
            'Hãy nhập đầy đủ thông tin yêu cầu',
            ' Cảnh báo'
          );
        } else if (this.dataItem?.length == 0) {
          this.messageService.warning('Không có hàng hóa', ' Cảnh báo');
        } else {
          let inforRequest = {
            importRequestDTO: {
              id: null, //tạo mới thì bỏ cái này
              importRequestCode: null, //tạo mới thì bỏ cái này
              importType: 3,
              // warehouseCode: this.importRequest.warehouseCode,
              shipper: this.importRequest.shipper,
              woCode: this.dataInformationWo.woCode,
              lotId: this.dataInformationWo.lotId,
              lotNumber: this.dataInformationWo.lotNumber,
              productCode: this.dataInformationWo.productCode,
              productName: this.dataInformationWo.productName,
              deliveryAt: this.dataInformationWo.deliveryAt
                ? this.dataInformationWo.deliveryAt
                : '',
              startAt: this.dataInformationWo.startDate,
              endAt: this.dataInformationWo.endDate,
              importTypeId: this.importRequest.importTypeId,
              note: this.importRequest.note,
            },
            listItem: this.dataItem,
          };
          this.createIQCWithImportTypeThree(inforRequest);
        }
        break;
      }
      case 2: {
        if (
          !this.importRequest.importType ||
          // !this.importRequest.warehouseCode ||
          !this.isValidListItem(this.dataItem) ||
          !this.dataInformationWo.woCode
        ) {
          this.messageService.warning(
            'Hãy nhập đầy đủ thông tin yêu cầu',
            ' Cảnh báo'
          );
        } else if (this.dataItem?.length == 0) {
          this.messageService.warning('Không có hàng hóa', ' Cảnh báo');
        } else {
          let inforRequest = {
            importRequestDTO: {
              id: null, //tạo mới thì bỏ cái này
              importRequestCode: null, //tạo mới thì bỏ cái này
              importType: 2,
              // warehouseCode: this.importRequest.warehouseCode,
              shipper: this.importRequest.shipper,
              woCode: this.dataInformationWo.woCode,
              lotId: this.dataInformationWo.lotId,
              lotNumber: this.dataInformationWo.lotNumber,
              productCode: this.dataInformationWo.productCode,
              productName: this.dataInformationWo.productName,
              deliveryAt: this.dataInformationWo.deliveryAt
                ? this.dataInformationWo.deliveryAt
                : '',
              startAt: this.dataInformationWo.startDate,
              endAt: this.dataInformationWo.endDate,
              importTypeId: this.importRequest.importTypeId,
              note: this.importRequest.note,
            },
            listItem: this.dataItem,
          };
          console.log(inforRequest);

          this.createIQCWithImportTypeTwo(inforRequest);
        }
        break;
      }
      case 5: {
        break;
      }

      case 6: {
        if (
          !this.importRequest.importType ||
          // !this.importRequest.warehouseCode ||
          !this.isValidListItem(this.dataItem)
        ) {
          this.messageService.warning('Hãy nhập đầy đủ thông tin', ' Cảnh báo');
        } else if (this.dataItem?.length == 0) {
          this.messageService.warning('Không có hàng hóa', ' Cảnh báo');
        } else {
          this.createIqcRequest(iqcData);
        }
        break;
      }
    }
  }

  // Xử lý lưu nháp IQC
  saveDraft() {
    if (this.importTypeSelected !== 3) {
      let importRequestDraft = {
        importRequestDTO: this.importRequest,
        listItem: this.dataItem,
      };
      this.formData.append(
        'textData',
        new Blob([JSON.stringify(importRequestDraft)], {
          type: 'application/json',
        })
      );

      for (let file of this.newFileList) {
        this.formData.append('fileData', file);
      }

      for (let file of this.listFileReport) {
        this.formData.append('reportData', file);
      }

      this.importRequestService
        .saveDraft(this.importTypeSelected, this.formData)
        .then((response) => {
          if (response.result.ok == true) {
            this.messageService.success('Lưu nháp thành công', 'Thành công');
            this.router.navigate([
              './manage-warehouse-receipt/required-receipt-warehouse',
            ]);
          } else {
            this.messageService.error(response.result.message, 'Lỗi');
          }
        });
    } else if (this.importTypeSelected == 3) {
      let inforRequest = {
        importRequestDTO: {
          id: null, //tạo mới thì bỏ cái này
          importRequestCode: null, //tạo mới thì bỏ cái này
          importType: 3,
          // warehouseCode: this.importRequest.warehouseCode,
          shipper: this.importRequest.shipper,
          woCode: this.dataInformationWo.woCode,
          totalLotNumber: this.dataInformationWo.totalLotNumber,
          startAt: this.dataInformationWo.startDate,
          endAt: this.dataInformationWo.endDate,
          importTypeId: this.importRequest.importTypeId,
          note: this.importRequest.note,
        },
        listItem: this.dataItem,
      };
      this.createDraftIQCWithImportTypeThree(inforRequest);
    } else {
      this.messageService.warning(` Loại nhập kho không phù hợp`, ` Cảnh báo`);
    }
  }

  // Xử lý ẩn hiện lưu nháp popup
  onHandleDraftPopup(event: any) {
    this.isVisibleSaveDraft = event;
  }

  // Xử lý hủy bỏ xự kiện ấn hủy bỏ
  close() {
    this.router.navigate([
      './manage-warehouse-receipt/required-receipt-warehouse',
    ]);
  }

  // Thay đổi lựa chọn hiển thị danh sách hàng hóa
  changeSelect(event: any) {
    this.currentRadioButtonIndex = event;
  }

  // Xử lý thay đổi lựa chọn po
  changePoCode(event: any) {
    this.deliveryAt = new Date(
      this.listPO.find((po: any) => {
        return po.poCode == event;
      }).deliveryAt
    );
    this.totalRequestQuantity = 0;
    this.importRequest.poCode = event;
    this.receiptCommonService.getListItemsByPoCode(event).then((response) => {
      this.dataItem = response.data;
      this.dataItem.forEach((data: any) => {
        this.totalRequestQuantity =
          this.totalRequestQuantity + Number(data.requestQuantity);
      });
    });

    this.isOpenTablePo = false;
  }

  // Xử lý thay đổi loại nhập kho
  changeSelectImportType(event: any) {
    if (event != null) {
      this.importRequest.importType = event;
      this.importTypeSelected = event;
      this.dataItem = [];
      this.setOfCheckedId.clear();
      this.arrExcelTemp = [];
      this.checked = false;
      this.indeterminate = false;
      this.totalRequestQuantity = 0;
      if (event == 3 || event == 2) {
        if (event == 2) {
          this.dataInformationWo.woCode = '';
          this.listWMmstatus = [8, 9];
          this.onHandleFetchListWo();
        }
        if (event == 3) {
          this.dataInformationWo.woCode = '';
          this.listWMmstatus = [9];
          this.onHandleFetchListWo();
        }
        this.listItem = [];
      }
      if (event == 6) {
        // this.requestIqcService
        //   .getListItem(this.filterPageItem)
        //   .then((response) => {
        //     this.listItem = response.data;
        //     this.totalItem = response.dataCount;
        //   });
        this.getListItem();
      }
    }
  }

  // Xử lý khi upload thêm 1 file mới
  onFileTagChange(event: any) {
    this.newFileList = event;
  }

  // Xử lý ẩn hiện bảng danh sách khi ở nhập kho khác
  onHandleTableListItem() {
    // this.loading.start();
    this.isVisibleTableListItem = true;
    // this.loading.stop();
  }

  // Xử lý thay đổi sự kiện thay đổi ẩn hiện
  changeVisibleTableListItem(event: any) {
    this.isVisibleTableListItem = event;
  }

  deleteItems(row: any) {
    this.updateCheckedSet(row.productCode, false);
    this.refreshCheckedStatus();
  }
  // Xử lý khi thêm 1 hàng hóa vào dach sách hàng hóa để tạo yêu cầu IQC\
  arrTempp: any[] = [];
  updateCheckedSet(id: any, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
      let elememt = this.listItem.find((ele: any) => ele.productCode == id);
      if (elememt) {
        elememt = {
          id: elememt?.id || null,
          productCode: elememt.productCode,
          itemName: elememt.itemName,
          uom: elememt.unit,
          unit: elememt.unit,
          exchangeRate: 0,
          supplierQuantity: 0,
          openQuantity: 0,
          supplierUnitPrice: 0,
          discount: 0,
          amount: 0,
        };
        this.dataItem = this.dataItem.concat(elememt);
      }
    } else {
      this.setOfCheckedId.delete(id);
      this.dataItem = [...this.dataItem.filter((ele) => ele.productCode != id)];
    }
  }

  // Xử lý sự kiện chọn hàng hóa khi ở nhập kho khác
  clickRow(item: any) {
    item.rowCheck = !item.rowCheck;
    const check = this.setOfCheckedId.has(item.productCode);
    this.updateCheckedSet(item.productCode, !check);
    this.refreshCheckedStatus();
  }

  // Xử lý sự kiện chọn hàng hóa khi ở nhập kho khác
  onItemChecked(item: any, checked: boolean): void {
    this.updateCheckedSet(item.productCode, checked);
    this.refreshCheckedStatus();
  }

  // Xử lý chọn tất cả
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

  changeContract(event: any) {
    // let warehouseCode = this.importRequest.warehouseCode;
    this.importRequest = {};
    this.importRequest = this.listContract.find((contract: any) => {
      return contract.consignmentContractCode == event;
    });
    this.importRequest.consignmentContractCode = event;
    this.importRequest.importType = this.importTypeSelected;
    // this.importRequest.warehouseCode = warehouseCode;

    this.receiptCommonService
      .getListItemByContractCode(event)
      .then((response) => {
        this.dataItem = response.data;
      });
    this.isOpenTableContract = false;
  }

  onChangeRequestQuantity(row: any) {
    if (row.requestQuantity <= 0) {
      this.messageService.warning('Số lượng phải lớn hơn 0', 'Cảnh báo');
    } else {
      this.totalRequestQuantity = 0;
      this.dataItem.forEach((data: any) => {
        if (data.requestQuantity) {
          this.totalRequestQuantity =
            this.totalRequestQuantity + Number(data.requestQuantity);
        }
      });
    }
  }

  changeSo(event: any) {
    // let warehouseCode = this.importRequest.warehouseCode;
    this.importRequest = {};
    this.dataFromSO = this.listSO.find((so: any) => {
      return so.productOrderCode == event;
    });
    this.importRequest.soCode = event;
    this.importRequest.importType = this.importTypeSelected;
    // this.importRequest.warehouseCode = warehouseCode;
    this.importRequest.customerCode = this.dataFromSO.customerCode;

    this.receiptCommonService.getListItemBySoCode(event).then((response) => {
      this.dataItem = response.data;
    });
    this.isOpenTableSo = false;
  }

  paginationForContractTable(event: any) {
    this.pageIndexContractTable = event.page;
    this.pageSizeContractTable = event.size;
    this.getListContract();
  }

  paginationForPoTable(event: any) {
    this.pageIndexPoTable = event.page;
    this.pageSizePoTable = event.size;
    this.getListPo();
  }

  paginationForItemTable(event: any) {
    this.pageIndexItemTable = event.page;
    this.pageSizeItemTable = event.size;
    if (this.importRequest.importType == 3) {
      this.pageItem = event.page;
      this.perPageItem = event.size;
      this.getListItemsMaterial();
    } else {
      this.getListItem();
    }
  }

  searchPo: any = {};

  async getListPo() {
    this.loading.start();
    this.filterPagePO.pageIndex = this.pageIndexPoTable - 1;
    this.filterPagePO.pageSize = this.pageSizePoTable;
    let res = await this.receiptCommonService.getPoAvailable(this.filterPagePO);
    if ((res.result.responseCode = '00')) {
      this.listPO = res.data.map((data: any) => {
        return {
          ...data,
          source: data.source == 1 ? 'Trong nước' : 'Nước ngoài',
        };
      });
      this.totalPoTable = res.dataCount;
      this.loading.stop();
    } else {
      this.loading.stop();
    }
  }

  async getListContract() {
    this.loading.start();

    if (this.filterPageContract.filter.contractCreatedAt) {
      this.filterPageContract.filter.contractCreatedAt2 =
        this.filterPageContract.filter.contractCreatedAt[1];
      this.filterPageContract.filter.contractCreatedAt =
        this.filterPageContract.filter.contractCreatedAt[0];
    }
    if (this.filterPageContract.filter.updatedAt) {
      this.filterPageContract.filter.updatedAt2 =
        this.filterPageContract.filter.updatedAt[1];
      this.filterPageContract.filter.updatedAt =
        this.filterPageContract.filter.updatedAt[0];
    }

    this.filterPageContract.pageIndex = this.pageIndexContractTable - 1;
    this.filterPageContract.pageSize = this.pageSizeContractTable;
    this.filterPageContract.filter.status = 2;
    this.filterPageContract.filter.iqcCreated = false;

    let resp = await this.contractService.getList(this.filterPageContract);
    if (resp.result.responseCode == '00') {
      this.loading.stop();
      this.listContract = resp.data;
      this.totalContractTable = resp.dataCount;
    } else {
      this.loading.stop();
      this.messageService.warning(
        `Có lỗi xảy ra trong quá trình tải trang`,
        `Cảnh báo`
      );
    }
  }

  enterSearchContractTable(event: any) {
    if (event.keyCode == 13) {
      this.getListContract();
    }
  }

  enterSearchPoTable(event: any) {
    if (event.keyCode == 13) {
      this.getListPo();
    } else if (event.type == 'click') {
      this.getListPo();
    }
  }

  enterSearchItemTable(event: any) {
    if (event.keyCode == 13) {
      if (this.importTypeSelected == 3) {
        this.getListItemsMaterial();
      } else if (this.importTypeSelected == 2) {
        this.getListItemsProduct();
      } else {
        this.pageIndexItemTable = 1;
        this.getListItem();
      }
    } else if (event.type == 'click') {
      if (this.importTypeSelected == 3) {
        this.getListItemsMaterial();
      } else if (this.importTypeSelected == 2) {
        this.getListItemsProduct();
      } else {
        this.pageIndexItemTable = 1;
        this.getListItem();
      }
    }
  }

  onSortForContractTable(sortProperty: string, index: number) {
    if (sortProperty == 'warehouseName') {
      sortProperty = 'warehouseCode';
    }
    this.filterPageContract.sortProperty = sortProperty;
    this.contractTableColumn.forEach((e: any): any => {
      if (e.keyName != sortProperty) {
        e.isSort = false;
      }
    });
    if (!this.contractTableColumn[index].isSort) {
      this.filterPageContract.sortOrder = 'descend';
      this.contractTableColumn[index].isSort = true;
    } else {
      if (this.filterPageContract.sortOrder == 'descend') {
        this.filterPageContract.sortOrder = 'ascend';
      } else {
        this.filterPageContract.sortOrder = 'descend';
      }
    }

    this.getListContract();
  }

  onSortForPoTable(sortProperty: string, index: number) {
    this.filterPagePO.sortProperty = sortProperty;
    this.poTableColumn.forEach((e: any): any => {
      if (e.keyName != sortProperty) {
        e.isSort = false;
      }
    });

    if (!this.poTableColumn[index].isSort) {
      this.filterPagePO.sortOrder = 'descend';
      this.poTableColumn[index].isSort = true;
    } else {
      if (this.filterPagePO.sortOrder == 'descend') {
        this.filterPagePO.sortOrder = 'ascend';
      } else {
        this.filterPagePO.sortOrder = 'descend';
      }
    }

    this.getListPo();
  }

  onResizeForContractTable({ width }: NzResizeEvent, col: any): void {
    this.contractTableColumn = this.contractTableColumn.map((e: any) =>
      e.keyTitle === col.keyTitle ? { ...e, width: `${width}px` } : e
    );
  }

  async getListItem() {
    try {
      this.loading.start();

      this.filterPageItem.pageIndex = this.pageIndexItemTable - 1;
      this.filterPageItem.pageSize =
        this.pageSizeItemTable <= 0 ? 10 : this.pageSizeItemTable;
      this.filterPageItem.filter['itemCode'] =
        this.filterPageItem.filter?.productCode;

      let resp = await this.requestIqcService.getListItemNew(
        this.filterPageItem
      );
      if (resp.result.responseCode == '00') {
        this.loading.stop();
        this.listItem = resp.data?.content.map((item: any) => ({
          productCode: item.itemCode,
          itemName: item.itemName,
          unit: item?.unit,
        }));
        this.totalItem = resp.data?.totalElements;
      } else {
        this.loading.stop();
        this.messageService.warning(
          `Có lỗi xảy ra trong quá trình tải trang`,
          `Cảnh báo`
        );
      }
    } catch (error) {
      this.loading.stop();
    }
  }

  onSortForItemTable(sortProperty: string, index: number) {
    this.sortPropertyWo = sortProperty;
    this.itemNewTableColumn.forEach((e: any): any => {
      if (e.keyName != sortProperty) {
        e.isSort = false;
      }
    });
    if (!this.itemNewTableColumn[index].isSort) {
      this.sortOrderWo = 'DESC';
      this.itemNewTableColumn[index].isSort = true;
    } else {
      if (this.sortOrderWo == 'DESC') {
        this.sortOrderWo = 'ASC';
      } else {
        this.sortOrderWo = 'DESC';
      }
    }
    if (this.importTypeSelected == 2) {
      this.getListItemsProduct();
    } else if (this.importTypeSelected == 3) {
      this.getListItemsMaterial();
    } else {
      this.getListItem();
    }
  }

  clearFilter(keyName: any) {
    this.filterPageItem.filter[keyName] = '';
    if (this.importTypeSelected == 3) {
      this.getListItemsMaterial();
    } else if (this.importTypeSelected == 2) {
      this.getListItemsProduct();
    } else {
      this.getListItem();
    }
  }

  // Đính kèm
  listFile: any[] = [];
  columnFile: any[] = [
    {
      keyTitle: 'sidebar.receipt.child.CreateIQCRequest.file.fileTag',
      keyName: 'fileTag',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'sidebar.receipt.child.CreateIQCRequest.file.sendBy',
      keyName: 'sendBy',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'sidebar.receipt.child.CreateIQCRequest.file.sendDate',
      keyName: 'sendDate',
      width: '200px',
      check: true,
    },
  ];
  idFile = -1;
  onResizeFile({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.idFile);
    this.idFile = requestAnimationFrame(() => {
      this.columnFile[i].width = width + 'px';
    });
  }
  filterFile: any = {};

  onHandleEnterSearchFile($event: any) {
    if ($event.keyCode == 13) {
    }
  }

  onHandleClickSearchFile() { }

  onHandleClearInputFile(keyName: string) {
    this.filterFile[keyName] = '';
  }

  checkedFile = false;
  indeterminateFile = false;
  listOfCurrentPageDataFile: readonly any[] = [];
  setOfCheckedIdFile = new Set<any>();
  arrFile: any[] = [];
  updateCheckedSetFile(id: number, checked: boolean): void {
    let arr: any[] = [];
    if (checked) {
      this.setOfCheckedIdFile.add(id);
    } else {
      this.setOfCheckedIdFile.delete(id);
    }

    this.setOfCheckedIdFile.forEach((element) => {
      arr.push(element);
    });
    this.arrFile = arr;
  }

  onItemCheckedFile(id: number, checked: boolean): void {
    this.updateCheckedSetFile(id, checked);
    this.refreshCheckedStatusFile();
  }

  onAllCheckedFile(value: boolean): void {
    this.listOfCurrentPageDataFile.forEach((item) =>
      this.updateCheckedSetFile(item.id, value)
    );
    this.refreshCheckedStatusFile();
  }

  onCurrentPageDataChangeFile($event: readonly any[]): void {
    this.listOfCurrentPageDataFile = $event;
    this.refreshCheckedStatusFile();
  }

  refreshCheckedStatusFile(): void {
    this.checkedFile = this.listOfCurrentPageDataFile.every((item) =>
      this.setOfCheckedIdFile.has(item.id)
    );
    this.indeterminateFile =
      this.listOfCurrentPageDataFile.some((item) =>
        this.setOfCheckedIdFile.has(item.id)
      ) && !this.checkedFile;
  }

  onHandleDownloadFile() { }

  listWo: any[] = [];
  isOpenlistWo: boolean = false;
  dataInformationWo: any = {
    woCode: '',
    totalLotNumber: '',
  };
  totalWoCode: any = 0;
  pageWoCode: any = 1;
  perPageWoCode: any = 10;
  dataFilterWoCode: any = {
    startAt: [],
    endAt: [],
    updatedAt: [],
  };
  pageItem: any = 1;
  perPageItem: any = 10;
  totalItem: any = 0;
  searchMaterial: any = {};
  searchProduct: any = {};
  checkedMaterial = false;
  indeterminateMaterial = false;
  listOfCurrentPageDataMaterial: readonly any[] = [];
  setOfCheckedIdMaterial = new Set<any>();

  showPopoverWoCode() {
    this.isOpenlistWo = true;
  }

  popoverVisibleChangeWoCode(event: any) {
    this.isOpenlistWo = event;
  }

  filterSearchWoCode($event: any) {
    if ($event.keyCode == 13) {
      if (this.importTypeSelected == 3) {
        this.listWMmstatus = [9];
      }
      if (this.importTypeSelected == 2) {
        this.listWMmstatus = [8, 9];
      }
      this.onHandleFetchListWo();
    } else if ($event.type == 'click') {
      if (this.importTypeSelected == 3) {
        this.listWMmstatus = [9];
      }
      if (this.importTypeSelected == 2) {
        this.listWMmstatus = [8, 9];
      }
      this.onHandleFetchListWo();
    }
  }

  /** Lấy danh sách WO */
  listWMmstatus: any[] = [];
  async onHandleFetchListWo() {
    let dataRequest = {
      pageNumber: this.pageWoCode - 1,
      pageSize: this.perPageWoCode,
      filter: {
        wmsStatusSearch: this.listWMmstatus,
        woCode: this.dataFilterWoCode.woCode,
        totalLotNumber: this.dataFilterWoCode.totalLotNumber,
        startDateFrom: this.dataFilterWoCode.startAt[0]
          ? moment(this.dataFilterWoCode.startAt[0]).format('YYYY-MM-DD')
          : '',
        startDateTo: this.dataFilterWoCode.startAt[1]
          ? moment(this.dataFilterWoCode.startAt[1]).format('YYYY-MM-DD')
          : '',
        endDateFrom: this.dataFilterWoCode.endAt[0]
          ? moment(this.dataFilterWoCode.endAt[0]).format('YYYY-MM-DD')
          : '',
        endDateTo: this.dataFilterWoCode.endAt[1]
          ? moment(this.dataFilterWoCode.endAt[1]).format('YYYY-MM-DD')
          : '',
        createdBy: this.dataFilterWoCode.createdBy,
        updateDateFrom: this.dataFilterWoCode.updatedAt[0],
        updateDateTo: this.dataFilterWoCode.updatedAt[1],
      },
      common: '',
      sortProperty: 'updatedAt',
      sortOrder: 'DESC',
    };

    let res = await this.exportRequestService.getListWo(dataRequest);
    if (res) {
      if (res.result.responseCode == '00') {
        this.listWo = res.data.content;
        this.totalWoCode = res.data.totalElements;
      } else {
        this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
      }
    } else {
      this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
    }
  }

  sortPropertyWo: any = 'updatedAt';
  sortOrderWo: any = 'DESC';
  // Danh sách hàng hóa theo nhập kho BTP/TP theo WO
  async getListItemsProduct() {
    let dataRequest = {
      pageIndex: this.pageItem - 1,
      pageSize: this.perPageItem,
      filter: {
        productCode: this.filterPageItem.filter.productCode,
        itemName: this.filterPageItem.filter.itemName,
        uom: this.filterPageItem.filter.unit,
        unit: this.filterPageItem.filter.unit,
        woCode: this.dataInformationWo.woCode,
      },
      common: '',
      sortProperty: this.sortPropertyWo,
      sortOrder: this.sortOrderWo,
    };

    let res = await this.exportRequestService.getListItemWithExportProduct(
      dataRequest
    );
    if (res) {
      if (res.result.responseCode == '00') {
        this.listItem = res.data.map((item: any) => ({
          ...item,
          unit: item.uom,
          itemName: item.productName,
        }));
      
        this.totalItem = res.dataCount;
      } else {
        this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
      }
    } else {
      this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
    }
  }

  /** Danh sách hàng hóa theo xuất kho sản xuất (NVL) */
  async getListItemsMaterial() {
    let dataRequest = {
      pageIndex: this.pageItem - 1,
      pageSize: this.perPageItem,
      filter: {
        productCode: this.filterPageItem.filter.productCode,
        itemName: this.filterPageItem.filter.itemName,
        uom: this.filterPageItem.filter.unit,
        unit: this.filterPageItem.filter.unit,
        woCode: this.dataInformationWo.woCode,
      },
      common: '',
      sortProperty: 'updatedAt',
      sortOrder: 'descend',
    };

    let res = await this.exportRequestService.getListItemWithExportMaterial(
      dataRequest
    );
    if (res) {
      if (res.result.responseCode == '00') {
        this.listItem = res.data.map((item: any) => ({
          ...item,
          unit: item.uom,
          proName: item.itemName,
        }));
        // res.data.forEach((element: any) => {
        //   this.listItem.push({
        //     ...element,
        //     unit: element.uom,
        //     proName: element.itemName,
        //   });
        // });
        // this.listItem = res.data;
        this.totalItem = res.dataCount;
      } else {
        this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
      }
    } else {
      this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
    }
  }

  clearWoCode(keyName: string) {
    this.dataFilterWoCode[keyName] = '';
    this.onHandleFetchListWo();
  }

  paginationWoCode(event: any) {
    this.pageWoCode = event.page;
    this.perPageWoCode = event.size;
    this.onHandleFetchListWo();
  }

  chooseWoCode(row: any) {
    this.isOpenlistWo = false;
    this.dataInformationWo = {
      ...row,
      startDate: row.startDate ? new Date(row.startDate) : '',
      endDate: row.endDate ? new Date(row.endDate) : '',
      deliveryAt: row.endDate ? new Date(row.endDate) : '',
    };
    this.listItem = [];
    this.dataItem = [];
    this.setOfCheckedIdMaterial.clear();
    if (this.importTypeSelected == 3) {
      this.getListItemsMaterial();
    }
    if (this.importTypeSelected == 2) {
      this.getListItemsProduct();
    }
  }

  showUploadFile: boolean = false;
  onClickAddNew() {
    this.showUploadFile = true;
  }

  listFileReport: any[] = [];

  onFileChangeShowUpload(event: any) {
    this.listFileReport = event;
  }
  cancelUploadFile() {
    this.showUploadFile = false;
  }
  deleteFile(row: any) {
    // console.log(row);
    const index = this.listFileReport.findIndex(
      (file) => file.name === row.name
    );
    if (index !== -1) {
      this.uploadedFiles.splice(index, 1);
      this.messageService.success(`Đã xóa ${row.name} khỏi danh sách`, ``);
    }
    this.listFileReport = this.listFileReport.filter(
      (item) => item.name !== row.name
    );
  }

  @ViewChild('fileInput') fileInput: any;
  uploadedFiles: File[] = [];

  onFilesAdded(event: any) {
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
        this.listFileReport = [...this.uploadedFiles];
        this.showUploadFile = false;
        console.log(this.listFileReport);
      }
    }
  }

  isFileExist(fileName: string): boolean {
    return this.uploadedFiles.some((file) => file.name === fileName);
  }

  isVisibleUploadFile: boolean = false;
  importedExcel: boolean = false; 
  arrExcelTemp: any = [];
  setCodeFromExcel = new Set<any>(); 
  onHandleOpenImportFile() {
    this.isVisibleUploadFile = true;
  }

  onHandleCloseImportFile() {
    this.isVisibleUploadFile = false;
  }

  // Hàm để chuyển đổi số sê-ri Excel thành đối tượng Date
  excelDateToJSDate(serial: number) {
    if (serial) {
      let date = new Date((serial - 25569) * 86400 * 1000);
      date.setTime(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
      return date.toLocaleDateString('en');
    } else {
      return null;
    }
  }

  /** Tải template */
  downloadTemplateFile() {
    let link = document.createElement('a');
    link.download = 'Template_DSHH';
    link.href = '../../../../../assets/templateFile/Template_DSHH.xlsx';
    link.click();
  }

}
