import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { KeycloakService } from 'keycloak-angular';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CheckRoleService } from 'src/app/services/checkRole.service';
import { GDNService } from 'src/app/services/export-warehouse/GDNRequestService.service';
import { CommonService } from 'src/app/services/export-warehouse/commonService.service';
import { ExportRequestService } from 'src/app/services/export-warehouse/exportRequestService.service';
import { MessageService } from 'src/app/services/message.service';
import { TransferDataService } from 'src/app/services/transferData.service';

@Component({
  selector: 'app-create-GDN',
  templateUrl: './create-GDN.component.html',
  styleUrls: ['./create-GDN.component.css'],
})
export class CreateGDNComponent implements OnInit {
  constructor(
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private loading: NgxUiLoaderService,
    private checkRole: CheckRoleService,
    private transferData: TransferDataService,
    private keycloakService: KeycloakService,
    private commonService: CommonService,
    private exportRequestService: ExportRequestService,
    private gdnService: GDNService
  ) {}
  exportPurpose: string = '';
  // Breadcrumb
  isBreadcrumb: boolean = false;
  isHidden: boolean = true;
  breadcrumbs: Object[] = [];
  // Thông tin yêu cầu xuất kho
  dataInformation: any = {};
  listWarehouse: any[] = [];
  listExportType: any[] = [
    {
      text: 'Xuất kho sản xuất',
      value: 1,
    },
    // {
    //   text: 'Xuất kho thành phẩm',
    //   value: 2,
    // },
    {
      text: 'Xuất kho khác',
      value: 3,
    },
  ];

  // product type
  listProductType: any[] = [
    {
      text: 'Other',
      localCheck: true,
    },
    {
      text: 'CTH',
      localCheck: true,
    },
    {
      text: 'BodyCard',
      localCheck: true,
    },
    {
      text: 'FORM',
      localCheck: true,
    },
  ];
  selectedProductType: string = '';

  // Mã yêu cầu xuất kho
  showExportRequestCode: boolean = false;
  listExportRequestCode: any[] = [];
  dataFilterExportRequestCode: any = {};
  // Danh sách hàng hóa
  columns: any[] = [];
  dataItems: any[] = [];
  countTotalActualQuantity: number = 0;
  countTotalQuantityRequest: number = 0;
  dataFilterProduct: any = {};
  visiblePopup: boolean = false;
  listItem: any[] = [];
  checked = false;
  indeterminate = false;
  listOfCurrentPageData: readonly any[] = [];
  setOfCheckedId = new Set<any>();
  dataDraft: any[] = [];
  filterChildItems: any = {};
  pageItem: any = 1;
  perPageItem: any = 10;
  totalItem: any = 0;
  showApproveBy: boolean = false;
  // Nhân viên
  showEmployee: boolean = false;
  dataApprovedBy: any = {};
  listTeamGroup: any[] = [];
  listEmployee: any[] = [];
  dataFilterEmployee: any = {};
  // Transfer data
  dataTransfer: any = {};
  ngOnInit() {
    let data = this.transferData.getInformationExportMaterial();
    if (Object.keys(data).length > 0) {
      this.dataTransfer = data;
      this.dataInformation = {
        ...data,
        startAt: data.startAt ? new Date(data.startAt) : '',
        endAt: data.endAt ? new Date(data.endAt) : '',
        deliveryAt: data.deliveryAt ? new Date(data.deliveryAt) : '',
      };

      this.setProductType(this.dataInformation);
      if (this.dataInformation.exportRequestCode) {
        this.readExportRequestCode(data.exportRequestCode);
      }
    }
    this.dataFilterExportRequestCode = {
      orderDate: [],
      deliveryAt: [],
      startAt: [],
      endAt: [],
      createdAt: [],
      updatedAt: [],
    };
    this.getWarehouse();
    this.setBreadcrumb();
    this.getTeamGroup();
    this.getEmployee();
    this.getExportRequest();
    this.getListShipper();
    this.getListLocation();

    this.columns = [
      {
        keyTitle: 'Mã hàng hóa',
        keyName: 'itemCode',
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
        keyName: 'warehouseCode',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'Đơn vị tính',
        keyName: 'uom',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'Số lượng yêu cầu',
        keyName: 'requestQuantity',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'Số lượng đã xuất kho',
        keyName: 'issuedQuantity',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'Số lượng cần xuất kho',
        keyName: 'unexportedQuantity',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'Số lượng thực xuất',
        keyName: 'actualQuantity',
        width: '200px',
        check: true,
      },
    ];
  }
  checkIsRole(role: string) {
    return this.checkRole.checkRole(role);
  }
  setBreadcrumb() {
    this.breadcrumbs = [
      {
        name: 'sidebar.export.name',
        route: ``,
      },
      {
        name: 'sidebar.export.child.ProceedToExport.name',
        route: `/export/new-GDN`,
      },
    ];
    this.isBreadcrumb = true;
  }

  setProductType(data: any) {
    if (data.exportType == 3) {
      this.selectedProductType = this.listProductType[0].text;
      for (let item of this.listProductType) {
        if (item.text != this.selectedProductType) {
          item.localCheck = false;
        } else {
          item.localCheck = true;
        }
      }
    } else if (data.exportType == 1) {
      this.selectedProductType = this.listProductType[1].text;
      for (let item of this.listProductType) {
        if (item.text != this.listProductType[0].text) {
          item.localCheck = true;
        } else {
          item.localCheck = false;
        }
      }
    } else {
      this.selectedProductType = '';
      for (let item of this.listProductType) {
        item.localCheck = true;
      }
    }
  }

  totalExportRequest: number = 0;
  pageExportRequest: number = 1;
  perPageExportRequest: number = 10;
  paginationExportRequest(event: any) {
    this.pageExportRequest = event.page;
    this.perPageExportRequest = event.size;
    this.getExportRequest();
  }
  async getExportRequest() {
    let data = {
      pageIndex: this.pageExportRequest - 1,
      pageSize: this.perPageExportRequest,
      filter: {
        exportRequestCode: this.dataFilterExportRequestCode.exportRequestCode,
        exportType: this.dataFilterExportRequestCode.exportType,
        warehouseCode: this.dataFilterExportRequestCode.warehouseCode,
        startAt: this.dataFilterExportRequestCode.startAt[0],
        startAt2: this.dataFilterExportRequestCode.startAt[1],
        endAt: this.dataFilterExportRequestCode.endAt[0],
        endAt2: this.dataFilterExportRequestCode.endAt[1],
        soCode: this.dataFilterExportRequestCode.soCode,
        customerCode: this.dataFilterExportRequestCode.customerCode,
        customerName: this.dataFilterExportRequestCode.customerName,
        woCode: this.dataFilterExportRequestCode.woCode,
        orderDate: this.dataFilterExportRequestCode.orderDate[0],
        orderDate2: this.dataFilterExportRequestCode.orderDate[1],
        deliveryAt: this.dataFilterExportRequestCode.deliveryAt[0],
        deliveryAt2: this.dataFilterExportRequestCode.deliveryAt[1],
        status: 1,
        note: this.dataFilterExportRequestCode.note,
        createdAt: this.dataFilterExportRequestCode.createdAt[0],
        createdAt2: this.dataFilterExportRequestCode.createdAt[1],
        createdBy: this.dataFilterExportRequestCode.createdBy,
        updatedAt: this.dataFilterExportRequestCode.updatedAt[0],
        updatedAt2: this.dataFilterExportRequestCode.updatedAt[1],
      },
      common: '',
    };
    let resp = await this.exportRequestService.listExportRequest(data);
    if (resp.result.responseCode == '00') {
      this.listExportRequestCode = resp.data.filter(
        (item: any) => item.status == 1
      );
      // this.listExportRequestCode = this.listExportRequestCode.map((obj) => ({
      //   ...obj,
      //   // fake
      //   soCode: "vvv1",
      //   customerName: "vvv2",
      //   productName: "vvv3",
      //   productCode: "vvv4",
      // }))
      this.totalExportRequest = resp.dataCount;
    }
  }

  async getWarehouse() {
    let resp = await this.commonService.getWarehouse();
    resp.data.forEach((element: any) => {
      let data = {
        text: element.warehouseName,
        value: element.warehouseCode,
      };
      this.listWarehouse.push(data);
    });
  }

  async getEmployee() {
    let res = await this.commonService.getListApprovedBy();
    this.listEmployee = res.data;
  }

  async readExportRequestCode(exportRequestCode: any) {
    let res = await this.exportRequestService.readExportRequest(
      exportRequestCode
    );
    if (res.result.responseCode == '00') {
      if (res.data.listItem.length == 0) {
        this.messageService.warning(`Không có hàng hóa`, `Cảnh báo`);
      } else {
        this.dataItems = res.data.listItem;
        this.dataItems = this.dataItems.filter(
          (item) => item?.unexportedQuantity > 0
        );
      }
    }

    this.calculateTotalActualQuantity();
    this.calculateTotalQuantityRequest();
    this.filteLocation();
  }

  async getTeamGroup() {
    let res = await this.commonService.getTeamGroup();
    if (res.result.responseCode == '00') {
      res.data.forEach((element: any) => {
        this.listTeamGroup.push({
          text: element.teamGroupName,
          value: element.teamGroupId,
        });
      });
    } else {
      this.messageService.warning(`${res.result.message}`, `Warning`);
    }
  }

  onHandlePopoverExportRequestCode() {
    this.showExportRequestCode = true;
  }

  onHandleVisiblePopoverExportRequestCode(event: any) {
    this.showExportRequestCode = event;
  }

  searchExportRequestCode($event: any) {
    if ($event.keyCode == 13) {
      this.getExportRequest();
    } else if ($event.type == 'click') {
      this.getExportRequest();
    }
  }

  searchFollowSelect() {}

  rangeDate() {}

  chooseRow(row: any) {
    console.log('row', row);
    this.showExportRequestCode = false;
    this.dataInformation = {
      ...row,
      exportRequestCode: row.exportRequestCode,
      exportType: row.exportType,
      lotId: row.lotId,
      receiverName: row.receiverName,
      lotNumber: row.lotNumber,
      warehouseCode: row.warehouseCode,
      customerCode: row.customerCode,
      customerAddress: row.customerAddress,
      customerPhone: row.customerPhone,
      startAt: row.startAt ? new Date(row.startAt) : '',
      endAt: row.endAt ? new Date(row.endAt) : '',
      orderDate: row.orderDate ? new Date(row.orderDate) : '',
      deliveryAt: row.deliveryAt ? new Date(row.deliveryAt) : '',
      customerName: row?.customerName || '',
      productCode: row?.productCode || '',
      productName: row?.productName || '',
      soCode: row?.soCode || '',
    };

    this.setProductType(this.dataInformation);

    if (this.dataInformation.exportRequestCode) {
      this.readExportRequestCode(this.dataInformation.exportRequestCode);
    }
  }

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

  calculateTotalActualQuantity() {
    this.countTotalActualQuantity = this.dataItems.reduce(
      (sum, item) => sum + parseFloat(item.actualQuantity),
      0
    );
  }

  calculateTotalQuantityRequest() {
    this.countTotalQuantityRequest = this.dataItems.reduce(
      (sum, item) => sum + parseFloat(item.requestQuantity),
      0
    );
  }

  clear(keyName: any) {
    this.dataFilterProduct[keyName] = '';
  }
  onHandleActualQuantity(row: any) {
    this.calculateTotalActualQuantity();
  }
  deleteRecord(row: any) {}

  close() {
    this.router.navigate(['./export/list-GDN']);
  }

  modalConfirmDraft: boolean = false;
  draft() {
    this.dataItems.forEach((element) => {
      if (element.exportPackageList !== undefined) {
        element.exportPackageList.forEach((ele: any) => {
          this.dataItemRequest.push(ele);
        });
      }
    });
    this.modalConfirmDraft = true;
  }

  onHandleModalCancelDraft(event: any) {
    this.modalConfirmDraft = event;
  }

  async onHandleModalConfirmDraft(event: any) {
    if (event) {
      let data = {
        gdnDTO: {
          gdnCode: '', //để trống là tạo mới, nếu không sẽ update
          exportRequestCode: this.dataInformation.exportRequestCode,
          exportType: this.dataInformation.exportType,
          warehouseCode: this.dataInformation.warehouseCode,
          customerCode: this.dataInformation.customerCode,
          status: 0,
          receiverName: this.dataInformation.receiverName,
          approverName: this.dataApprovedBy.approverName,
          approverCode: this.dataApprovedBy.approverCode,
          woCode: this.dataInformation.woCode,
          note: this.dataInformation.note,
          exportTypeId: this.dataInformation.exportTypeId,
        },
        listItem: this.dataItemRequest,
      };
      let resp = await this.gdnService.draftGDN(data);
      if (resp.result.responseCode == '00') {
        this.messageService.success(`${resp.result.message}`, `Thành công`);
        this.router.navigate(['./export/list-GDN']);
        this.modalConfirmDraft = false;
      } else {
        this.messageService.error(`${resp.result.message}`, `Lỗi`);
      }
    }
  }

  titleConfirm = 'Bạn có muốn tạo phiếu xuất kho';
  modalConfirmSave: boolean = false;
  async save() {
    try {
      if (!this.dataInformation.exportRequestCode) {
        this.messageService.warning(
          `Bạn phải chọn mã yêu cầu xuất kho`,
          `Cảnh báo`
        );
      } else {
        if (this.dataItems.length <= 0) {
          this.messageService.warning(`Không có hàng hóa`, `Cảnh báo`);
        } else {
          let check: boolean = false;
          let checkActualQUantity: boolean = false;
          for (let element of this.dataItems) {
            if (
              element?.exportPackageList &&
              element?.exportPackageList?.length > 0
            ) {
              check = true;
              if (element.actualQuantity > element.unexportedQuantity)
                checkActualQUantity = true;
              if (element.actualQuantity <= 0) {
                this.messageService.warning(
                  `Số lượng thực xuất phải lớn hơn 0`,
                  `Cảnh báo`
                );
                return;
              } else {
                for (let chill of element.exportPackageList) {
                  if (chill.exportPackageQuantity <= 0) {
                    this.messageService.warning(
                      `Vui lòng nhập SL kiện hàng và SL hàng mỗi kiện lớn hơn 0`,
                      ` Thông báo`
                    );
                    return;
                  }
                  if (!chill?.isValid) {
                    this.messageService.warning(
                      `${
                        chill?.validationMessage || 'Vượt quá số lượng tồn kho'
                      } `,
                      ` Thông báo`
                    );
                    return;
                  }
                }
              }
            }
          }
          if (check) {
            if (checkActualQUantity) {
              this.titleConfirm =
                'Số lượng thực xuất đang lớn hơn số lượng cần xuất. Bạn có chắc chắn muốn tạo phiếu xuất kho';
            } else {
              this.titleConfirm = 'Bạn có muốn tạo phiếu xuất kho';
            }
            this.modalConfirmSave = true;
          } else {
            this.messageService.warning(
              `Vui lòng gán vị trí cho ít nhất một hàng hóa`,
              `Thông báo`
            );
          }
        }
      }
    } catch (error) {
      this.messageService.error('Có lỗi xảy ra, vui lòng thử lại sau', 'Lỗi');
    } finally {
      this.loading.stop();
    }
  }

  async createGdn() {
    try {
      this.loading.start();
      this.dataItems.forEach((element) => {
        if (
          element?.exportPackageList &&
          element?.exportPackageList?.length > 0
        ) {
          element.exportPackageList.forEach((ele: any) => {
            this.dataItemRequest.push({
              ...ele,
              warehouseCode: element?.warehouseCode,
              requestQuantity: element?.requestQuantity,
              issuedQuantity: element?.issuedQuantity,
              unexportedQuantity: element?.unexportedQuantity,
            });
          });
        }
      });
      let data = {
        // exportType: this.exportPurpose,
        gdnDTO: {
          ...this.dataInformation,
          gdnCode: '', //để trống là tạo mới, nếu không sẽ update
          woCode: this.dataInformation.woCode,
          exportRequestCode: this.dataInformation.exportRequestCode,
          exportType: this.dataInformation.exportType,
          warehouseCode: this.dataInformation.warehouseCode,
          // customerCode: this.dataInformation.customerCode,
          shipperName: this.dataInformation.shipper,
          shipperCode: this.dataInformation.shipperCode,
          deliveryAt: this.dataInformation.deliveryAt
            ? new Date(this.dataInformation.deliveryAt)
            : '',
          // status: 1,
          receiverName: this.dataInformation.receiverName,
          // soCode: this.dataInformation.soCode,
          // approverName: this.dataApprovedBy.approverName,
          // approverCode: this.dataApprovedBy.approverCode,
          note: this.dataInformation.note,
          exportTypeId: this.dataInformation.exportTypeId,
          productType: this.selectedProductType,
        },
        listItem: this.transformDataItemRequest(this.dataItems),
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
      let resp = await this.gdnService.postGDN(formData);
      if (resp.result.responseCode == '00') {
        this.loading.stop();
        this.messageService.success(`${resp.result.message}`, `Thành công`);
        this.router.navigate(['./export/list-GDN']);
      } else {
        this.loading.stop();
        this.messageService.warning(`${resp.result.message}`, `Cảnh báo`);
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

  transformDataItemRequest(dataItems: any[]) {
    if (!dataItems || dataItems.length === 0) return { listItem: [] };

    let finalListItem: any[] = [];

    dataItems.map((item) => {
      let warehouseInformation = item?.exportPackageList;
      if (warehouseInformation && warehouseInformation?.length > 0) {
        finalListItem.push({
          itemCode: item.itemCode,
          itemName: item.itemName,
          warehouseCode: item.warehouseCode,
          requestQuantity: item.requestQuantity,
          issuedQuantity: item.issuedQuantity,
          unexportedQuantity: item.unexportedQuantity,
          actualQuantity: item?.actualQuantity,
          locationList: warehouseInformation.map((warehouseItem: any) => ({
            warehouseCode: item.warehouseCode,
            locationCode: warehouseItem.locationCode,
            locationName: warehouseItem.locationName,
            itemQuantity: warehouseItem.itemQuantity,
            packageQuantity: warehouseItem.packageQuantity,
          })),
        });
      }
    });

    return finalListItem;
  }

  //   return finalListItem;
  // }

  dataItemRequest: any[] = [];

  onHandleCancel() {
    this.showApproveBy = false;
  }

  showPopoverEmployee() {}
  popoverVisibleChangeEmployee(event: any) {
    this.showEmployee = event;
  }
  search() {}
  chooseEmployeeExport(row: any) {
    this.showEmployee = false;
    this.dataApprovedBy = {
      approverCode: row.employeeCode,
      approverName: row.employeeName,
    };
  }
  async onHandleSaveEmployee() {
    if (!this.dataApprovedBy.approverCode) {
      this.messageService.warning(` Bạn phải chọn người duyệt`, ` Cảnh báo`);
    } else {
      let data = {
        gdnDTO: {
          gdnCode: '', //để trống là tạo mới, nếu không sẽ update
          woCode: this.dataInformation.woCode,
          exportRequestCode: this.dataInformation.exportRequestCode,
          exportType: this.dataInformation.exportType,
          warehouseCode: this.dataInformation.warehouseCode,
          customerCode: this.dataInformation.customerCode,
          status: 1,
          receiverName: this.dataInformation.receiverName,
          soCode: this.dataInformation.soCode,
          approverName: this.dataApprovedBy.approverName,
          approverCode: this.dataApprovedBy.approverCode,
          note: this.dataInformation.note,
          exportTypeId: this.dataInformation.exportTypeId,
        },
        listItem: this.dataItemRequest,
      };

      let resp = await this.gdnService.newGDN(data);
      if (resp.result.responseCode == '00') {
        this.messageService.success(`${resp.result.message}`, `Thành công`);
        this.router.navigate(['./export/list-GDN']);
      } else {
        this.messageService.warning(`${resp.result.message}`, `Cảnh báo`);
      }
    }
  }
  expandSet = new Set<number>();
  isExpand: boolean = false;

  rowSelect: any = {};
  onClickIcon(element: any) {
    this.rowSelect = element;
    if (this.expandSet.has(element.id)) {
      this.expandSet.delete(element.id);
    } else {
      this.expandSet.add(element.id);
    }
  }

  showShipper: boolean = false;
  listShipper: any[] = [];
  searchShipper: any = {};
  clearSearchShipper(keyName: string) {
    this.searchShipper[keyName] = '';
    this.getListShipper();
  }
  async getListShipper() {
    let dataRequest = {
      pageNumber: 0,
      pageSize: 0,
      filter: {
        receiverCode: this.searchShipper.receiverCode,
        receiverNode: this.searchShipper.receiverNode,
      },
      common: '',
      sortProperty: 'id',
      sortOrder: 'DESC',
    };
    let res = await this.exportRequestService.getListReceiver(dataRequest);
    if (res) {
      if (res.result.responseCode == '00') {
        this.listShipper = res.data;
        this.totalShipper = res.dataCount;
      } else {
        this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
      }
    } else {
      this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
    }
  }
  searchShipperFunc($event: any) {
    if ($event.keyCode == 13) {
      this.getListShipper();
    } else if ($event.type == 'click') {
      this.getListShipper();
    }
  }
  showShipperList() {
    this.showShipper = true;
  }

  changeShipperPopover(event: any) {
    this.showShipper = event;
  }
  selectShipper(row: any) {
    this.dataInformation.shipperCode = row.receiverCode;
    this.dataInformation.shipper = row.receiverName;
    this.showShipper = false;
  }

  pageShipper: number = 1;
  perPageShipper: number = 10;
  totalShipper: number = 0;
  paginationShipper(event: any) {
    this.pageShipper = event.page;
    this.perPageShipper = event.size;
    this.getListShipper();
  }

  listOfRadioButton: string[] = ['button.detail', 'button.documentConfirm'];
  choose: number = 0;
  changeSelect(event: any) {
    this.choose = event;
  }

  showUploadFile: boolean = false;
  onClickAddNew() {
    this.showUploadFile = true;
  }

  cancelUploadFile() {
    this.showUploadFile = false;
  }

  listFile: any[] = [];

  onFileChangeShowUpload(event: any) {
    this.listFile = event;
  }

  deleteFile(row: any) {
    this.listFile = this.listFile.filter((item) => item.name !== row.name);
  }
  listFileReport: any[] = [];

  onResizeFile({ width }: NzResizeEvent, col: any): void {
    this.columnFile = this.columnFile.map((e) =>
      e.keyTitle === col.keyTitle ? { ...e, width: `${width}px` } : e
    );
  }
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
  lastObject(obj: any) {
    if (obj == this.columns[this.columns.length - 1]) {
      return false;
    } else {
      return true;
    }
  }

  listOfLocation: any[] = []; // Danh sách vị trí kho
  listCurrentLocation: any[] = []; // Danh sách vị trí hiện tại
  // Lấy danh sách vị trí kho
  getListLocation() {
    this.loading.start();
    this.gdnService
      .getListLocation({
        pageIndex: 0,
        pageSize: 0,
        common: '',
        sortProperty: 'createdAt',
        sortOrder: 'ASC',
        filter: {
          parent: 0,
        },
      })
      .then((response) => {
        if (response.result.responseCode == '00') {
          this.listOfLocation = response.data;
        } else {
          this.messageService.error('Lấy dữ liệu vị trí kho', 'Lỗi');
        }
      })
      .finally(() => {
        this.loading.stop();
      });
  }

  filteLocation() {
    this.dataItems.forEach((item) => this.expandSet.add(item.id));
  }

  onLocationChange() {
    this.expandSet.clear();
  }

  ngOnDestroy(): void {
    this.transferData.setInformationExportMaterial({});
    this.dataInformation = {};
  }
}
