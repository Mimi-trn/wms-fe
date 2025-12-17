import { Injectable } from '@angular/core';
import { BaseService } from '../../baseService.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environment/environment';


const api_url = 'api/employees';

@Injectable({
    providedIn: 'root',
})
export class EmployeeService {
    path = environment.api_end_point;
    constructor(private baseService: BaseService, private http: HttpClient) { }

    getListEmployee(data: any) {
        return this.baseService.postData(api_url, data);
    }

    createEmployee(data: any) {
        return this.baseService.postData(`${api_url}/create`, data);
    }

    deleteEmployee(code: any) {
        return this.baseService.deleteData(`${api_url}/delete?employeeCode=${code}`);
    }

    updateEmployee(data: any) {
        return this.baseService.postData(`${api_url}/update`, data);
    }

    exportStockNew() {
        return this.http.get(
            `${this.path}/api/employees/export-employee`,

            {
                responseType: 'blob',
                observe: 'response',
            }
        );
    }
}
