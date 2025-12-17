import { Injectable } from '@angular/core';
import { BaseService } from '../../baseService.service';

@Injectable({
  providedIn: 'root',
})
export class LocationPackageService {
  constructor(private baseService: BaseService) {}

  getListLocationPackage(data: any) {
    return this.baseService.postData(`api/package/location-package`, data);
  }

  getListItem(data: any) {
    return this.baseService.postData(`api/items/qrcode`, data);
  }

  getListLocation(data: any) {
    return this.baseService.postData(`api/locations/location-list`, data);
  }

  getLocationInCreateNewLocation(data: any) {
    return this.baseService.postData(`api/locations/location-list`, data);
  }

  getListQR(data: any) {
    return this.baseService.postData(`api/package`, data);
  }

  createLocation(data: any) {
    return this.baseService.postData(`api/package/location-package-new`, data);
  }
}
