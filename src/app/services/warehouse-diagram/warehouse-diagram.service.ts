import { Injectable } from '@angular/core';
import { BaseService } from '../baseService.service';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { environment } from 'src/environment/environment';
import { ToastrService } from 'ngx-toastr';
@Injectable({
  providedIn: 'root',
})
export class WarehouseDiagramService {
  path: string = '';
  constructor(
    private baseService: BaseService,
    private http: HttpClient,
    private loadService: NgxUiLoaderService,
    private toast: ToastrService
  ) {
    this.path = environment.api_end_point;
  }

  getListLocation(data: any) {
    return this.baseService.postData(`api/locations/location-list-v2`, data);
  }

  deleteLocation(code: any) {
    return this.baseService.deleteData(`api/locations/delete?locationCode=${code}`);
  }

  createNewLocation(data: any) {
    return this.baseService.postData(`api/locations/new`, data);
  }

  updateLocation(data: any) {
    return this.baseService.putData(`api/locations`, data);
  }

  getMappedProduct(data: any, locationCode: any) {
    return this.baseService.postData(
      `api/location-item/get-all/${locationCode}`,
      data
    );
  }

  deleteMappedProduct(id: any) {
    return this.baseService.deleteData(`api/location-item/delete/${id}`);
  }

  getItemsNVL(data: any) {
    return this.baseService.postData(`api/items/list`, data);
  }

  async addMappedProduct(locationCode: any, itemCode: any): Promise<any> {
    try {
      let response = await this.http
        .get<any>(
          `${this.path}/api/location-item/map-item?locationCode=${locationCode}&itemCode=${itemCode}`,
          {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            }),
            observe: 'response',
          }
        )
        .toPromise();
      if (response?.status == 200 && response?.body) {
        return response?.body;
      } else {
        return response?.body;
      }
    } catch (error: any) {
      if (error?.error?.result?.message)
        this.toast.error(error?.error?.result?.message);
      else this.toast.error('Có lỗi xảy ra');
    } finally {
      this.loadService.stop();
    }
  }
}
