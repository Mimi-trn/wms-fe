import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { KeycloakService } from 'keycloak-angular';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NzUploadChangeParam } from 'ng-zorro-antd/upload';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { PageFilter } from 'src/app/models/request/PageFilter.model';
import { TechFormService } from 'src/app/services/manage-information/tech-form/tech-form.service';
import { MessageService } from 'src/app/services/message.service';
import { TransferDataService } from 'src/app/services/transferData.service';

@Component({
  selector: 'app-view-tech-form',
  templateUrl: './view-tech-form.component.html',
  styleUrls: ['./view-tech-form.component.css'],
})
export class ViewTechFormComponent {
  constructor(
    private activatedRoute: ActivatedRoute,
    private messageService: MessageService,

    private translateService: TranslateService,
    private router: Router,
    private loading: NgxUiLoaderService,
    private transferdata: TransferDataService,
    private keyClockService: KeycloakService,
    private techFormService: TechFormService
  ) {}
  // Danh sách các cột của bảng danh sách nguyên vật liệu
  materialTableColumns: any = [
    {
      keyTitle: 'listTechForm.materialTable.materialCode',
      keyName: 'materialCode',
      width: '200px',
    },
    {
      keyTitle: 'listTechForm.materialTable.materialName',
      keyName: 'materialName',
      width: '200px',
    },
    {
      keyTitle: 'listTechForm.materialTable.materialTechName',
      keyName: 'materialTechName',
      width: '200px',
    },
    {
      keyTitle: 'listTechForm.materialTable.uom',
      keyName: 'unit',
      width: '200px',
    },
    {
      keyTitle: 'listTechForm.materialTable.quantity',
      keyName: 'quantity',
      width: '200px',
    },
    {
      keyTitle: 'listTechForm.materialTable.quantityHold',
      keyName: 'quantityHold',
      width: '200px',
    },
    {
      keyTitle: 'listTechForm.materialTable.note',
      keyName: 'note',
      width: '200px',
    },
  ];
  // Danh sách các cột của bảng danh sách yêu cầu sản xuất
  productionTableColumns: any = [
    {
      keyTitle: 'listTechForm.requestProductionTable.productionCode',
      keyName: 'productionCode',
      width: '200px',
    },
    {
      keyTitle: 'listTechForm.requestProductionTable.orderCode',
      keyName: 'salesOrderCode',
      width: '400px',
    },
    {
      keyTitle: 'listTechForm.requestProductionTable.customerCode',
      keyName: 'customerCode',
      width: '200px',
    },
    {
      keyTitle: 'listTechForm.requestProductionTable.customerName',
      keyName: 'customer',
      width: '200px',
    },
    {
      keyTitle: 'listTechForm.requestProductionTable.productName',
      keyName: 'cardName',
      width: '200px',
    },
  ];
  // Danh sách trạng thái
  listStatus: any = [
    {
      value: 0,
      label: 'listTechForm.status.close',
    },
    {
      value: 1,
      label: 'listTechForm.status.open',
    },
  ];
  // Lấy id phiếu công nghệ trên url
  techFormId: string = this.activatedRoute.snapshot.params['id'];
  // Danh sách breadcrumb
  breadcrumbs: any = [
    {
      name: 'menu.manage.information',
      route: ``,
    },
    {
      name: 'sidebar.information.child.listTechForm',
      route: `/manage-info/list-tech-form`,
    },
    {
      name: 'listTechForm.viewDetail',
      route: `/manage-info/list-tech-form/view-tech-form/${this.techFormId}`,
    },
  ];
  // Thông tin phiếu công nghệ
  dataInformation: any = {};
  // Số thứ tự nút radio button hiện tại
  currentRadioButtonIndex: number = 0;
  // Danh sách các radio button
  listOfRadioButton: string[] = [
    'button.detail',
    'button.productionRequirement',
  ];
  // Dữ liệu của bảng danh sách nguyên vật liệu
  materialData: any = [];
  // Dữ liệu của bảng danh sách yêu cầu sản xuất
  productionData: any = [];
  // Phân trang cho bảng danh sách phiếu công nghệ
  prTalePageIndex: number = 1;
  prTalePageSize: number = 10;
  prTaleTotal: number = 100;
  // Dữ liệu filter cho bảng yêu càu sản xuất
  requestProductionPageFilter: PageFilter = {
    common: '',
    pageIndex: 0,
    pageSize: 10,
    filter: {},
    sortProperty: '',
    sortOrder: '',
  };
  // Dữ liệu filter cho bảng nguyên vật liệu
  materialPageFilter: PageFilter = {
    common: '',
    pageIndex: 0,
    pageSize: 0,
    filter: {},
    sortProperty: '',
    sortOrder: '',
  };
  // Dữ liệu filter của bảng danh sách phiếu công nghệ
  filterForProductionRequirementData: any = {};
  isVisibleCancelRequest: boolean = false;
  isVisibleCancel: boolean = false;

  // Xử lý cho phần chọn nguyên vật liệu
  allChecked = false;
  indeterminate = false;

  ngOnInit() {
    this.loading.start();
    // this.translateService
    //   .get('manage.receipt.view.detail')
    //   .subscribe((text) => {
    //     this.title.setTitle(text);
    //   });
    // Lấy dữ liệu thông tin phiếu công nghệ
    this.techFormService
      .getTechForm({
        pageIndex: 0,
        pageSize: 0,
        filter: { id: this.techFormId },
      })
      .then((response) => {
        if (response.result.responseCode == '00') {
          this.dataInformation = response.data[0];
        } else {
          this.messageService.error(
            'Không lấy được dữ liệu thông tin phiếu công nghệ',
            'Lỗi'
          );
        }
      });
    // Lấy danh sách nguyên vật liệu
    this.materialPageFilter.filter.techFormId = this.techFormId;
    this.techFormService
      .getMaterial(this.materialPageFilter)
      .then((response) => {
        if (response.result.responseCode == '00') {
          this.materialData = response.data.map((data: any) => {
            return { ...data, checked: false };
          });
        } else {
          this.messageService.error(
            'Không lấy được dữ liệu danh sách nguyên vật liệu',
            'Lỗi'
          );
        }
      });
    // Lấy danh sách yêu cầu sản xuất
    this.requestProductionPageFilter.filter.techFormId = this.techFormId;
    this.techFormService
      .getProductionRequirement(this.requestProductionPageFilter)
      .then((response) => {
        if (response.result.responseCode == '00') {
          this.productionData = response.data;
          this.prTaleTotal = response.dataCount;
        } else {
          this.messageService.error(
            'Không lấy được dữ liệu danh sách yêu cầu sản xuất',
            'Lỗi'
          );
        }
      });

    this.loading.stop();
  }

  // Hàm xử lý sự kiện onResize cho bảng danh sách yêu cầu sản xuất
  onResizeForListProductionRequirement(
    { width }: NzResizeEvent,
    col: any
  ): void {
    this.productionTableColumns = this.productionTableColumns.map((e: any) =>
      e.keyTitle === col.keyTitle ? { ...e, width: `${width}px` } : e
    );
  }

  // Hàm xử lý sự kiện onResize cho bảng danh sách nguyên vật liệu
  onResizeForMaterialTable({ width }: NzResizeEvent, col: any): void {
    this.materialTableColumns = this.materialTableColumns.map((e: any) =>
      e.keyTitle === col.keyTitle ? { ...e, width: `${width}px` } : e
    );
  }

  // Hàm xử lý sự kiện phân trang cho bảng yêu cầu sản xuất
  paginationForProductionRequirementTable(event: any) {
    this.prTalePageIndex = event.page;
    this.prTalePageSize = event.size;
    this.requestProductionPageFilter.pageIndex = event.page - 1;
    this.requestProductionPageFilter.pageSize = event.size;
    this.fetchProductionRequirementDataTable();
  }

  // Refresh lại dữ liệu trong bảng yêu cầu theo filter, search, paging mới
  fetchProductionRequirementDataTable() {
    this.loading.start();
    this.techFormService
      .getProductionRequirement(this.requestProductionPageFilter)
      .then((response: any) => {
        if (response.result.responseCode == '00') {
          this.productionData = response.data;
          this.loading.stop();
        } else {
          this.messageService.error(
            'Không lấy được dữ liệu danh sách yêu cầu sản xuất',
            'Lỗi'
          );
          this.loading.stop();
        }
      });
  }

  // Refresh lại dữ liệu trong bảng yêu cầu theo filter, search, paging mới
  fetchMaterialDataTable() {
    this.loading.start();
    this.techFormService
      .getMaterial(this.materialPageFilter)
      .then((response: any) => {
        if (response.result.responseCode == '00') {
          this.materialData = response.data;
          this.loading.stop();
        } else {
          this.messageService.error(
            'Không lấy được dữ liệu danh sách nguyên vật liệu',
            'Lỗi'
          );
          this.loading.stop();
        }
      });
  }

  // Xử lý filter cho bảng danh sách yêu cầu sản xuất
  filterForProductionRequirementTable() {
    this.fetchProductionRequirementDataTable();
  }

  // Xử lý filter cho bảng danh sách nguyên vật liệu
  filterForMaterialTable() {
    this.fetchMaterialDataTable();
  }

  onHandleConfirmPopup(event: any) {
    this.isVisibleCancel = event;
  }

  changeSelect(event: any) {
    this.currentRadioButtonIndex = event;
  }

  close() {
    this.router.navigate(['/manage-info/list-tech-form']);
  }

  createExportRequest() {
    let dataSend = this.materialData.filter(
      (item: any) => item.checked == true
    );
    if (dataSend.length == 0) {
      this.messageService.warning(`Bạn phải chọn ít nhất một hàng hóa`, ` Cảnh báo`);
    } else {
      let data = {
        dataObj: this.dataInformation,
        listItem: dataSend,
      };
      this.transferdata.setObject(data);
      this.router.navigate(['./export/list-request-export/new']);
    }
  }

  updateAllChecked(): void {
    this.indeterminate = false;
    if (this.allChecked) {
      this.materialData = this.materialData.map((item: any) => ({
        ...item,
        checked: true,
      }));
    } else {
      this.materialData = this.materialData.map((item: any) => ({
        ...item,
        checked: false,
      }));
    }
  }

  updateSingleChecked(): void {
    if (this.materialData.every((item: any) => !item.checked)) {
      this.allChecked = false;
      this.indeterminate = false;
    } else if (this.materialData.every((item: any) => item.checked)) {
      this.allChecked = true;
      this.indeterminate = false;
    } else {
      this.indeterminate = true;
    }
  }
}
