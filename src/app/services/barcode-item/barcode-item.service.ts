import { Injectable } from '@angular/core';
import { BaseService } from '../baseService.service';

@Injectable({
  providedIn: 'root',
})
export class BarcodeItemService {
  constructor(private baseService: BaseService) {}

  getListQR(data: any) {
    return this.baseService.postData(`api/package`, data);
  }

  createQR(data: any) {
    return this.baseService.postData(`api/package/new`, data);
  }

  getListItemQR(data: any) {
    return this.baseService.postData(`api/items/qrcode`, data);
  }

  getDVT() {
    return this.baseService.getData(`api/param?param_code=DVT`);
  }

  getWarehouseInLocation(data: any) {
    return this.baseService.postData(`api/locations/location-list`, data);
  }

  getLocationInProduct(data: any) {
    return this.baseService.postData(`api/package/location-package`, data);
  }

  getLocationInCreateNewLocation(data: any) {
    return this.baseService.postData(`api/locations/location-list`, data);
  }

  getSmallLocation(data: any) {
    return this.baseService.postData(`api/locations/smallest`, data);
  }

  createLocation(data: any) {
    return this.baseService.postData(`api/package/location-package-new`, data);
  }

  updatePackage(data: any) {
    return this.baseService.putData(`api/package`, data);
  }

  deletePackage(id: any) {
    return this.baseService.deleteData(`api/package?id=${id}`);
  }

  getLocationByProduct(id: any) {
    return this.baseService.getData(
      `api/location-item/get-location-by-product/${id}`
    );
  }
}
