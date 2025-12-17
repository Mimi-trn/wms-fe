import { Injectable } from '@angular/core';
import { BaseService } from '../baseService.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environment/environment';

@Injectable({
    providedIn: 'root',
})
export class VendorService {
    path = environment.api_end_point;
    constructor(private baseService: BaseService, private http: HttpClient) { }
    search(body: any) {
        return this.baseService.postData(`api/vendor/search`, body);
    }

    create(body: any) {
        return this.baseService.postData(`api/vendor/create`, body);
    }

    update(body: any) {
        return this.baseService.postData(`api/vendor/update`, body);
    }

    delete(vendorCode: any) {
        return this.baseService.deleteData(`api/vendor/delete/${vendorCode}`);
    }

    exportStockNew() {
        return this.http.get(
            `${this.path}/api/vendor/export-vendor`,

            {
                responseType: 'blob',
                observe: 'response',
            }
        );
    }
}