import { BaseService } from './../../baseService.service';
import { Injectable } from '@angular/core';

const api_url = 'api/warehouses';

@Injectable({
  providedIn: 'root'
})

export class InventoryService {

  constructor(
    private baseService: BaseService
  ) { }

  getInventoryList(data: any) {
    return this.baseService.postData(api_url, data);
  }

  postInventory(data: any){
    return this.baseService.postData(`${api_url}/new`, data);
  }

  deleteInventory(warehouseCode: any){
    return this.baseService.deleteData(`${api_url}/${warehouseCode}`)
  }

  activeInventory(warehouseCode: any){
    return this.baseService.postData(`${api_url}/${warehouseCode}`, {})
  }
}
