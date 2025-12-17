import { Injectable } from '@angular/core';
import { PageFilter } from 'src/app/models/request/PageFilter.model';
import { ImportRequest } from 'src/app/models/manage-warehouse-receipt/list-warehouse-receipt/importRequest.model';
import { BaseService } from '../../baseService.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environment/environment';
import Swal from 'sweetalert2';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { NzUploadFile } from 'ng-zorro-antd/upload';

@Injectable({
  providedIn: 'root',
})
export class ImportRequestService {
  constructor(
    private http: HttpClient,
    private baseService: BaseService,
    private loadService: NgxUiLoaderService
  ) {}

  path: string = environment.api_end_point;

  createImportRequestWithTypeThree(data: any, importType: any) {
    return this.baseService.postData(
      `api/import-request/create-update?import_request_type=${importType}`,
      data
    );
  }
  createDraftImportRequestWithTypeThree(data: any, importType: any) {
    return this.baseService.postData(
      `api/import-request/create-update-draft?import_request_type=${importType}`,
      data
    );
  }

  async getAllImportRequest(data: PageFilter, process: boolean) {
    return await this.baseService.postData(
      `api/import-request?process=${process}`,
      data
    );
  }

  async getAllImportRequestAndType(
    data: PageFilter,
    process: boolean,
    type: number
  ) {
    return await this.baseService.postData(
      `api/import-request?process=${process}&type=${type}`,
      data
    );
  }

  async createImportRequestForImportRequestPurchase(
    importType: number,
    formData: FormData
  ): Promise<any> {
    try {
      let headers = new HttpHeaders();
      headers.append('Content-Type', 'multipart/form-data');
      let response = await this.http
        .post<any>(
          `${this.path}/api/import-request/new?import_request_type=${importType}`,
          formData,
          { headers: headers, observe: 'response' }
        )
        .toPromise();
      if (response?.status == 200 && response?.body) {
        return response?.body;
      } else {
        throw new Error(`${response?.body.result.message}`);
      }
    } catch (error: any) {
      this.loadService.stop();
      if (error.error.result) {
        Swal.fire(`Cảnh báo`, `${error.error.result.message}`, `error`);
      } else {
        Swal.fire(`Cảnh báo`, `${error.message}`, `error`);
      }
      throw error;
    }
  }

  async createImportRequest(
    importType: number,
    formData: FormData
  ): Promise<any> {
    try {
      let headers = new HttpHeaders();
      headers.append('Content-Type', 'multipart/form-data');
      let response = await this.http
        .post<any>(
          `${this.path}/api/import-request/create-update?import_request_type=${importType}`,
          formData,
          { headers: headers, observe: 'response' }
        )
        .toPromise();
      if (response?.status == 200 && response?.body) {
        return response?.body;
      } else {
        throw new Error(`${response?.body.result.message}`);
      }
    } catch (error: any) {
      this.loadService.stop();
      if (error.error.result) {
        Swal.fire(`Cảnh báo`, `${error.error.result.message}`, `error`);
      } else {
        Swal.fire(`Cảnh báo`, `${error.message}`, `error`);
      }
      throw error;
    }
  }

  async putImportRequest(id: any, formData: FormData): Promise<any> {
    try {
      let headers = new HttpHeaders();
      headers.append('Content-Type', 'multipart/form-data');
      let response = await this.http
        .put<any>(`${this.path}/api/import-request/resendV2/${id}`, formData, {
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
      this.loadService.stop();
      if (error.error.result) {
        Swal.fire(`Cảnh báo`, `${error.error.result.message}`, `error`);
      } else {
        Swal.fire(`Cảnh báo`, `${error.message}`, `error`);
      }
      throw error;
    }
  }

  async saveDraft(importType: number, formData: FormData): Promise<any> {
    try {
      let headers = new HttpHeaders();
      headers.append('Content-Type', 'multipart/form-data');
      let response = await this.http
        .post<any>(
          `${this.path}/api/import-request/create-update-draft?import_request_type=${importType}`,
          formData,
          { headers: headers, observe: 'response' }
        )
        .toPromise();
      if (response?.status == 200 && response?.body) {
        return response?.body;
      } else {
        throw new Error(`${response?.body.result.message}`);
      }
    } catch (error: any) {
      this.loadService.stop();
      if (error.error.result) {
        Swal.fire(`Cảnh báo`, `${error.error.result.message}`, `error`);
      } else {
        Swal.fire(`Cảnh báo`, `${error.message}`, `error`);
      }
      throw error;
    }
  }

  async getImportRequestDetail(code: any) {
    return await this.baseService.getData(
      `api/import-request/detail?code=${code}`
    );
  }

  async cancelRequest(code: any, data: any) {
    return await this.baseService.postData(
      `api/import-request/cancel-request?code=${code}`,
      data
    );
  }

  revokeImportRequest(data: any) {
    return this.baseService.postData(`api/reason`, data);
  }

  async changeStatus(code: string, status: number) {
    return await this.baseService.getData(
      `api/import-request/change-status?code=${code}&status=${status}`
    );
  }

  async withDrawIqcRequest(data: any) {
    return await this.baseService.postData(`api/reason/revoke`, data);
  }

  revoke(data: any) {
    return this.baseService.postData(`api/reason/revoke`, data);
  }

  getReasonRevoke(code: any) {
    return this.baseService.getData(
      `api/reason/import-request?code=${code}&type=1`
    );
  }
}
