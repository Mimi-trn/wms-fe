
import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CheckRoleService } from 'src/app/services/checkRole.service';
import { EmployeeService } from 'src/app/services/manage-information/list-employee-service/employee.service';
import jwt_decode from 'jwt-decode';
import { MessageService } from 'src/app/services/message.service';
import { TransferDataService } from 'src/app/services/transferData.service';
import { KeycloakService } from 'keycloak-angular';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { finalize } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-list-of-employee',
  templateUrl: './list-of-employee.component.html',
  styleUrls: ['./list-of-employee.component.css'],
})
export class ListOfEmployeeComponent implements OnInit {
  @ViewChild('modalContent') modalContent!: TemplateRef<any>;
  checkIsRole(role: string) {
    return this.checkRole.checkRole(role);
  }
  constructor(
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    private loading: NgxUiLoaderService,
    private activatedRoute: ActivatedRoute,
    private employeeService: EmployeeService,
    private transferData: TransferDataService,
    private checkRole: CheckRoleService,
    private keycloakService: KeycloakService,
    private modal: NzModalService,
    private fb: FormBuilder,
  ) {
    let encodedToken;
    this.getToken().then(() => {
      encodedToken = this.getDecodedAccessToken(this.token);
      this.checkGroupsInTokenQcer =
        encodedToken.groups.includes('/WMS_GROUP_QCER');
      this.checkGroupsInTokenKeeper =
        encodedToken.groups.includes('/WMS_GROUP_KEEPER');
      this.checkGroupsInTokenAdmin =
        encodedToken.groups.includes('/WMS_GROUP_ADMIN');
      this.checkGroupsInTokenSaler =
        encodedToken.groups.includes('/WMS_GROUP_SALER');
      this.checkGroupsInFcimAdmin = encodedToken.groups.includes('/FCIM_ADMIN');
    });
    this.listStatus = [
      { text: 'Đóng', value: 1 },
      { text: 'Mở', value: 2 },
      { text: 'Bản nháp', value: 0 },
    ];
    this.listSource = [
      { text: 'Trong nước', value: 1 },
      { text: 'Quốc tế', value: 2 },
    ];
  }

  token: any = '';
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

  // Get data
  sortProperty: any = 'updatedAt';
  sortOrder: any = 'descend';
  async getData(page: any, per_page: any) {
    let data = {
      pageNumber: page - 1,
      pageSize: per_page,
      filter: this.dataFilter,
      common: this.searchGeneral,
      sortProperty: this.sortProperty,
      sortOrder: this.sortOrder,
    };
    let resp = await this.employeeService.getListEmployee(data);
    if (resp.result.responseCode == '00') {
      this.loading.stop();
      this.datas = resp.data;
      this.total = resp.dataCount;
    } else {
    }
  }

  async rangeDate() {
    this.loading.start();
    let data = {
      pageIndex: this.page - 1,
      pageSize: this.per_page,
      filter: this.dataFilter,
      common: this.searchGeneral,
      sortProperty: this.sortProperty,
      sortOrder: this.sortOrder,
    };

  }

  ngOnInit() {
    this.columns = [
      {
        keyTitle: 'Mã nhân viên',
        keyName: 'employeeCode',
        width: '150px',
        check: true,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'Tên nhân viên',
        keyName: 'employeeName',
        width: '150px',
        check: true,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'SĐT',
        keyName: 'employeePhone',
        width: '120px',
        check: true,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'Địa chỉ',
        keyName: 'employeeAddress',
        width: '150px',
        check: true,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'Email',
        keyName: 'employeeEmail',
        width: '150px',
        check: true,
        count: 0,
        sortOrder: '',
      },
      {
        keyTitle: 'Chức vụ',
        keyName: 'employeePosition',
        width: '150px',
        check: true,
        count: 0,
        sortOrder: '',
      },
    ];
    this.setBreadcrumb();
  }

  // Hàm xử lý sự kiện breadscrumb
  setBreadcrumb() {
    this.breadcrumbs = [
      {
        name: 'menu.manage.information',
        route: ``,
      },
      {
        name: 'menu.manage.po',
        route: `/manage-info/manage-list-employee`,
      },
    ];
    this.isBreadcrumb = true;
  }
  //  Hàm xử lý tìm kiếm chung
  searchGeneralFunc() {
    this.page = 1;
    this.per_page = 10;
    this.getData(this.page, this.per_page);
  }

  // Hàm xử lý tìm kiếm col
  search() {
    this.getData(this.page, this.per_page);
  }

  enterSearch($event: any) {
    if ($event.keyCode == 13) {
      this.getData(this.page, this.per_page);
    }
  }

  formEmployee!: FormGroup;
  isEdit: boolean = false;


  // Hàm xử lý thêm mới
  onClickAddNew() {
    this.isEdit = false;
    this.formEmployee = this.fb.group({
      employeeName: ['', Validators.required],
      employeePhone: ['', Validators.required],
      employeeAddress: ['', Validators.required],
      employeeEmial: ['', Validators.required],
      employeePosition: [null, Validators.required]
    });

    this.modal.create({
      nzTitle: 'Thêm mới nhân viên',
      nzContent: this.modalContent,
      nzFooter: null,
      nzWidth: 600
    });
  }

  createEmployee() {
    if (this.isEdit === false) {
      const payload = {
        employeeCode: this.formEmployee.get('employeeCode')?.value,
        employeeName: this.formEmployee.get('employeeName')?.value,
        employeePhone: this.formEmployee.get('employeePhone')?.value,
        employeeAddress: this.formEmployee.get('employeeAddress')?.value,
        employeeEmail: this.formEmployee.get('employeeEmail')?.value,
        employeePosition: this.formEmployee.get('employeePosition')?.value,
      };

      this.employeeService.createEmployee(payload)
        .then((res: any) => {
          if (res?.result?.responseCode === '00') {
            this.messageService.success('Tạo nhân viên thành công', 'Thành công');
            this.modal.closeAll();
            this.formEmployee.reset();

            this.getData(this.page, this.per_page);
          } else {
            this.messageService.error('Tạo nhân viên thất bại', res?.result?.message || '');
          }
        })
        .catch((err: any) => {
          console.error('Lỗi khi tạo nhân viên', err);
          this.messageService.error('Lỗi kết nối tới máy chủ!', 'Lỗi');
        });
    }
    if (this.isEdit === true) {
      const payload = {
        employeeCode: this.formEmployee.get('employeeCode')?.value,
        employeeName: this.formEmployee.get('employeeName')?.value,
        employeePhone: this.formEmployee.get('employeePhone')?.value,
        employeeAddress: this.formEmployee.get('employeeAddress')?.value,
        employeeEmail: this.formEmployee.get('employeeEmail')?.value,
        employeePosition: this.formEmployee.get('employeePosition')?.value,
      };

      this.employeeService.updateEmployee(payload)
        .then((res: any) => {
          if (res?.result?.responseCode === '00') {
            this.messageService.success('Cập nhật nhân viên thành công', 'Thành công');
            this.modal.closeAll();
            this.formEmployee.reset();

            this.getData(this.page, this.per_page);
          } else {
            this.messageService.error('Cập nhật nhân viên thất bại', res?.result?.message || '');
          }
        })
        .catch((err: any) => {
          this.messageService.error('Lỗi kết nối tới máy chủ!', 'Lỗi');
        });
    }
  }

  // Xử lý sự kiện sort filter pagi
  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, filter, sort } = params;

    if (sort.length !== 0) {
      this.sortProperty = sort[0].key;
      this.sortOrder = sort[0].value;
    }
    if (!this.sortProperty) this.sortProperty = 'status';
    if (!this.sortOrder) this.sortOrder = 'descend';

    filter.forEach((element: any) => {
      this.dataFilter[element.key] = element.value;
    });

    this.getData(this.page, this.per_page);
  }

  // Hàm xử lý sự kiện onResize
  id = -1;
  onResize({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.columns[i].width = width + 'px';
    });
  }

  // Hàm xử lý sự kiện phân trang
  pagination(event: any) {
    console.log('event', event);
    this.page = event.page;
    this.per_page = event.size;

    // this.getData(event.page, event.size);
  }

  // onHandleView
  onHandleView(row: any) {
    this.loading.start();
    this.employeeService.deleteEmployee(row.employeeCode)
      .then((res: any) => {
        this.loading.stop();
        if (res?.result?.responseCode === '00') {
          this.messageService.success('Xóa nhân viên thành công', 'Thành công');
          this.getData(this.page, this.per_page); // refresh table
        } else {
          this.messageService.error('Xóa nhân viên thất bại', res?.result?.message || '');
        }
      })
      .catch((err: any) => {
        this.loading.stop();
        console.error('Lỗi khi xóa nhân viên', err);
        this.messageService.error('Lỗi kết nối tới máy chủ!', 'Lỗi');
      });
  }

  // onHandleNewIQC
  onHandleNewIQC(row: any) {
    this.transferData.setObjectFromPO(row);
    this.router.navigate(['./manage-warehouse-receipt/create-iqc-request']);
  }

  // Hàm xử lý trả lại
  onClickCancel() {
    this.isVisibleCancel = true;
    // this.visibleAddNew = false;
  }

  onHandleCancelPopup(event: any) {
    this.isVisibleCancel = event;
  }

  onHandleConfirmPopup(event: any) {
    this.visibleAddNew = event;
  }

  // Hàm xử lý chức năng đóng modal
  hideAddNew(data: any) {
    this.visibleAddNew = data;
    // this.getData(this.page, this.per_page);
  }

  onClickCheckBox(column: any) {
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

  updateAllChecked(): void {
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

  // sort
  countSort = 0;
  customSortFunction(sortColumn: any) {
    sortColumn.count = sortColumn.count + 1;
    // this.countSort = this.countSort + 1;
    if (sortColumn.count % 2 == 1) {
      sortColumn.sortOrder = 'descend';
    } else {
      sortColumn.sortOrder = 'ascend';
    }
    this.sortOrder = sortColumn.sortOrder;
    this.sortProperty = sortColumn.keyName;
    this.getData(this.page, this.per_page);
  }

  // Filter
  allChecked: boolean = false;
  indeterminate: boolean = true;
  searchGeneral: any = '';
  isBreadcrumb: boolean = false;
  isHidden: boolean = true;
  breadcrumbs: Object[] = [];
  datas: any[] = [];
  columns: any[] = [];
  listStatus: any[] = [];
  listSource: any[] = [];
  page: number = 1;
  per_page: number = 10;
  total: number = 0;
  dataFilter: any = {};
  visibleAddNew: boolean = false;
  isVisibleCancel: boolean = false;

  onClickEdit(row: any) {
    this.isEdit = true;
    this.formEmployee = this.fb.group({
      employeeCode: [row?.employeeCode || null],
      employeeName: [row?.employeeName || '', Validators.required],
      employeePhone: [row?.employeePhone || '', Validators.required],
      employeeAddress: [row?.employeeAddress || '', Validators.required],
      employeeEmail: [row?.employeeEmail || '', Validators.required],
      employeePosition: [row?.employeePosition ? Number(row.employeePosition) : null, Validators.required]
    });

    this.modal.create({
      nzTitle: 'Chỉnh sửa nhân viên',
      nzContent: this.modalContent,
      nzFooter: null,
      nzWidth: 600
    });
  }

  showExport() {
    this.loading.start();

    this.employeeService
      .exportStockNew()
      .pipe(
        finalize(() => {
          this.loading.stop();
        })
      )
      .subscribe({
        next: (res: any) => {
          let a = document.createElement('a');
          a.download = 'BC Nhân Viên.xlsx';
          a.href = window.URL.createObjectURL(res.body as Blob);
          a.click();
        },
        error: () => {
          this.messageService.error('Có lỗi xảy ra khi xuất file Excel', 'Lỗi');
        },
      });
  }

}
