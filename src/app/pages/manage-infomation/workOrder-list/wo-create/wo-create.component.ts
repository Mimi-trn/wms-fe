// src/app/manage-information/workOrder-list/wo-create/wo-create.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { WorkOrderService } from 'src/app/services/manage-information/work-order.service';
import { MessageService } from 'src/app/services/message.service';
import { TransferDataService } from 'src/app/services/transferData.service';
import { CheckRoleService } from 'src/app/services/checkRole.service';

@Component({
    selector: 'app-wo-create',
    templateUrl: './wo-create.component.html',
    styleUrls: ['./wo-create.component.css']
})
export class WoCreateComponent implements OnInit {
    breadcrumbs = [
        { name: 'Home', route: '/' },
        { name: 'Work Orders', route: '/list-wo' },
        { name: 'Tạo mới', route: '/manage-information/wo/create' }
    ];

    filterPageItem: any = {
        common: '',
        pageIndex: 0,
        pageSize: 0,
        filter: {},
        sortProperty: 'id',
        sortOrder: 'asc'
    };
    pageIndexItemTable = 1;
    pageSizeItemTable = 10;
    listItem: any[] = [];
    totalItem = 0;

    constructor(
        private messageService: MessageService,
        private loading: NgxUiLoaderService,
        private transferData: TransferDataService,
        private checkRole: CheckRoleService,
        private woService: WorkOrderService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.getListItem();
    }

    async getListItem() {
        try {
            this.loading.start();

            this.filterPageItem.pageIndex = this.pageIndexItemTable - 1;
            this.filterPageItem.pageSize = this.pageSizeItemTable <= 0 ? 10 : this.pageSizeItemTable;
            this.filterPageItem.filter['itemCode'] = this.filterPageItem.filter?.productCode;

            const resp = await this.woService.getItem(this.filterPageItem);
            if (resp.result.responseCode === '00') {
                this.listItem = resp.data?.content.map((item: any) => ({
                    productCode: item.itemCode,
                    itemName: item.itemName,
                    unit: item?.unit
                }));
                this.totalItem = resp.data?.totalElements;
            } else {
                this.messageService.warning('Có lỗi xảy ra trong quá trình tải trang', 'Cảnh báo');
            }
        } catch (error) {
            this.messageService.error('Lỗi khi tải dữ liệu', 'Lỗi');
        } finally {
            this.loading.stop();
        }
    }

    onClickAddNew() {
        this.router.navigate(['create'], { relativeTo: null });
    }
}
