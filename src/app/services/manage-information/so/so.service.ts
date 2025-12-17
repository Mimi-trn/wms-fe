import { Injectable } from '@angular/core';
import { BaseService } from '../../baseService.service';

let url = 'api/product-order';

@Injectable({
  providedIn: 'root',
})
export class SoService {
  constructor(private baseService: BaseService) {}

  listSO(data: any) {
    return this.baseService.postData(`${url}/`, data);
  }

  listItem(data: any) {
    return this.baseService.postData(`${url}/item-list`, data);
  }
}
