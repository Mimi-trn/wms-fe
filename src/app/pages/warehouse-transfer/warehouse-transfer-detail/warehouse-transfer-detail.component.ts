import { async } from '@angular/core/testing';
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
import jwt_decode from 'jwt-decode';
import * as moment from 'moment';
@Component({
  selector: 'app-warehouse-transfer-detail',
  templateUrl: './warehouse-transfer-detail.component.html',
  styleUrls: ['./warehouse-transfer-detail.component.css'],
})
export class WarehouseTransferDetailComponent implements OnInit {
  isBreadcrumb: boolean = false;
  isHidden: boolean = true;
  breadcrumbs: Object[] = [];
  dataInformation: any = {};
  listWarehouse: any[] = [];
  // Danh sách hàng hóa
  columns: any[] = [];
  dataItems: any[] = [];
  countTotalQuantityUnexported: number = 0;
  countTotalQuantityRequest: number = 0;
  countTotalQuantityOpen: number = 0;
  dataFilterProduct: any = {};
  visiblePopup: boolean = false;
  checked = false;
  indeterminate = false;
  listOfCurrentPageData: readonly any[] = [];
  setOfCheckedId = new Set<any>();

  // Kiểm tra tồn tại quyền
  token: any = '';
  params: any = '';
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
    private warehouseTransferService: WarehouseTransferService
  ) {}

  checkIsRole(role: string) {
    return this.checkRole.checkRole(role);
  }

  async ngOnInit() {
    this.params = this.activatedRoute.snapshot.params['id'];
    this.setBreadcrumb();
    await this.getWarehouse();
    console.log('listWarehouse', this.listWarehouse);
    await this.getDetailWtrRequest();
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
        width: '150px',
        check: true,
      },
      {
        keyTitle: 'Kho đích',
        keyName: 'toWarehouseCode',
        width: '150px',
        check: true,
      },
      {
        keyTitle: 'Đơn vị tính',
        keyName: 'unit',
        width: '150px',
        check: true,
      },
      {
        keyTitle: 'Số lượng yêu cầu',
        keyName: 'requestQuantity',
        width: '150px',
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
    ];
  }

  async getDetailWtrRequest() {
    let res = await this.warehouseTransferService.getDetailWtrRequest(
      this.params
    );
    if (res) {
      if (res.result.ok) {
        this.dataInformation = res.data;
        this.dataItems = res.data?.itemTransferList;
      } else {
        this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
      }
    } else {
      this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
    }
  }
  setBreadcrumb() {
    this.breadcrumbs = [
      {
        name: 'sidebar.transfer.name',
        route: ``,
      },
      {
        name: 'sidebar.transfer.child.transferRequest.child.list',
        route: `/warehouse-transfer/list-warehouse-transfer`,
      },
      {
        name: 'Chi tiết yêu cầu chuyển kho',
        route: `/warehouse-transfer/list-warehouse-transfer/warehouse-transfer-detai/:id`,
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
  createWtr() {
    this.router.navigate(['./warehouse-transfer/create-warehouse-transfer'], {
      queryParams: { transferRequestCode: this.params },
    });
  }
  isVisiblePopup: boolean = false;
  async rejectWtr() {
    try {
      this.loading.start();
      let res = await this.warehouseTransferService.rejectWtrRequest(
        this.params
      );
      if (res) {
        if (res.result.ok) {
          this.messageService.success(
            `Từ chối chuyển kho thành công`,
            `Thành công`
          );
          this.router.navigate([
            './warehouse-transfer/list-warehouse-transfer',
          ]);
        } else {
          this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
        }
      } else {
        this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
      }
    } catch (error) {
      this.messageService.error(` Có lỗi xảy ra`, ` Lỗi`);
    } finally {
      this.loading.stop();
    }
  }

  ngOnDestroy(): void {
    this.transferData.setObject({});
  }
}
