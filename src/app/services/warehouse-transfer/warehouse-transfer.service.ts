import { Injectable } from '@angular/core';
import { BaseService } from '../baseService.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class WarehouseTransferService {
  constructor(private baseService: BaseService, private http: HttpClient) {}

  listWtrRequest(data: any) {
    return this.baseService.postData(`api/transfer-request/paged`, data);
  }

  listWTRNote(data: any) {
    return this.baseService.postData(`api/wtr/all`, data);
  }

  readWTRNote(WTRCode: any) {
    return this.baseService.getData(`api/wtr/detail?wtrCode=${WTRCode}`);
  }

  newTransferRequest(data: any) {
    return this.baseService.postData(`api/transfer-request/add`, data);
  }

  getDetailWtrRequest(WTRCode: any) {
    return this.baseService.getData(
      `api/transfer-request/detail?transferRequestCode=${WTRCode}`
    );
  }

  rejectWtrRequest(wtrCode: any) {
    return this.baseService.putData(
      `api/transfer-request/reject?transferRequestCode=${wtrCode}`,
      {}
    );
  }

  getListLocation(data: any) {
    return this.baseService.postData(`api/stock/location_stock`, data);
  }

  createWtrNote(data: any) {
    return this.baseService.postData(`api/wtr/add`, data);
  }

  getProduct(data: any) {
    return this.baseService.postData(`api/item-group/item-list`, data);
  }
}
