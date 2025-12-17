import { Injectable } from '@angular/core';
import { BaseService } from '../../baseService.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environment/environment';

const api_url = 'api/grn';

@Injectable({
  providedIn: 'root',
})
export class GrnService {
  constructor(private baseService: BaseService, private http: HttpClient) {}
  path: string = environment.api_end_point;

  getList(data: any) {
    return this.baseService.postData(`${api_url}/all`, data);
  }

  changeStatus(grnCode: any) {
    return this.baseService.putData(`api/grn/import/${grnCode}`, {});
  }

  getPending(data: any) {
    return this.baseService.postData(`${api_url}/pending`, data);
  }

  getListItem(poCode: any, status: boolean) {
    return this.baseService.getData(
      `api/purchase-order/detail?poCode=${poCode}&qc-passed=${status}`
    );
  }

  getView(data: any) {
    return this.baseService.getData(`${api_url}?grnCode=${data}`);
  }

  async postGrn(formData: any) {
    try {
      let headers = new HttpHeaders();
      headers.append('Content-Type', 'multipart/form-data');
      let response = await this.http
        .post<any>(`${this.path}/${api_url}/add`, formData, {
          headers: headers,
          observe: 'response',
        })
        .toPromise();
      if (response?.status == 200 && response?.body) {
        return response?.body;
      } else {
        throw new Error(`${response?.body.result.message}`);
      }
    } catch (error: any) {
      if (error.error.result) {
      } else {
      }
      throw error;
    }
  }

  saveDraft(data: any) {
    return this.baseService.postData(`${api_url}/draft`, data);
  }

  putGrn(data: any, grnCode: any) {
    return this.baseService.putData(`${api_url}/${grnCode}`, data);
  }

  reCall(grnCode: any, status: any, data: any) {
    return this.baseService.putData(
      `${api_url}/status?grnCode=${grnCode}&status=${status}`,
      data
    );
  }

  getListItemWithWarehouseOther(importRequestCode: any) {
    return this.baseService.getData(
      `api/import-request/detail?code=${importRequestCode}&qc-passed=true`
    );
  }

  getListItemWithImportRequest(code: any) {
    return this.baseService.getData(
      `api/import-request/detail?code=${code}&qc-passed=true`
    );
  }
}
