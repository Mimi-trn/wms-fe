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
import { VendorService } from 'src/app/services/vender/vender.service';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-vender-list',
    templateUrl: './vender-list.component.html',
    styleUrls: ['./vender-list.component.css'],
})
export class VenderListComponent implements OnInit {
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
        private vendorService: VendorService
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
    listItemCCDC: any = []

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

    allChecked: boolean = false;
    indeterminate: boolean = true;

    expandSet = new Set<number>();
    isExpand: boolean = false;
    newWoForm!: FormGroup;
    isEdit: boolean = false;

    ngOnInit() {
        this.onHandleFetchData();
    }

    onHandleCheckRole(role: string) {
        return this.checkRole.checkRole(role);
    }

    async onHandleFetchData() {
        let request = {
            pageNumber: this.page - 1,
            pageSize: this.perPage,
            common: this.searchGeneral,
            sortProperty: this.sortProperty,
            sortOrder: this.sortOrder,
            filter: {}
        };

        let res = await this.vendorService.search(request);

        if (res && res.result.responseCode == '00') {
            this.listWo = res.data.content;
            this.total = res.data.totalElements;
        } else {
            this.messageService.error(`Có lỗi xảy ra`, `Thông báo`);
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
        { keyTitle: 'Mã nhà cung cấp', keyName: 'vendorCode', width: '200px', check: true, count: 0 },
        { keyTitle: 'Tên nhà cung cấp', keyName: 'vendorName', width: '200px', check: true, count: 0 },
        { keyTitle: 'Mã số thuế', keyName: 'taxCode', width: '200px', check: true, count: 0 },
        { keyTitle: 'Địa chỉ', keyName: 'address', width: '200px', check: true, count: 0 },
        { keyTitle: 'SĐT', keyName: 'phone', width: '200px', check: true, count: 0 },
        { keyTitle: 'Email', keyName: 'email', width: '200px', check: true, count: 0 },
        { keyTitle: 'Ghi chú', keyName: 'note', width: '240px', check: true, count: 0 },
    ];


    onClickAddNew(): void {
        this.isEdit = false;

        this.newWoForm = this.fb.group({
            vendorCode: ['', Validators.required],
            vendorName: ['', Validators.required],
            address: ['', Validators.required],
            phone: ['', Validators.required],
            taxCode: ['', Validators.required],
            email: ['', Validators.required],
            note: ['']
        });

        this.modal.create({
            nzTitle: 'Thêm mới nhà cung cấp',
            nzContent: this.modalContent,
            nzFooter: null,
            nzWidth: 600
        });
    }


    createNewWo() {
        const formValue = this.newWoForm.getRawValue();
        let payload = {
            vendorCode: formValue.vendorCode,
            vendorName: formValue.vendorName,
            address: formValue.address,
            phone: formValue.phone,
            email: formValue.email,
            taxCode: formValue.taxCode,
            note: formValue.note
        };

        this.loading.start();

        if (!this.isEdit) {
            // CREATE
            this.vendorService.create(payload)
                .then(res => {
                    this.loading.stop();
                    if (res?.result?.responseCode === '00') {
                        this.messageService.success('Tạo mới thành công!', 'Thành công');
                        this.modal.closeAll();
                        this.onHandleFetchData();
                    } else {
                        this.messageService.error(res.result.message, 'Lỗi');
                    }
                });
        } else {
            // UPDATE
            this.vendorService.update(payload)
                .then(res => {
                    this.loading.stop();
                    if (res?.result?.responseCode === '00') {
                        this.messageService.success('Cập nhật thành công!', 'Thành công');
                        this.modal.closeAll();
                        this.onHandleFetchData();
                    } else {
                        this.messageService.error(res.result.message, 'Lỗi');
                    }
                });
        }
    }


    onHandleDelete(row: any) {
        this.loading.start();
        this.vendorService.delete(row.vendorCode)
            .then(res => {
                this.loading.stop();
                if (res?.result?.responseCode === '00') {
                    this.messageService.success('Xóa thành công!', 'Thành công');
                    this.onHandleFetchData();
                } else {
                    this.messageService.error('Xóa thất bại!', res?.result?.message || '');
                }
            })
            .catch(err => {
                this.loading.stop();
                this.messageService.error('Lỗi kết nối!', 'Lỗi');
            });
    }

    onClickEdit(row: any) {
        this.isEdit = true;

        this.newWoForm = this.fb.group({
            vendorCode: [{ value: row.vendorCode, disabled: true }],
            vendorName: [row.vendorName, Validators.required],
            address: [row.address, Validators.required],
            phone: [row.phone, Validators.required],
            email: [row.email, Validators.required],
            taxCode: [row.taxCode, Validators.required],
            note: [row.note || '']
        });

        this.modal.create({
            nzTitle: 'Chỉnh sửa thông tin nhà cung cấp',
            nzContent: this.modalContent,
            nzFooter: null,
            nzWidth: 600
        });
    }

    showExport() {
        this.loading.start();

        this.vendorService
            .exportStockNew()
            .pipe(
                finalize(() => {
                    this.loading.stop();
                })
            )
            .subscribe({
                next: (res: any) => {
                    let a = document.createElement('a');
                    a.download = 'BC Nhà Cung Cấp.xlsx';
                    a.href = window.URL.createObjectURL(res.body as Blob);
                    a.click();
                },
                error: () => {
                    this.messageService.error('Có lỗi xảy ra khi xuất file Excel', 'Lỗi');
                },
            });
    }

}


