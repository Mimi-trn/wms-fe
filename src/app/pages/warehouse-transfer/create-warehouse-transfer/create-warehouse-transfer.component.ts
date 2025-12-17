import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { KeycloakService } from 'keycloak-angular';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CheckRoleService } from 'src/app/services/checkRole.service';
import { CommonService } from 'src/app/services/export-warehouse/commonService.service';
import { ExportRequestService } from 'src/app/services/export-warehouse/exportRequestService.service';
import { SoService } from 'src/app/services/manage-information/so/so.service';
import { MessageService } from 'src/app/services/message.service';
import { TransferDataService } from 'src/app/services/transferData.service';
import { WarehouseTransferService } from 'src/app/services/warehouse-transfer/warehouse-transfer.service';
@Component({
  selector: 'app-create-warehouse-transfer',
  templateUrl: './create-warehouse-transfer.component.html',
  styleUrls: ['./create-warehouse-transfer.component.css'],
})
export class CreateWarehouseTransferComponent implements OnInit {
  isBreadcrumb: boolean = false;
  isHidden: boolean = true;
  breadcrumbs: Object[] = [];
  dataInformation: any = {};
  listWarehouse: any[] = [];
  dataFilterReceiverCode: any = {};

  totalReceiver: any = 0;
  pageReceiver: any = 1;
  perPageReceiver: any = 10;
  // Đơn hàng
  showProductOrderCode: boolean = false;
  listProductOrderCode: any[] = [];
  dataFilterProductOrderCode: any = {};
  totalProductOrderCode: any = 100;
  pageProductOrderCode: any = 1;
  perPageProductOrderCode: any = 10;
  // Danh sách hàng hóa
  columns: any[] = [];
  columnsyc: any[] = [];
  dataItems: any[] = [];
  countTotalQuantityUnexported: number = 0;
  countTotalQuantityRequest: number = 0;
  countTotalQuantityOpen: number = 0;
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

  // Kiểm tra tồn tại quyền
  token: any = '';
  checkGroupsInTokenQCER: boolean = false;
  checkGroupsInTokenSaler: boolean = false;
  checkGroupsInTokenKeeper: boolean = false;
  checkGroupsInTokenAdmin: boolean = false;
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
    private soService: SoService,
    private warehouseTransferService: WarehouseTransferService
  ) { }

  checkIsRole(role: string) {
    return this.checkRole.checkRole(role);
  }

  ngOnInit() {
    let data = this.transferData.getObj();
    if (Object.keys(data).length > 0) {
      this.dataInformation = data;
    }
    this.activatedRoute.queryParams.subscribe((params: any) => {
      this.transferRequestCode = params.transferRequestCode;
    });
    this.setBreadcrumb();
    this.getListReceiver();
    this.getWarehouse();
    this.getWtrRequest();
    if (this.transferRequestCode) {
      this.getDetailWtrRequest();
    }
    this.calculateTotalQuantityRequest();
    this.calculateTotalQuantityUnexported();
    this.calculateTotalQuantityRemain();
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
        keyTitle: 'Kho nguồn',
        keyName: 'fromWarehouseCode',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'Kho đích',
        keyName: 'toWarehouseCode',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'Đơn vị tính',
        keyName: 'unit',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'SL yêu cầu',
        keyName: 'requestQuantity',
        width: '120px',
        check: true,
      },
      {
        keyTitle: 'SL đã chuyển',
        keyName: 'transferedQuantity',
        width: '150px',
        check: true,
      },
      {
        keyTitle: 'SL cần chuyển',
        keyName: 'openQuantity',
        width: '150px',
        check: true,
      },
      {
        keyTitle: 'SL thực chuyển',
        keyName: 'actualQuantity',
        width: '150px',
        check: true,
      },
    ];
    this.columnsyc = [
      {
        keyTitle: 'Mã yêu cầu chuyển kho',
        keyName: 'transferRequestCode',
        width: '200px',
        check: true,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'kho nguồn',
        keyName: 'fromWarehouseCode',
        width: '200px',
        check: true,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'kho đích',
        keyName: 'toWarehouseCode',
        width: '200px',
        check: true,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'sidebar.transfer.child.transferRequest.child.createdAt',
        keyName: 'createdAt',
        width: '200px',
        check: false,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'Người gửi',
        keyName: 'sender',
        width: '200px',
        check: true,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'Người nhận',
        keyName: 'receiver',
        width: '200px',
        check: true,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'Mô tả',
        keyName: 'wtrTypeId',
        width: '200px',
        check: true,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'sidebar.transfer.child.transferRequest.child.note',
        keyName: 'note',
        width: '200px',
        check: true,
        count: 0,
        sortOrder: '',
      },
    ];
  }

  setBreadcrumb() {
    this.breadcrumbs = [
      {
        name: 'sidebar.transfer.name',
        route: ``,
      },
      {
        name: 'Tiến hành chuyển kho',
        route: `/warehouse-transfer/create-warehouse-transfer`,
      },
    ];
    this.isBreadcrumb = true;
  }

  async getWarehouse() {
    let res = await this.commonService.getWarehouse();
    if (res) {
      if (res.result.responseCode == '00') {
        res.data.forEach((element: any) => {
          let data = {
            text: element.warehouseName,
            value: element.warehouseCode,
          };
          this.listWarehouse.push(data);
        });
      } else {
        this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
      }
    } else {
      this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
    }
  }

  listReceiver: any[] = [];
  async getListReceiver() {
    let dataRequest = {
      pageNumber: this.pageReceiver - 1,
      pageSize: this.perPageReceiver,
      filter: {
        receiverCode: this.dataFilterReceiverCode.receiverCode,
        receiverNode: this.dataFilterReceiverCode.receiverNode,
      },
      common: '',
      sortProperty: 'id',
      sortOrder: 'DESC',
    };
    let res = await this.exportRequestService.getListReceiver(dataRequest);
    if (res) {
      if (res.result.responseCode == '00') {
        console.log(res.data);

        this.listReceiver = res.data;
        this.totalReceiver = res.dataCount;
      } else {
        this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
      }
    } else {
      this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
    }
  }

  showReceiver: boolean = false;
  showReceiverList() {
    this.showReceiver = true;
    this.paginationReceiver({ page: 1, size: 10 });
  }
  showSender: boolean = false;
  showSenderList() {
    this.showSender = true;
    this.paginationReceiver({ page: 1, size: 10 });
  }
  isSender = true;
  popoverVisibleChangeReceiver(event: any) {
    this.showReceiver = event;
    this.isSender = false;
  }
  popoverVisibleChangeSender(event: any) {
    this.showSender = event;
    this.isSender = true;
  }

  filterSearchReceiver($event: any) {
    if ($event.keyCode == 13) {
      this.getListReceiver();
    } else if ($event.type == 'click') {
      this.getListReceiver();
    }
  }

  chooseReceiver(data: any) {
    if (this.isSender) {
      this.dataInformation.senderCode = data.receiverCode;
      this.showSender = false;
      this.dataInformation.senderName = data.receiverName;
    } else {
      this.dataInformation.receiverCode = data.receiverCode;
      this.showReceiver = false;
      this.dataInformation.receiverName = data.receiverName;
    }
  }

  paginationReceiver(event: any) {
    this.pageReceiver = event.page;
    this.perPageReceiver = event.size;
    this.getListReceiver();
  }
  id = -1;
  onResize({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.columns[i].width = width + 'px';
    });
  }

  calculateTotalQuantityUnexported() {
    this.countTotalQuantityUnexported = this.dataItems.reduce(
      (sum, item) => sum + parseFloat(item.unexportedQuantity),
      0
    );
  }
  countTotalQuantityRemain: number = 0;
  calculateTotalQuantityRemain() {
    this.countTotalQuantityRemain = this.dataItems.reduce(
      (sum, item) => sum + parseFloat(item.remainQuantity),
      0
    );
  }

  calculateTotalQuantityRequest() {
    this.countTotalQuantityRequest = this.dataItems.reduce(
      (sum, item) => sum + parseFloat(item.requestQuantity),
      0
    );
  }
  countTotalQuantityRequestItemsProduct: number = 0;
  calculateTotalQuantityRequestItemsProduct() {
    this.countTotalQuantityRequest = this.dataItems.reduce(
      (sum, item) => sum + parseFloat(item.requestQuantity),
      0
    );
  }

  clear(keyName: any) {
    this.dataFilterProduct[keyName] = '';
  }

  onHandleQuantityRequest(row: any) {
    this.calculateTotalQuantityRequest();
  }

  onHandleVisiblePopup() {
    this.visiblePopup = true;
  }

  changeVisible(event: any) {
    this.visiblePopup = event;
  }

  updateCheckedSet(id: any, checked: boolean): void {
    let arrTemp: any[] = [];
    arrTemp = JSON.parse(JSON.stringify(this.dataItems));
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
      arrTemp = arrTemp.filter((element: any) => {
        return element.id != id;
      });
    }
    this.setOfCheckedId.forEach((element) => {
      this.listItem.forEach((item) => {
        if (
          item.id == element &&
          !arrTemp.find((ele: any) => {
            return ele.id == element;
          })
        ) {
          arrTemp.push({
            id: item.id,
            productCode: item.productCode,
            itemName: item.itemName,
            description: item.itemName,
            unit: item.uom,
            unexportedQuantity: item.unexportedQuantity,
            remainQuantity: item.remainQuantity,
            // requestQuantity: 0,
            requestQuantity: item.unexportedQuantity,
          });
        }
      });
    });
    this.dataItems = arrTemp;
    this.calculateTotalQuantityUnexported();
    this.calculateTotalQuantityRequest();
    this.calculateTotalQuantityRemain();
  }

  clickRow(item: any) {
    item.rowCheck = !item.rowCheck;
    this.updateCheckedSet(item.id, item.rowCheck);
    this.refreshCheckedStatus();
  }

  onItemChecked(item: any, checked: boolean): void {
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

  close() {
    this.router.navigate(['./warehouse-transfer/list-warehouse-transfer']);
  }
  modalConfirmSave: boolean = false;
  titleConfirm = 'Tạo phiếu chuyển kho';
  async save() {
    if (
      !this.dataInformation.fromWarehouseCode ||
      !this.dataInformation.toWarehouseCode ||
      !this.dataInformation.transferDate ||
      !this.dataInformation.receivedDate ||
      !this.dataInformation.senderName ||
      !this.dataInformation.receiverName 
    ) {
      this.messageService.warning(`Vui lòng nhập đầy đủ thông tin`, `Cảnh báo`);
      return;
    } else if (this.dataItems.length <= 0) {
      this.messageService.warning('Danh sách hàng hóa rỗng', `Cảnh báo`);
    } else {
      let check = false;
      let checkQuantity = false;
      for (let element of this.dataItems) {
        if (
          (element?.listFromWarehouse &&
            element?.listFromWarehouse.length > 0) ||
          (element?.listToWarehouse && element?.listToWarehouse.length > 0)
        ) {
          check = true;
          if (
            !element?.listFromWarehouse ||
            element?.listFromWarehouse.length <= 0
          ) {
            this.messageService.warning(
              'Danh sách vị trí kho nguồn không được để trống',
              `Cảnh báo`
            );
            return;
          }
          if (
            !element?.listToWarehouse ||
            element?.listToWarehouse.length <= 0
          ) {
            this.messageService.warning(
              'Danh sách vị trí kho đích không được để trống',
              `Cảnh báo`
            );
            return;
          }
          const quantity = element?.listToWarehouse?.reduce(
            (sum: any, item: any) =>
              sum + item.itemQuantity * item.packageQuantity,
            0
          );
          if (element?.actualQuantity <= 0) {
            this.messageService.warning(
              'Số lượng thực chuyển phải lớn hơn 0',
              `Cảnh báo`
            );
            return;
          }
          if (element?.actualQuantity > element?.openQuantity) {
            // this.messageService.warning(
            //   'Số lượng thực chuyển phải nhỏ hơn số lượng cần chuyển',
            //   `Cảnh báo`
            // );
            // return;
            checkQuantity = true;
          }
          if (element?.actualQuantity !== quantity) {
            this.messageService.warning(
              'Số lượng xuất ở kho nguồn phải bằng số lượng nhập ở kho đích',
              `Cảnh báo`
            );
            return;
          }
          if (!element?.check && element?.message && element?.message !== '') {
            this.messageService.warning(element?.message, `Cảnh báo`);
            return;
          }
        }
      }
      if (check) {
        if (checkQuantity) {
          this.titleConfirm =
            'Số lượng thực chuyển đang lớn hơn số lượng cần chuyển, bạn có chắc chắn muốn tạo phiếu chuyển kho';
        } else {
          this.titleConfirm = 'Tạo phiếu chuyển kho';
        }
        this.modalConfirmSave = true;
      } else
        this.messageService.warning(
          'Vui lòng thêm vị trí cho ít nhất 1 hàng hóa',
          `Cảnh báo`
        );
    }
  }

  onHandleModalCancelSave(event: any) {
    this.modalConfirmSave = event;
  }

  async onHandleModalConfirmSave() {
    try {
      this.loading.start();
      let dataItemSend: any[] = [];
      this.dataItems.forEach((element) => {
        dataItemSend.push({
          itemCode: element?.itemCode,
          itemName: element?.itemName,
          fromWarehouseCode: this.dataInformation?.fromWarehouseCode,
          toWarehouseCode: this.dataInformation?.toWarehouseCode,
          uom: element?.uom,
          requestQuantity: element?.requestQuantity,
          openQuantity: element?.openQuantity,
          transferedQuantity: element?.transferedQuantity,
          actualQuantity: element?.actualQuantity,
          formLocationItemTransferDTO: element?.listFromWarehouse.map(
            (item: any) => ({
              fromWarehouseCode: this.dataInformation?.fromWarehouseCode,
              fromLocationCode: item?.locationCode,
              fromLocationName: item?.locationName,
              itemQuantity: item?.itemQuantity,
              packageQuantity: item?.packageQuantity,
            })
          ),
          toLocationItemTransferDTO: element?.listToWarehouse.map(
            (item: any) => ({
              toWarehouseCode: this.dataInformation?.toWarehouseCode,
              toLocationCode: item?.locationCode,
              toLocationName: item?.locationName,
              itemQuantity: item?.itemQuantity,
              packageQuantity: item?.packageQuantity,
            })
          ),
        });
      });
      let data = {
        wtrDTO: {
          transferRequestCode: this.dataInformation?.transferRequestCode,
          fromWarehouseCode: this.dataInformation?.fromWarehouseCode,
          toWarehouseCode: this.dataInformation?.toWarehouseCode,
          receiver: this.dataInformation?.receiverName,
          transferDate: this.dataInformation?.transferDate,
          receivedDate: this.dataInformation?.receivedDate,
          status: this.dataInformation?.status,
          createdBy: this.dataInformation?.createdBy,
          sender: this.dataInformation?.senderName,
          note: this.dataInformation?.note || '',
          wtrTypeId: this.dataInformation?.wtrTypeId || '',
        },
        itemTransferDTOList: dataItemSend,
      };
      let resp = await this.warehouseTransferService.createWtrNote(data);
      if (resp.result.responseCode == '00') {
        this.messageService.success(`${resp.result.message}`, `Thành công`);
        this.router.navigate([
          './warehouse-transfer/list-warehouse-transfer-note',
        ]);
        this.modalConfirmSave = false;
      } else {
        this.messageService.error(`${resp.result.message}`, `Lỗi`);
      }
    } catch (error) {
      this.messageService.error(`${error}`, `Lỗi`);
    } finally {
      this.loading.stop();
    }
  }

  clearReceiver(keyName: string) {
    this.dataFilterReceiverCode[keyName] = '';
    this.getListReceiver();
  }

  showPopover: boolean = false;
  showPopoverSupplier() {
    this.showPopover = true;
  }
  popoverVisibleChangeSupplier(event: any) {
    this.showPopover = event;
  }

  dataTranferRequestCode: any[] = [];
  dataFilter: any = {};
  transferRequestCode: any = '';
  pageTranferRequest: any = 1;
  perPageTranferRequest: any = 10;
  totalTranferRequest: any = 0;
  async getWtrRequest() {
    try {
      this.loading.start();
      let data = {
        pageIndex: this.pageTranferRequest - 1,
        pageSize: this.perPageTranferRequest,
        filter: this.dataFilter,
        common: '',
        sortProperty: 'id',
        sortOrder: 'descend',
      };
      let resp = await this.warehouseTransferService.listWtrRequest(data);
      if (resp.result.responseCode == '00') {
        this.dataTranferRequestCode = resp.data?.content;
        this.totalTranferRequest = resp.data?.totalElements;
      }
    } catch (err) {
    } finally {
      this.loading.stop();
    }
  }
  paginationTranferRequest(event: any) {
    this.pageTranferRequest = event.page;
    this.perPageTranferRequest = event.size;
    this.getWtrRequest();
  }
  async getDetailWtrRequest() {
    let res = await this.warehouseTransferService.getDetailWtrRequest(
      this.transferRequestCode
    );
    if (res) {
      if (res.result.ok == true) {
        this.dataInformation = {
          ...res.data,
          senderName: res.data?.sender,
          receiverName: res.data?.receiver,
        };
        this.dataItems = res.data?.itemTransferList;
        this.dataItems = this.dataItems.filter(
          (item: any) => item?.openQuantity > 0
        );
      } else {
        this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
      }
    } else {
      this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
    }
  }
  clickRowTranfer(data: any) {
    this.transferRequestCode = data.transferRequestCode;
    this.showPopover = false;
    this.getDetailWtrRequest();
  }
  clearTranferRequestCode(key: any) {
    this.dataFilter[key] = '';
    this.getDetailWtrRequest();
  }
  expandSet = new Set<number>();
  onClickIcon(element: any) {
    if (this.expandSet.has(element.id)) {
      this.expandSet.delete(element.id);
    } else {
      this.expandSet.add(element.id);
    }
  }
  ngOnDestroy(): void {
    this.transferData.setObject({});
  }
}
