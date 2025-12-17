import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CheckRoleService } from 'src/app/services/checkRole.service';
import { WorkOrderService } from 'src/app/services/manage-information/work-order.service';
import { MessageService } from 'src/app/services/message.service';
import { TransferDataService } from 'src/app/services/transferData.service';
import { KeycloakService } from 'keycloak-angular';
import jwt_decode from 'jwt-decode';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';


@Component({
  selector: 'app-wo-list',
  templateUrl: './wo-list.component.html',
  styleUrls: ['./wo-list.component.css'],
})
export class WoListComponent implements OnInit {
  @ViewChild('modalContent') modalContent!: TemplateRef<any>;
  token: any;
  checkGroupsInTokenQcer: boolean = false;
  checkGroupsInTokenKeeper: boolean = false;
  checkGroupsInTokenSaler: boolean = false;
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
  constructor(
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    private loading: NgxUiLoaderService,
    private activatedRoute: ActivatedRoute,
    private transferData: TransferDataService,
    private checkRole: CheckRoleService,
    private woService: WorkOrderService,
    private keycloakService: KeycloakService,
    private modal: NzModalService,
    private fb: FormBuilder,
  ) {
    let encodedToken;
    this.getToken().then(() => {
      encodedToken = this.getDecodedAccessToken(this.token);
      this.checkGroupsInTokenQcer =
        encodedToken.roles.includes('WMS_GROUP_QCER');
      this.checkGroupsInTokenKeeper =
        encodedToken.roles.includes('WMS_GROUP_KEEPER');
      this.checkGroupsInTokenAdmin =
        encodedToken.roles.includes('WMS_GROUP_ADMIN');
      this.checkGroupsInTokenSaler =
        encodedToken.roles.includes('WMS_GROUP_SALER');
      this.checkGroupsInFcimAdmin = encodedToken.roles.includes('FCIM_ADMIN');
    });
  }

  filterWo: any = {
    startDate: [],
    endDate: [],
    createdAt: [],
    updatedAt: [],
  };
  listWo: any[] = [];
  page: number = 1;
  perPage: number = 10;
  total: number = 0;
  searchGeneral: string = '';
  sortProperty: string = 'updatedAt';
  sortOrder: string = 'DESC';
  listItemTP: any = [];
  listItemNVL: any = []

  breadcrumbs: Object[] = [
    {
      name: 'menu.manage.information',
      route: ``,
    },
    {
      name: 'sidebar.information.child.listWorkOrder.name',
      route: `/manage-info/list-wo`,
    },
  ];

  listStatus: any[] = [
    {
      text: 'Chờ lĩnh nguyên vật liệu',
      value: 6,
    },
    {
      text: 'Chờ sản xuất',
      value: 7,
    },
    {
      text: 'Đang sản xuất',
      value: 8,
    },
    {
      text: 'Chờ nhập kho',
      value: 9,
    },
    {
      text: 'Hoàn thành sản xuất ',
      value: 10,
    },
    // {
    //   text: 'Hoàn thành giao hàng ',
    //   value: 11,
    // },
    {
      text: 'Dừng sản xuất ',
      value: 12,
    },
  ];

  allChecked: boolean = false;
  indeterminate: boolean = true;

  expandSet = new Set<number>();
  isExpand: boolean = false;
  newWoForm!: FormGroup;

  ngOnInit() {
    this.onHandleFetchData();
  }

  onHandleCheckRole(role: string) {
    return this.checkRole.checkRole(role);
  }

  async onHandleFetchData() {
    let dataRequest: any = {
      pageNumber: this.page - 1,
      pageSize: this.perPage,
      filter: {
        woCode: this.filterWo.woCode,
        wmsStatusSearch: [6, 7, 8, 9, 10, 11, 12],
        totalLotNumber: this.filterWo.totalLotNumber,
        createdBy: this.filterWo.createdBy,
        status: this.filterWo.status,
        // workOrderParentId: -1,
        startDateFrom: this.filterWo.startDate[0]
          ? this.filterWo.startDate[0]
          : null,
        startDateTo: this.filterWo.startDate[1]
          ? this.filterWo.startDate[1]
          : null,
        endDateFrom: this.filterWo.endDate[0] ? this.filterWo.endDate[0] : null,
        endDateTo: this.filterWo.endDate[1] ? this.filterWo.endDate[1] : null,
        createDateFrom: this.filterWo.createdAt[0]
          ? this.filterWo.createdAt[0]
          : null,
        createDateTo: this.filterWo.createdAt[1]
          ? this.filterWo.createdAt[1]
          : null,
      },
      common: this.searchGeneral,
      sortProperty: this.sortProperty,
      sortOrder: this.sortOrder,
    };
    let res = await this.woService.getListWOFromAPS(dataRequest);
    if (res) {
      if (res.result.responseCode == '00') {
        this.listWo = res.data.content;
        this.total = res.data.totalElements;
      } else {
        this.messageService.error(
          ` Có lỗi xảy ra, vui lòng thử lại`,
          ` Thông báo`
        );
      }
    } else {
      this.messageService.error(
        ` Có lỗi xảy ra, vui lòng thử lại`,
        ` Thông báo`
      );
    }
  }

  onHandleSearchCommon() {
    this.onHandleFetchData();
  }

  onHandleEnterSearch($event: any) {
    if ($event.keyCode == 13) {
      this.onHandleFetchData();
    }
  }

  onHandleClickSearch() {
    this.onHandleFetchData();
  }

  onHandlePagination(event: any) {
    this.page = event.page;
    this.perPage = event.size;
    this.onHandleFetchData();
  }

  onHandleClearInput(keyName: string) {
    this.filterWo[keyName] = '';
    this.onHandleFetchData();
  }

  onHandleNewRequestIQC(wo: any) {
    this.transferData.setObjectWO(wo);
    this.router.navigate([
      '/manage-warehouse-receipt/required-receipt-warehouse/create',
    ]);
  }

  onHandleCreateExportRequest(row: any) {
    this.transferData.setObject(row);
    this.router.navigate(['/export/list-request-export/new']);
  }
  onHandleCreateImportRequestMaterial(row: any) {
    this.transferData.setObjectWOForMaterial(row);
    this.router.navigate([
      '/manage-warehouse-receipt/required-receipt-warehouse/create',
    ]);
  }
  onHandleReadWO(wo: any) {
    this.router.navigate([`./manage-info/list-wo/${wo.woCode}`]);
  }

  onHandleClickCheckBox() {
    if (this.columns.every((item) => !item.check)) {
      this.allChecked = false;
      this.indeterminate = false;
    } else if (this.columns.every((item) => item.check)) {
      this.allChecked = true;
      this.indeterminate = false;
    } else {
      this.indeterminate = true;
    }
  }

  onHandleUpdateAllChecked(): void {
    this.indeterminate = false;
    if (this.allChecked) {
      this.columns = this.columns.map((item) => ({
        ...item,
        check: true,
      }));
    } else {
      this.columns = this.columns.map((item) => ({
        ...item,
        check: false,
      }));
    }
  }

  id = -1;
  onResize({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.columns[i].width = width + 'px';
    });
  }

  customSortFunction(sortColumn: any) {
    sortColumn.count = sortColumn.count + 1;
    // this.countSort = this.countSort + 1;
    if (sortColumn.count % 2 == 1) {
      sortColumn.sortOrder = 'DESC';
    } else {
      sortColumn.sortOrder = 'ASC';
    }
    this.sortOrder = sortColumn.sortOrder;
    this.sortProperty = sortColumn.keyName;
    this.onHandleFetchData();
  }

  onClickIcon(element: any) {
    if (this.expandSet.has(element.id)) {
      this.expandSet.delete(element.id);
    } else {
      this.expandSet.add(element.id);
    }
  }

  columns: any[] = [
    {
      keyTitle: 'sidebar.information.child.listWorkOrder.list.woCode',
      keyName: 'woCode',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'Mã sản phẩm',
      keyName: 'productCode',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'Tên sản phẩm',
      keyName: 'productName',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },

    {
      keyTitle: 'sidebar.information.child.listWorkOrder.list.startDate',
      keyName: 'startDate',
      width: '240px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listWorkOrder.list.endDate',
      keyName: 'endDate',
      width: '240px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listWorkOrder.list.createdBy',
      keyName: 'createdBy',
      width: '200px',
      check: false,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listWorkOrder.list.createdAt',
      keyName: 'createdAt',
      width: '240px',
      check: false,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listWorkOrder.list.updatedAt',
      keyName: 'updatedAt',
      width: '240px',
      check: false,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'sidebar.information.child.listWorkOrder.list.status',
      keyName: 'status',
      width: '160px',
      check: false,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'Hoàn thành xuất kho NVL',
      keyName: 'wmsIsExportCompleted',
      width: '160px',
      check: false,
      count: 0,
      sortOrder: '',
    },
  ];

  onClickAddNew(): void {
    this.getItemListTP();
    this.getItemListNVL();

    this.mergedList = [...this.listItemNVL]; // <-- Chỉ NVL

    this.newWoForm = this.fb.group({
      productCode: [null, Validators.required],
      productName: [{ value: '', disabled: true }, Validators.required],
      uom: [{ value: '', disabled: true }, Validators.required],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      materials: this.fb.array([])
    });

    this.modal.create({
      nzTitle: 'Thêm mới lệnh sản xuất',
      nzContent: this.modalContent,
      nzFooter: null,
      nzWidth: 600
    });
  }

  getItemListTP(): void {
    const payload = {
      common: '',
      pageIndex: 0,
      pageSize: 20,
      filter: { itemGroupName: 'TP' },
      sortProperty: 'id',
      sortOrder: 'asc'
    };

    this.woService.getItem(payload)
      .then((res: any) => {
        this.listItemTP = res.data.content || [];
      })
      .catch(() => {
        this.messageService.error('Lấy danh sách sản phẩm thất bại', 'Lỗi');
      });

  }

  getItemListNVL(): void {
    const payload = {
      common: '',
      pageIndex: 0,
      pageSize: 50,
      filter: { itemGroupName: 'NVL' },
      sortProperty: 'id',
      sortOrder: 'asc'
    };

    this.woService.getItem(payload)
      .then((res: any) => {
        this.listItemNVL = res.data.content || [];
        this.mergedList = [...this.listItemNVL];
      })
      .catch(() => {
        this.messageService.error('Lấy danh sách sản phẩm thất bại', 'Lỗi');
      });
  }

  onSelectProduct(itemCode: string): void {
    const selectedItem = this.listItemTP.find((item: any) => item.itemCode === itemCode);
    if (selectedItem) {
      this.newWoForm.patchValue({
        productName: selectedItem.itemName,
        uom: selectedItem.unit
      });
    } else {
      this.newWoForm.patchValue({
        productName: ''
      });
    }
  }

  get materials(): FormArray {
    return this.newWoForm.get('materials') as FormArray;
  }

  selectedMaterials: Array<{
    itemCode: string | null;
    itemName: string;
    uom: string;
    requestQuantity: number;
  }> = [];

  addMaterial() {
    this.materials.push(this.fb.group({
      itemCode: [null, Validators.required],
      itemName: [{ value: '', disabled: true }],
      uom: [{ value: '', disabled: true }],
      requestQuantity: [1, [Validators.required, Validators.min(1)]]
    }));
  }

  mergedList: any[] = [];

  onSelectMaterial(itemCode: string, index: number) {

    // Tìm item trong list chung
    const item = this.mergedList.find(i => i.itemCode === itemCode);

    if (item) {
      this.materials.at(index).patchValue({
        itemCode: item.itemCode,
        itemName: item.itemName,
        uom: item.unit
      });
    } else {
      this.materials.at(index).patchValue({
        itemCode: null,
        itemName: '',
        uom: ''
      });
    }

    console.log("danh", this.materials)
  }

  createNewWo() {
    this.loading.start();
    if (this.newWoForm.invalid) {
      this.messageService.warning('Vui lòng nhập đủ thông tin!', 'Cảnh báo');
      return;
    }

    const formValue = this.newWoForm.getRawValue();
    const payload = {
      productCode: formValue.productCode,
      productName: formValue.productName,
      uom: formValue.uom,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      workOrderItemList: formValue.materials.filter((m: any) => m.itemCode)
    };

    this.woService.createWO(payload)
      .then((res: any) => {
        if (res && res.result.responseCode == "00") {
          this.messageService.success('Tạo mới lệnh sản xuất thành công!', 'Thành công');
          this.modal.closeAll();
          this.onHandleFetchData();
        }
      })
      .catch(() => {
        this.messageService.error('Tạo mới thất bại!', 'Lỗi');
      });

    this.loading.stop();
  }

}


