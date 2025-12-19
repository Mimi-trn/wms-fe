import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'src/app/services/message.service';
import { ExportReportService } from 'src/app/services/export_report/export_report.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-export_report',
    templateUrl: './export_report.component.html',
    styleUrls: ['./export_report.component.css'],
})
export class ExportReportComponent {
    constructor(
        private messageService: MessageService,
        private exprotReportService: ExportReportService,
        private translateService: TranslateService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private loading: NgxUiLoaderService,
    ) { }

    vendorList: any[] = [];
    selectedVendor: any;

    // ======== Search ========
    searchGeneral: string = '';
    dataFilter: any = {};
    startDate: any;
    endDate: any;
    searchByDate() {
        console.log('Tìm theo ngày từ:', this.startDate, 'đến:', this.endDate);
        this.page = 1; // reset về trang 1 khi tìm kiếm
        this.loadData();
    }


    // ======== Table columns ========
    columns: any[] = [
        { keyName: 'itemCode', keyTitle: 'Mã hàng', width: 150, check: true, sortOrder: '' },
        { keyName: 'itemName', keyTitle: 'Tên hàng', width: 250, check: true, sortOrder: '' },
        { keyName: 'uom', keyTitle: 'Đơn vị', width: 100, check: true, sortOrder: '' },
        { keyName: 'itemType', keyTitle: 'Loại hàng hóa', width: 150, check: true, sortOrder: '' },
        { keyName: 'vendorName', keyTitle: 'Nhà cung cấp', width: 150, check: true, sortOrder: '' },
        { keyName: 'totalImportPoQuantity', keyTitle: 'Tổng nhập', width: 150, check: true, sortOrder: '' },

    ];
    allChecked: boolean = false;
    indeterminate: boolean = false;

    // ======== Table data ========
    datas: any[] = []; // dữ liệu table
    listUoM: any[] = [   // Ví dụ dữ liệu select UOM
        { paramValue: 'KG', paramDesc: 'Kg' },
        { paramValue: 'PCS', paramDesc: 'Cái' },
    ];

    expandSet = new Set<number>(); // để lưu trạng thái expand row

    // ======== Pagination ========
    page: number = 1;
    per_page: number = 10;
    total: number = 0;

    ngOnInit(): void {
        // load dữ liệu table nếu có API
        this.loadData();
        this.exprotReportService.getAllVendor()
            .then(res => {
                this.vendorList = res?.data;
            });
    }

    async loadData() {
        this.loading.start();
        const body = {
            pageNumber: this.page - 1, // nếu backend bắt đầu từ 0
            pageSize: this.per_page,
            common: this.searchGeneral ?? "",
            filter: {
                vendorCode: this.selectedVendor ?? null,
                startDate: this.startDate ? this.startDate : null,
                endDate: this.endDate ? this.endDate : null,
                ...this.dataFilter
            }
        };

        try {
            const res = await this.exprotReportService.getReport(body);

            if (res.result.ok) {
                this.datas = res.data.content;          // dữ liệu hiện tại page
                this.total = res.data.totalElements;    // tổng số bản ghi
            } else {
                this.datas = [];
                this.total = 0;
            }
        } catch (error) {
            console.error(error);
            this.datas = [];
            this.total = 0;
        }

        this.loading.stop();
    }



    // ======== Search functions ========
    searchGeneralFunc() {
        console.log('Tìm kiếm:', this.searchGeneral);
        // TODO: gọi API hoặc filter datas
    }

    enterSearch(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            this.filterData();
        }
    }

    filterData() {
        console.log('Filter data:', this.dataFilter);
        // TODO: lọc datas dựa trên dataFilter
    }

    // ======== Column checkbox ========
    updateAllChecked() {
        this.columns.forEach(col => col.check = this.allChecked);
        this.indeterminate = false;
    }

    onClickCheckBox() {
        const allChecked = this.columns.every(col => col.check);
        const allUnChecked = this.columns.every(col => !col.check);
        this.allChecked = allChecked;
        this.indeterminate = !allChecked && !allUnChecked;
    }

    // ======== Expand row ========
    onClickIcon(row: any) {
        if (this.expandSet.has(row.id)) {
            this.expandSet.delete(row.id);
        } else {
            this.expandSet.add(row.id);
        }
    }

    // ======== Sort ========
    customSortFunction(column: any) {
        console.log('Sort column:', column);
        // TODO: sort logic
    }

    // ======== Pagination ========
    pagination(event: any) {
        console.log('Change page:', event);
        this.page = event.page;
        this.per_page = event.size;
        this.loadData();
    }

    // Trong ExportReportComponent
    onResize(event: any, c: any): void {
        // Cập nhật lại chiều rộng cột

    }

    itemList: any = []
    async show() {
        const pdfContent = document.getElementById('pdf-content');
        if (pdfContent) {
            pdfContent.style.display = 'block';
        }
        const body = {
            pageNumber: 0, // nếu backend bắt đầu từ 0
            pageSize: 0,
            common: this.searchGeneral ?? "",
            filter: {
                startDate: this.startDate ? this.startDate : null,
                endDate: this.endDate ? this.endDate : null,
                ...this.dataFilter
            }
        };

        try {
            const res = await this.exprotReportService.getReport(body);

            if (res.result.ok) {
                this.itemList = res.data;          // dữ liệu hiện tại page
                this.total = res.data.totalElements;    // tổng số bản ghi
            } else {
                this.itemList = [];
                this.total = 0;
            }
        } catch (error) {
            console.error(error);
            this.itemList = [];
            this.total = 0;
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

        // Bỏ scroll trước khi chụp
        const originalStyle = el!.style.overflow;
        el!.style.overflow = 'visible';

        html2canvas(el!, { scale: 2, useCORS: true }).then(canvas => {
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
                pdf.addPage();
                position = heightLeft - imgHeight;
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save('Report.pdf');

            // Restore lại để không phá UI
            el!.style.overflow = originalStyle;

            this.loading.stop();
        });
    }


    showExportStockModal() {
        this.loading.start();
        const body = {
            pageNumber: 0, // nếu backend bắt đầu từ 0
            pageSize: 0,
            common: this.searchGeneral ?? "",
            filter: {
                vendorCode: this.selectedVendor ? this.selectedVendor : null,
                startDate: this.startDate ? this.startDate : null,
                endDate: this.endDate ? this.endDate : null,
                ...this.dataFilter
            }
        };
        this.exprotReportService
            .exportStockNew(body)
            .pipe(
                finalize(() => {
                    this.loading.stop();
                })
            )
            .subscribe({
                next: (res: any) => {
                    let a = document.createElement('a');
                    a.download = 'Báo cáo vật tư nhập kho theo NCC.xlsx';
                    a.href = window.URL.createObjectURL(res.body as Blob);
                    a.click();
                },
                error: () => {
                    this.messageService.error('Có lỗi xảy ra khi xuất file Excel', 'Lỗi');
                },
            });
    }
}

