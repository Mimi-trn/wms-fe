import { KeyedWrite } from '@angular/compiler';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';

import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import jspdf from 'jspdf';
import { NzI18nService, en_US } from 'ng-zorro-antd/i18n';
import { ToastrService } from 'ngx-toastr';
import { ManageChangeLogService } from 'src/app/services/manage-change-log/manage-change-log.service';
@Component({ selector: 'app-info-change-log', templateUrl: './info-change-log.component.html', styleUrls: ['./info-change-log.component.css'] })
export class InfoChangeLogComponent {
    constructor(private toast: ToastrService, private changeLogService: ManageChangeLogService, private i18n: NzI18nService) { }
    @Input() isvisible: boolean = true;
    @Input() changeLog: any = '';
    @Output() isvisibleChange: EventEmitter<boolean> = new EventEmitter();

    isvisibleCancel: boolean = false;

    handleCancel() {
        this.isvisibleChange.emit(false);
    }
    pageNumber: number = 1;
    pageSize: number = 10;
    total: number = 0;
    common: string = '';
    businessLogDetails: string = '';
    duration: string = '';
    entityId: string = '';
    endTime: string = '';
    entityType: string = '';
    errorCode: string = '';
    errorDescription: string = '';
    startTime: string = '';
    userName: string = '';
    actionName: string = '';
    functionName: string = '';
    count = 0;
    propertySort: string | null = "createdAt";
    orderSort: string = 'DESC';
    optionsComplete: any[] = [];
    noDataFound: boolean = false;
    createdAt: string = '';
    keyTitle: string = '';
    lastValue: string = '';
    newValue: string = '';
    ngOnInit() {
        this.i18n.setLocale(en_US);
        this.listChangeLog.sort((a, b) => {
            if (a.keyTitle === 'Trạng thái' && b.keyTitle !== 'Trạng thái') {
                return 1;
            } else if (a.keyTitle !== 'Trạng thái' && b.keyTitle === 'Trạng thái') {
                return -1;
            } else {
                return 0;
            }
        });

        this.i18n.setLocale(en_US);
        this.createdAt = this.createdAt,
            this.keyTitle = this.keyTitle,
            this.lastValue = this.lastValue,
            this.newValue = this.newValue,
            this.getData({ page: this.pageNumber, size: this.pageSize });
    }

    optionsCompleteColumnkeyTitle: string[] = [];
    optionsCompleteColumnlastValue: string[] = [];
    optionsCompleteColumnnewValue: string[] = [];
    currentSearchField: string = '';

    async searchAutoComplete(col: any, field: string) {
        if (field === 'fieldName') {
            this.optionsCompleteColumnkeyTitle = [];
        } else if (field === 'lastValue') {
            this.optionsCompleteColumnlastValue = [];
        } else if (field === 'newValue') {
            this.optionsCompleteColumnnewValue = [];
        }
        let request = {
            pageNumber: 0,
            pageSize: 0,
            common: '',
            filter: {
                keyTitle: this.keyTitle,
                lastValue: this.lastValue,
                newValue: this.newValue
            }
        }
        let res = await this.changeLogService.getDataChangleLog(request, this.changeLog.id);
        if (res.result.ok) {
            if (field === 'fieldName') {
                this.optionsCompleteColumnkeyTitle = [];
            } else if (field === 'lastValue') {
                this.optionsCompleteColumnlastValue = [];
            } else if (field === 'newValue') {
                this.optionsCompleteColumnnewValue = [];
            }
            let listChangeLog = res.data;
            listChangeLog.map((x: any) => {
                if (x[col]) {
                    if (field === 'fieldName' && this.optionsCompleteColumnkeyTitle.indexOf(x[col]) === -1) {
                        this.optionsCompleteColumnkeyTitle.push(x[col]);
                    } else if (field === 'lastValue' && this.optionsCompleteColumnlastValue.indexOf(x[col]) === -1) {
                        this.optionsCompleteColumnlastValue.push(x[col]);
                    } else if (field === 'newValue' && this.optionsCompleteColumnnewValue.indexOf(x[col]) === -1) {
                        this.optionsCompleteColumnnewValue.push(x[col]);
                    }
                }
            });
        } else {
            this.toast.error(res.result.message);
        }
    }

    async search($event: any) {
        if ($event.keyCode == 13) {
            this.pageNumber = 1;
            this.getData({ page: this.pageNumber, size: this.pageSize });
            this.noDataFound = this.total > 0 ? false : true;
        }
    }
    inforChangeLog: Record<string,
        any> = {};
    listChangeLog: any[] = [];

    columns: any[] = [];
    changeLogTemplate: Record<string,
        any> = {};

    async getData(page: {
        page: number,
        size: number
    }) {
        let request = {
            pageNumber: page.page - 1,
            pageSize: page.size,
            common: this.common.trim(),
            filter: {
                keyTitle: this.keyTitle,
                lastValue: this.lastValue,
                newValue: this.newValue
            },
            sortOrder: this.orderSort,
            sortProperty: this.propertySort
        }

        let res = await this.changeLogService.getDataChangleLog(request, this.changeLog.id);
        this.listChangeLog = res.data;
        this.total = res.dataCount;

        return this.listChangeLog;

    }
    clearInput(keyName: string) {
        if (keyName === 'keyTitle') {
            this.keyTitle = '';
        } else if (keyName === 'lastValue') {
            this.lastValue = '';
        } else if (keyName === 'newValue') {
            this.newValue = '';
        }
        this.pageNumber = 1;
        this.getData({ page: this.pageNumber, size: this.pageSize });
        this.noDataFound = this.total > 0 ? false : true;
    }
    id = -1;
    onResize({ width }: NzResizeEvent, i: number) {
        cancelAnimationFrame(this.id);
        this.id = requestAnimationFrame(() => {
            this.header[i].width = width + 'px';
        });
    }
    customSortFunction(event: any, sortColumn: string) {
        this.count = this.count + 1
        if (this.count % 3 == 1) {
            this.orderSort = "DESC";
            this.propertySort = null;
        } else if (this.count % 3 == 2) {
            this.propertySort = null;
            this.orderSort = "ASC";
        } else {
            this.orderSort = "DESC";
            this.propertySort = "createdAt";
        }
        this.propertySort = sortColumn;

        // this.getData({page: this.pageNumber, size: this.pageSize});
    }

    ivisibleInfor: boolean = false;
    currentChangeLog: any = '';


    getHeaders() {

        let colError = localStorage.getItem('change-log')
        let headerError = JSON.parse(colError ? colError : '');
        headerError.map((x: any) => {
            this.headers.push(x.keyTitle);
        })
    }

    formatDate(inputDate: string): string {
        if (!inputDate)
            return '';



        const dateObj = new Date(inputDate);
        const isDateValid = !isNaN(dateObj.getTime());

        if (!isDateValid)
            return inputDate;



        const year = dateObj.getFullYear();
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const day = dateObj.getDate().toString().padStart(2, '0');
        const hours = dateObj.getHours().toString().padStart(2, '0');
        const minutes = dateObj.getMinutes().toString().padStart(2, '0');
        const seconds = dateObj.getSeconds().toString().padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    headers: any[] = [];
    header: any[] = [

        {
            name: 'Tên cột',
            width: ''
        }, {
            name: 'Gía trị cũ',
            width: ''
        }, {
            name: 'Gía trị mới',
            width: ''
        }
    ];
    isNumberString(value: string): boolean {
        return !isNaN(Number(value));
    }
}
