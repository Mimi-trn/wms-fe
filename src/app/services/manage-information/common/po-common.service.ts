import { Injectable } from '@angular/core';
import { BaseService } from '../../baseService.service';
const api_url = 'api/param';
const api_url_vendor = 'api/vendor';
const api_url_items = 'api/items';
@Injectable({
  providedIn: 'root',
})
export class PoCommonService {
  constructor(private baseService: BaseService) { }

  getUnit() {
    return this.baseService.getData(`${api_url}?param_code=DVT`);
  }

  getCurrency() {
    return this.baseService.getData(`${api_url}?param_code=DVTT`);
  }

  getTransport() {
    return this.baseService.getData(`${api_url}?param_code=PTVC`);
  }

  getVendor() {
    return this.baseService.getData(`api/vendor/list`);
  }


  getVendorWithout() {
    return this.baseService.getData(`${api_url_vendor}/list`);
  }

  getItems() {
    return this.baseService.getData(`${api_url_items}`);
  }

  getItemsNVL(data: any) {
    return this.baseService.postData(`api/items/list`, data);
  }

  postCurrency(data: any) {
    return this.baseService.postData(`${api_url}`, data);
  }

  getItemGroup() {
    return this.baseService.getData(`api/items/item-group`);
  }
}
