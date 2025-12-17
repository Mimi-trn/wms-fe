import { Component, OnInit } from '@angular/core';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environment/environment';
import { count } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { NzI18nService, en_US } from 'ng-zorro-antd/i18n';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { format } from 'date-fns';

import { ManageChangeLogService } from 'src/app/services/manage-change-log/manage-change-log.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { KeycloakService } from 'keycloak-angular';
@Component({ selector: 'app-change-log', templateUrl: './change-log.component.html', styleUrls: ['./change-log.component.css'] })
export class ChangeLogComponent implements OnInit {
    constructor(
        private http: HttpClient, private changeLog: ManageChangeLogService,
        private toast: ToastrService, private actRoute: ActivatedRoute,
        private i18n: NzI18nService, private loader: NgxUiLoaderService,
        private keyCloak: KeycloakService,) { }

    checkRoles(listRole: string[]) {
        if (listRole === null) {
            return true;
        }
        return listRole.some((role: string) => {
            return this.keyCloak.isUserInRole(role);
        })
    }
    pageNumber: number = 1;
    pageSize: number = 10;
    total: number = 0;
    common: string = '';

    count = 0;
    propertySort: string | null = "createdAt";
    orderSort: string = 'DESC';
    optionsComplete: any[] = [];
    optionsCompleteCommon: any[] = [];
    optionsCompleteColumn: any[] = [];

    noDataFound: boolean = false;

    ngOnInit() {

        this.i18n.setLocale(en_US);
        this.getData({ page: this.pageNumber, size: this.pageSize });
        console.log(this.listChangeLog);
    }
    breadcrumbs = [{
        name: 'Quản lý thông tin thay đổi',
        route: `/change-log/`
    },];
    listUser: any[] = [];
    header: any[] = [
        {
            name: 'Người dùng',
            width: ''
        }, {
            name: 'Loại thao tác',
            width: ''
        }, {
            name: 'Tên chức năng',
            width: ''
        }, {
            name: 'Thời gian',
            width: ''
        }
    ];
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

        return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    }
    authorities: any[] = [];

    searchCommon() {
        this.optionsCompleteCommon = [];
        let request = {
            pageNumber: 0,
            pageSize: 10,
            common: this.common.trim(),
            filter: {
            },
            sortOrder: this.orderSort,
            sortProperty: this.propertySort
        };

        // if (this.common) {
        //     setTimeout(async () => {

        //         let res = await this.changeLog.searchCommonAutocomplete(request);
        //         if (res.result.ok) {
        //             res.data.map((x : any) => {
        //                 this.optionsCompleteCommon.push(x);

        //             })
        //         } else {
        //             this.toast.error(res.result.message);
        //         }
        //     }, 100);
        // }

    }
    optionsCompleteColumnUserName: string[] = [];
    optionsCompleteColumnFunctionName: string[] = [];
    async searchAutoComplete(col: any, field: string) {
        if (field === 'userName') {
            this.optionsCompleteColumnUserName = [];
        } else if (field === 'functionName') {
            this.optionsCompleteColumnFunctionName = [];
        }

        let request = {
            pageNumber: 0,
            pageSize: 0,
            common: '',
            filter: {
                userName: this.userName,
                actionName: this.actionName,
                functionName: this.functionName,
                startCreatedAt: this.createdAt[0],
                endCreatedAt: this.createdAt[1]
            }
        };

        let res = await this.changeLog.getChangeLog(request);
        if (res.result.ok) {
            let listChangeLog = res.data;
            if (field === 'userName') {
                this.optionsCompleteColumnUserName = [];
            } else if (field === 'functionName') {
                this.optionsCompleteColumnFunctionName = [];
            }
            listChangeLog.map((x: any) => {
                if (x[col]) {
                    if (field === 'userName' && this.optionsCompleteColumnUserName.indexOf(x[col]) === -1) {
                        this.optionsCompleteColumnUserName.push(x[col]);
                    } else if (field === 'functionName' && this.optionsCompleteColumnFunctionName.indexOf(x[col]) === -1) {
                        this.optionsCompleteColumnFunctionName.push(x[col]);
                    }
                }
            });
        } else {
            this.toast.error(res.result.message);
        }
    }
    currentSearchField: string = '';

    formatDateToApiString(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${day}-${month}-${year}T00:01:01.001Z`;
    }
    // async searchSelectBox(keyName: string) {
    //     const formattedDate = this.formatDateToApiString(new Date(this.createdAt));

    //     const searchData = {
    //         page: this.pageNumber,
    //         size: this.pageSize
    //     };

    //     let request = {
    //         pageNumber: searchData.page - 1,
    //         pageSize: searchData.size,
    //         common: this.common.trim(),
    //         filter: {
    //             userName: this.userName,
    //             actionName: this.actionName,
    //             functionName: this.functionName,
    //             createdAt: formattedDate
    //         },
    //         sortOrder: this.orderSort,
    //         sortProperty: this.propertySort
    //     };

    //     let res = await this.changeLog.getChangeLog(request);
    //     this.listChangeLog = res.data;
    //     this.total = res.dataCount;
    // }
    async searchSelectBox(keyName: string) {
        const searchData = {
            page: this.pageNumber,
            size: this.pageSize
        };


        let request = {
            pageNumber: searchData.page - 1,
            pageSize: searchData.size,
            common: this.common.trim(),
            filter: {
                userName: this.userName,
                actionName: this.actionName,
                functionName: this.functionName,
                startCreatedAt: this.createdAt[0],
                endCreatedAt: this.createdAt[1]
            },
            sortOrder: this.orderSort,
            sortProperty: this.propertySort
        }
        this.loader.start();
        let res = await this.changeLog.getChangeLog(request);
        this.listChangeLog = res.data;
        this.total = res.dataCount;
        this.loader.stop();
    }
    async search($event: any) {
        if ($event.keyCode == 13) {
            this.pageNumber = 1;
            this.getData({ page: this.pageNumber, size: this.pageSize });
            this.noDataFound = this.total > 0 ? false : true;
        }
    }

    handleSearch() {
        this.pageNumber = 1;
        this.getData({ page: this.pageNumber, size: this.pageSize });
        this.noDataFound = this.total > 0 ? false : true;
    }

    inforChangeLog: Record<string,
        any> = {};

    listChangeLog: any[] = [];
    listChangeLogTemplate: any[] = [];
    listChangeLogToExport: any[] = [];
    columns: any[] = [];
    changeLogTemplate: Record<string,
        any> = {};
    userName: string = '';
    actionName: string = '';
    functionName: string = '';
    createdAt: string = '';

    async getData(page: {
        page: number,
        size: number
    }) {
        let request = {
            pageNumber: page.page - 1,
            pageSize: page.size,
            common: this.common.trim(),
            filter: {
                userName: this.userName,
                actionName: this.actionName,
                functionName: this.functionName,
                startCreatedAt: this.createdAt[0],
                endCreatedAt: this.createdAt[1]
            },
            sortOrder: this.orderSort,
            sortProperty: this.propertySort
        }
        this.loader.start();
        let res = await this.changeLog.getChangeLog(request);
        this.listChangeLog = res.data;

        this.total = res.dataCount;

        this.listChangeLogToExport = [];
        this.listChangeLogTemplate.push(this.changeLogTemplate);
        this.loader.stop();
        return this.listChangeLog;

    }
    businessLogDetails: string = '';
    duration: string = '';
    entityId: string = '';
    endTime: string = '';
    entityType: string = '';
    errorCode: string = '';
    errorDescription: string = '';
    startTime: string = '';
    clearInput(keyName: string) {
        if (keyName === 'userName') {
            this.userName = '';
        } else if (keyName === 'functionName') {
            this.functionName = '';
        }
        this.handleSearch();
    }
    action: any[] = [
        {
            label: 'INSERT',
            value: 'INSERT'
        }, {
            label: 'UPDATE',
            value: 'UPDATE'
        }, {
            label: 'DELETE',
            value: 'DELETE'
        }
    ]
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

        this.getData({ page: this.pageNumber, size: this.pageSize });
    }
    //   async export() {
    //     let request = {
    //         pageNumber: 0,
    //         pageSize: 0,
    //         common: '',
    //         filter: {
    //             userName: '',
    //             actionName: '',
    //             functionName: '',
    //             startCreatedAt: this.createdAt[0],
    //             endCreatedAt: this.createdAt[1]
    //         },
    //         sortOrder: this.orderSort,
    //         sortProperty: this.propertySort
    //     };
    //     this.loader.start();
    //     let res = await this.changeLog.getChangeLog(request);
    //     let listChangeLog = res.data;
    //     let header = Object.keys(listChangeLog[0]);

    //     for (let item of listChangeLog) {
    //         if (item.createdAt) {
    //             item.createdAt = this.formatDate(item.createdAt);
    //         }
    //     }
    //     this.loader.stop();
    // }

    async export(startId: string = "1") {
        const batchSize = 10;
        const batchIds = Array.from({ length: batchSize }, (_, index) => (parseInt(startId) + index).toString());
        if (batchIds.length === 0) {
            return;
        }
        for (const id of batchIds) {
            let request = {
                pageNumber: 0,
                pageSize: 0,
                common: '',
                filter: {
                    userName: '',
                    actionName: '',
                    functionName: '',
                    createdAt: ''
                },
                sortOrder: this.orderSort,
                sortProperty: this.propertySort
            };

            let res = await this.changeLog.getDataChangleLog(request, id);
            let listChangeLog = res.data;
            let header = Object.keys(listChangeLog[0]);
        }

        await this.export((parseInt(startId) + batchSize).toString());
    }
    ivisibleInfor: boolean = false;
    currentChangeLog: any = '';

    editChangeLog(changeLog: any) {
        this.currentChangeLog = changeLog;
        this.ivisibleInfor = true;
    }

    headers: any[] = [];

}
