import { Injectable } from '@angular/core';
import { BaseService } from '../baseService.service';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  constructor(private baseService: BaseService) {}

  getListParticipant(data: any) {
    return this.baseService.postData(`api/employees`, data);
  }

  createInventorySheet(data: any) {
    return this.baseService.postData(`api/inventory-forms/new`, data);
  }

  updateInventorySheet(data: any) {
    return this.baseService.putData(`api/inventory-forms/update`, data);
  }

  getListInventorySheet(data: any) {
    return this.baseService.postData(`api/inventory-forms/search`, data);
  }

  changeStatusInventorySheet(data: any, status: number) {
    return this.baseService.putData(
      `api/inventory-forms/status/${status}`,
      data
    );
  }

  getListIventoryRequest(data: any) {
    return this.baseService.postData(`api/inventory-requests/search`, data);
  }

  createNewInventoryRequest(data: any) {
    return this.baseService.postData(`api/inventory-requests/new`, data);
  }

  updateInventoryRequest(data: any) {
    return this.baseService.putData(`api/inventory-requests/update`, data);
  }

  getListWarehouse(data: any) {
    return this.baseService.postData(`api/warehouses`, data);
  }

  getListItemWithWarehouse(data: any) {
    return this.baseService.postData(`api/stock/v2`, data);
  }

  getListItemWithInventoryRequestCode(data: any) {
    return this.baseService.postData(`api/items/inventory`, data);
  }

  getListItemWithInventoryFormCode(data: any) {
    return this.baseService.postData(`api/inventory-form-item/search`, data);
  }

  sendReasonRevokeInventoryRequest(data: any) {
    return this.baseService.putData(`api/inventory-requests/update`, data);
  }

  sendReasonRefusalInventoryRequest(data: any) {
    return this.baseService.putData(`api/inventory-requests/update`, data);
  }

  revokeAndRefuseRequest(status: any, data: any) {
    return this.baseService.putData(
      `api/inventory-requests/status/${status}`,
      data
    );
  }
}
