import { Injectable } from '@angular/core';
import { BaseService } from '../baseService.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environment/environment';
@Injectable({
    providedIn: 'root',
})
export class ExportReportService {
    path = environment.api_end_point;
    constructor(private baseService: BaseService, private http: HttpClient) { }
    getReport(body: any) {
        return this.baseService.postData(`api/stock-location/report`, body);
    }
    exxport(body: any) {
        return this.baseService.postData(`api/stock-location/export-report`, body);
    }

    exportStockNew(data: any) {
        return this.http.post(
            `${this.path}/api/stock-location/export-report`,
            data,
            {
                responseType: 'blob',
                observe: 'response',
            }
        );
    }

    getAllVendor() {
        return this.baseService.getData(`api/stock-location/vendor`);
    }
}