import { Injectable } from '@angular/core';
import { BaseService } from '../baseService.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class WorkOrderService {
  constructor(
    private http: HttpClient,
    private baseService: BaseService,
    private loadService: NgxUiLoaderService
  ) { }

  async postData(url: string, data: any): Promise<any> {
    try {
      let response = await this.http
        .post<any>(`${url}`, data, {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }),
          observe: 'response',
        })
        .toPromise();
      if (response?.status == 200 && response?.body) {
        this.loadService.stop();
        return response?.body;
      } else {
        throw new Error(`${response?.body.result.message}`);
      }
    } catch (error: any) {
      Swal.fire(`Cảnh báo`, `${error.message}`, `error`);
      throw error;
    }
  }

  getListWOFromAPS(data: any) {
    return this.baseService.postData(`api/wo`, data);
  }

  getProduct(data: any) {
    return this.baseService.postData(`api/item-export/product`, data)
  }

  getListItemsMaterialExport(data: any) {
    return this.baseService.postData(`api/item-export/material`, data)
  }

  getItem(request: any) {
    return this.baseService.postData(`api/item-group/item-list`, request)
  }

  createWO(request: any) {
    return this.baseService.postData(`api/wo/create `, request)
  }

}
