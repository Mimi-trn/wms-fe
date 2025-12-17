import { Injectable } from '@angular/core';
import { BaseService } from '../baseService.service';

@Injectable({
  providedIn: 'root',
})
export class RequestIqcService {
  constructor(private baseService: BaseService) {}

  getListUom() {
    return this.baseService.getData('api/param?param_code=DVT');
  }

  getListItem(data: any) {
    return this.baseService.postData(`api/items/list`, data);
  }

  getListItemNew(data: any) {
    return this.baseService.postData(`api/item-group/item-list`, data);
  }

  postRequestIQC(data: any, importRequestCode: any) {
    return this.baseService.putData(
      `api/import-request/iqc?import-request-code=${importRequestCode}`,
      data
    );
  }
}
