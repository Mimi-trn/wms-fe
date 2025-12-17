import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CheckRoleService } from 'src/app/services/checkRole.service';
import { InventoryService } from 'src/app/services/manage-inventory/inventory.service';
import jwt_decode from 'jwt-decode';
import { MessageService } from 'src/app/services/message.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-read-inventory-sheet',
  templateUrl: './read-inventory-sheet.component.html',
  styleUrls: ['./read-inventory-sheet.component.css'],
})
export class ReadInventorySheetComponent implements OnInit {
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private inventoryService: InventoryService,
    private loading: NgxUiLoaderService,
    private checkRole: CheckRoleService,
    private keycloakService: KeycloakService,
    private message: MessageService
  ) {
    let encodedToken;
    this.getToken().then(() => {
      encodedToken = this.getDecodedAccessToken(this.token);
      this.checkGroupsInTokenKeeper =
        encodedToken.groups.includes('/WMS_GROUP_KEEPER');
      this.checkGroupsInTokenChiefAccountant = encodedToken.groups.includes(
        '/WMS_GROUP_CHIEF-ACCOUNTANT'
      );
      this.checkGroupsInTokenWarehouseManager = encodedToken.groups.includes(
        '/WMS_GROUP_WAREHOUSE-MANAGER'
      );
      this.checkGroupsInTokenAdmin =
        encodedToken.groups.includes('/WMS_GROUP_ADMIN');
      this.checkGroupsInFcimAdmin = encodedToken.groups.includes('/FCIM_ADMIN');
    });
  }
  token: any = {};
  checkGroupsInTokenKeeper: boolean = false;
  checkGroupsInTokenChiefAccountant: boolean = false;
  checkGroupsInTokenWarehouseManager: boolean = false;
  checkGroupsInTokenAdmin: boolean = false;
  checkGroupsInFcimAdmin: boolean = false;
  getDecodedAccessToken(token: string): any {
    try {
      return jwt_decode(token);
    } catch (Error) {
      return null;
    }
  }

  async getToken() {
    this.token = await this.keycloakService.getToken();
  }

  checkIsRole(role: string) {
    return this.checkRole.checkRole(role);
  }

  isBreadcrumb: boolean = false;
  isHidden: boolean = true;
  breadcrumbs: Object[] = [];
  params = this.activatedRoute.snapshot.params['id'];
  messageRefuse: string = '';
  messageRevoke: string = '';
  dataInformation: any = {};
  listParticipants: any[] = [];
  listParticipantsFromDB: any[] = [];
  filterParticipants: any = {};
  filterParticipantsFromDB: any = {};
  filterInventoryClient: any = {};
  checked = false;
  indeterminate = false;
  listOfCurrentPageData: readonly any[] = [];
  setOfCheckedId = new Set<any>();
  showListParticipants: boolean = false;
  pageItem: number = 1;
  perPageItem: number = 10;
  totalItem: number = 0;
  ngOnInit() {
    this.setBreadcrumb();
    this.getListWarehouse();
    this.onHandleFetchData().then(() => {
      this.getListItemWithInventoryFormCode();
    });
    this.onHandleGetListParticipant();

  }
  async getListItemWithInventoryFormCode() {
    let dataRequest = {
      pageIndex: 0,
      pageSize: 0,
      common: '',
      filter: {
        id: null,
        productCode: null,
        itemName: null,
        description: null,
        uom: null,
        inventoryFormCode: this.dataInformation.inventoryFormCode,
        inventoryStatus: null,
      },
      sortOrder: 'DESC',
      sortProperty: 'createdAt',
    };
    let res = await this.inventoryService.getListItemWithInventoryFormCode(
      dataRequest
    );
    if (res.result.responseCode == '00') {
      this.listItems = res.data.map((item: any) => ({
        ...item,
        diffQuantity: item.auditQuantity - item.remainQuantity,
      }));

      console.log("items: ", this.listItems);

      this.onHandleTotalRemainQuantity();
      this.onHandleTotalDiffQuantity();
      this.onHandleTotalauditQuantity();
    }
  }

  async onHandleFetchData() {
    this.loading.start();
    let dataRequest = {
      pageIndex: 0,
      pageSize: 0,
      common: '',
      filter: {
        inventoryFormCode: this.params,
      },
      sortOrder: '',
      sortProperty: '',
    };
    let res = await this.inventoryService.getListInventorySheet(dataRequest);
    if (res.result.responseCode == '00') {
      this.loading.stop();
      this.dataInformation = res.data[0];
      if (this.dataInformation.participants) {
        this.listParticipants = this.dataInformation.participants;
      }
      this.listParticipants.forEach((item) => {
        this.setOfCheckedId.add(item.id);
      });
      if (this.dataInformation.refusalReason) {
        this.messageRefuse = this.dataInformation.refusalReason;
      }
      if (this.dataInformation.recallReason) {
        this.messageRevoke = this.dataInformation.recallReason;
      }
    } else {
      this.loading.stop();
    }
  }

  async getListWarehouse() {
    let dataRequest = {
      pageIndex: 0,
      pageSize: 0,
      common: '',
      filter: {
        warehouseId: null,
        warehouseCode: null,
        warehouseName: null,
        description: null,
        status: null,
      },
      sortOrder: 'DESC',
      sortProperty: 'createdAt',
    };
    let res = await this.inventoryService.getListWarehouse(dataRequest);
    if (res.result.responseCode == '00') {
      this.listWarehouse = res.data;
    }
  }

  async onHandleGetListParticipant() {
    let dataRequest = {
      pageNumber: this.pageItem - 1,
      pageSize: this.perPageItem,
      common: '',
      sortProperty: null,
      sortOrder: 'DESC',
      filter: {
        employeeCode: this.filterParticipantsFromDB.employeeCode,
        employeeName: this.filterParticipantsFromDB.employeeName,
        teamGroup: this.filterParticipantsFromDB.teamGroup,
        employeePhone: this.filterParticipantsFromDB.employeePhone,
        employeeEmail: this.filterParticipantsFromDB.employeeEmail,
      },
    };
    let res = await this.inventoryService.getListParticipant(dataRequest);
    if (res.result.responseCode == '00') {
      this.listParticipantsFromDB = res.data;
      this.totalItem = res.dataCount;
    }
  }
  onHandlePagination(event: any) {
    this.pageItem = event.page;
    this.perPageItem = event.size;
    this.onHandleGetListParticipant();
  }
  onHandleEnterSearchItem($event: any) {
    if ($event.keyCode == 13) {
      this.onHandleGetListParticipant();
    }
  }
  onHandleSearchItem() {
    this.onHandleGetListParticipant();
  }
  onHandleClearInputServer(keyName: string) {
    this.filterParticipantsFromDB[keyName] = '';
    this.onHandleGetListParticipant();
  }
  onHandleDeleteItem(row: any) {
    this.updateCheckedSet(row.id, false);
    this.refreshCheckedStatus();
  }

  updateCheckedSet(id: any, checked: boolean): void {
    let arrTemp: any[] = [];

    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
      arrTemp = arrTemp.filter((element: any) => {
        return element.id != id;
      });
    }

    this.setOfCheckedId.forEach((element) => {
      this.listParticipantsFromDB.forEach((item) => {
        if (
          item.id == element &&
          !arrTemp.find((ele: any) => {
            return ele.id == element;
          })
        ) {
          arrTemp.push({
            ...item,
            employeeName: item.employeeName,
            employeeCode: item.employeeCode,
            employeeEmail: item.employeeEmail,
            employeePhone: item.employeePhone,
          });
        }
      });
    });
    console.log(arrTemp);

    this.listParticipants = arrTemp;
  }

  onItemChecked(item: any, checked: boolean): void {
    console.log(item);

    this.updateCheckedSet(item.id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(value: boolean): void {
    this.listOfCurrentPageData.forEach((item) => {
      this.updateCheckedSet(item.id, value);
    });
    this.refreshCheckedStatus();
  }

  onCurrentPageDataChange($event: readonly any[]): void {
    this.listOfCurrentPageData = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfCurrentPageData.every((item) =>
      this.setOfCheckedId.has(item.id)
    );
    this.indeterminate =
      this.listOfCurrentPageData.some((item) =>
        this.setOfCheckedId.has(item.id)
      ) && !this.checked;
  }
  onHandleClose() {
    this.router.navigate(['./manage-inventory/inventory-sheet-list']);
  }
  openListParticipant() {
    this.showListParticipants = true;
  }
  closeListParticipant(event: any) {
    this.showListParticipants = event;
  }

  idPar = -1;
  onResizeParticipant({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.idPar);
    this.idPar = requestAnimationFrame(() => {
      this.columnParticipants[i].width = width + 'px';
    });
  }
  idParFromDB = -1;
  onResizeParticipantFromDB({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.idParFromDB);
    this.idParFromDB = requestAnimationFrame(() => {
      this.columnParticipantsFromDB[i].width = width + 'px';
    });
  }
  id = -1;
  onResize({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.columns[i].width = width + 'px';
    });
  }

  changeauditQuantity(event: any, row: any) {
    row.diffQuantity = row.auditQuantity - row.remainQuantity;
    this.onHandleTotalDiffQuantity();
    this.onHandleTotalauditQuantity();
  }

  totalRemainQuantity: number = 0;
  onHandleTotalRemainQuantity() {
    this.totalRemainQuantity = this.listItems.reduce(
      (sum, item) => sum + parseFloat(item.remainQuantity),
      0
    );
  }
  totalauditQuantity: number = 0;
  onHandleTotalauditQuantity() {
    this.totalauditQuantity = this.listItems.reduce(
      (sum, item) => sum + parseFloat(item.auditQuantity),
      0
    );
  }
  totalDiffQuantity: number = 0;
  onHandleTotalDiffQuantity() {
    this.totalDiffQuantity = this.listItems.reduce(
      (sum, item) => sum + parseFloat(item.diffQuantity),
      0
    );
  }

  // Gửi duyệt
  async sendInventory() {

    let dataRequest = {
      id: this.dataInformation.id,
      recallReason: '',
      refusalReason: '',
      conclusion: this.dataInformation.conclusion,
    };
    let res = await this.inventoryService.changeStatusInventorySheet(
      dataRequest,
      2
    );
    if (res.result.responseCode == '00') {
      this.message.success(`${res.result.message}`, ` Thông báo`);
      this.router.navigate(['./manage-inventory/inventory-sheet-list']);
    } else {
      this.message.warning(`${res.result.message}`, ` Thông báo`);
    }
  }
  // Phê duyệt
  isOpenConfirmApproval: boolean = false;
  approval() {
    this.isOpenConfirmApproval = true;
  }
  async onConfirmOrderProcessing() {
    let dataRequest = {
      id: this.dataInformation.id,
      recallReason: '',
      refusalReason: '',
      conclusion: this.dataInformation.conclusion,
    };
    let res = await this.inventoryService.changeStatusInventorySheet(
      dataRequest,
      3
    );
    if (res.result.responseCode == 0) {
      this.router.navigate(['./manage-inventory/inventory-sheet-list']);
      this.onHandleFetchData();
    }
  }
  revoke() {
    this.visibleRevoke = true;
  }
  visibleRefusal: boolean = false;
  refuse() {
    this.visibleRefusal = true;
  }
  isShowPopupConfirmRefusal: boolean = false;
  onHandleCancelReasonRefusal() {
    this.isShowPopupConfirmRefusal = true;
  }
  onHandleCloseModalRefusal(data: any) {
    if (!data) {
      this.visibleRefusal = data;
      this.router.navigate(['./manage-inventory/inventory-sheet-list']);
    }
  }
  onHandleCloseModalRevoke(data: any) {
    if (!data) {
      this.visibleRevoke = data;
      this.router.navigate(['./manage-inventory/inventory-sheet-list']);
    }
  }
  isShowPopupConfirmRevoke: boolean = false;
  onHandleCancelReason() {
    this.isShowPopupConfirmRevoke = true;
  }
  onHandleCancelPopup(event: any) {
    this.isShowPopupConfirmRevoke = event;
  }
  visibleRevoke: boolean = false;
  onHandleConfirmPopup(event: any) {
    this.visibleRevoke = event;
  }
  onHandleConfirmPopupRefusal(event: any) {
    this.visibleRefusal = event;
  }
  onHandleCancelPopupRefusal(event: any) {
    this.isShowPopupConfirmRefusal = event;
  }

  setBreadcrumb() {
    this.breadcrumbs = [
      {
        name: 'Quản lý kiểm kê kho',
        route: ``,
      },
      {
        name: 'Danh sách phiếu kiểm kê',
        route: `/manage-inventory/inventory-sheet-list`,
      },
      {
        name: 'Xem chi tiết phiếu kiểm kê',
        route: ``,
      },
    ];
    this.isBreadcrumb = true;
  }
  listStatus: any[] = [
    {
      value: 0,
      label: 'Bản nháp',
    },
    {
      value: 1,
      label: 'Từ chối',
    },
    {
      value: 2,
      label: 'Chờ xử lý',
    },
    {
      value: 3,
      label: 'Đã xử lý',
    },
  ];
  listInventoryType = [
    {
      text: 'Kiểm kê định kỳ',
      value: 0,
    },
    {
      text: 'Kiểm kê hàng tuần',
      value: 1,
    },
    {
      text: 'Kiểm kê hàng ngày',
      value: 2,
    },
    {
      text: 'Kiểm kê hàng tháng',
      value: 3,
    },
    {
      text: 'Kiểm kê hàng quý',
      value: 4,
    },
    {
      text: 'Kiểm kê hàng năm',
      value: 5,
    },
  ];
  listWarehouse: any[] = [];
  columns: any[] = [
    {
      keyTitle: 'listProduct.productCode',
      keyName: 'productCode',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'listProduct.productName',
      keyName: 'itemName',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'listProduct.description',
      keyName: 'description',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'listProduct.uom',
      keyName: 'uom',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'listProduct.inventory.remainQuantity',
      keyName: 'remainQuantity',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'Số lượng kiểm kê thực tế',
      keyName: 'auditQuantity',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'Số lượng chênh lệch',
      keyName: 'diffQuantity',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },

  ];
  columnParticipants: any[] = [
    {
      keyTitle: 'Mã nhân viên',
      keyName: 'employeeCode',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'Tên nhân viên',
      keyName: 'employeeName',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'Vị trí',
      keyName: 'employeePosition',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'Số điện thoại',
      keyName: 'employeePhone',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'Mail',
      keyName: 'employeeEmail',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
  ];

  columnParticipantsFromDB: any[] = [
    {
      keyTitle: 'Mã nhân viên',
      keyName: 'employeeCode',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'Tên nhân viên',
      keyName: 'employeeName',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'Vị trí',
      keyName: 'employeePosition',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'Số điện thoại',
      keyName: 'employeePhone',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'Mail',
      keyName: 'employeeEmail',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
  ];
  listItems: any[] = [];

  dataItems: any[] = [];
  dataEmployees: any[] = [];

  show() {
    const pdfContent = document.getElementById('pdf-content');
    if (pdfContent) {
      pdfContent.style.display = 'block';
    }
  }

  hide() {
    const pdfContent = document.getElementById('pdf-content');
    if (pdfContent) {
      pdfContent.style.display = 'none';
    }
  }

  exportPDF() {
    this.loading.start();
    const el = document.getElementById('pdf-content');

    html2canvas(el!, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = canvas.height * imgWidth / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`InventoryRequest_${this.params}.pdf`);
    });

    this.loading.stop();
  }

}
