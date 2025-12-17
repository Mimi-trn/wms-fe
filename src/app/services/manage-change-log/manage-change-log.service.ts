import { Injectable } from '@angular/core';
import { BaseService } from '../baseService.service';

@Injectable({
  providedIn: 'root'
})
export class ManageChangeLogService {

  constructor(private baseService: BaseService
    ) { }
    api_url = 'api/change-log';
  
    async searchCommonAutocomplete(request: any) {
      return await this.baseService.postData(`api/change-log/common-autocomplete`, request);
    }
    async getChangeLog(request: any) {
      let res = await this.baseService.postData(`${this.api_url}`, request);
      return res;
    }
    async getDataChangleLog(request: any, id: string){
      return await this.baseService.postData(`api/change-log/${id}`, request)
    }
}
