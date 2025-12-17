import { Injectable } from '@angular/core';
import { BaseService } from '../baseService.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environment/environment';
const url = 'api/gdn';
@Injectable({
  providedIn: 'root',
})
export class GDNService {
  constructor(private baseService: BaseService, private http: HttpClient) {}
  newGDN(data: any) {
    return this.baseService.postData(`${url}/add`, data);
  }
  getFileGDN(gdnCode: any) {
    return this.baseService.getData(`api/file/${gdnCode}/2`);
  }

  path: string = environment.api_end_point;

  async postGDN(formData: any) {
    try {
      let headers = new HttpHeaders();
      headers.append('Content-Type', 'multipart/form-data');
      let response = await this.http
        .post<any>(`${this.path}/api/gdn/add`, formData, {
          headers: headers,
          observe: 'response',
        })
        .toPromise();
      if (response?.status == 200 && response?.body) {
        return response?.body;
      } else {
        throw new Error(`${response?.body.result.message}`);
      }
    } catch (error: any) {
      if (error.error.result) {
      } else {
      }
      throw error;
    }
  }
  async putGDN(formData: any, gdnCode: any) {
    try {
      let headers = new HttpHeaders();
      headers.append('Content-Type', 'multipart/form-data');
      let response = await this.http
        .put<any>(`${this.path}/api/gdn/update/${gdnCode}`, formData, {
          headers: headers,
          observe: 'response',
        })
        .toPromise();
      if (response?.status == 200 && response?.body) {
        return response?.body;
      } else {
        throw new Error(`${response?.body.result.message}`);
      }
    } catch (error: any) {
      if (error.error.result) {
      } else {
      }
      throw error;
    }
  }

  updateGDN(data: any) {
    return this.baseService.postData(`api/gdn/update`, data);
  }

  updatedDraftGDN(data: any) {
    return this.baseService.postData(`${url}/update-draft`, data);
  }

  draftGDN(data: any) {
    return this.baseService.postData(`${url}/add-draft`, data);
  }

  listGDN(data: any) {
    return this.baseService.postData(`${url}/all`, data);
  }

  readGDN(GDNCode: any) {
    return this.baseService.getData(`${url}/detail?gdn-code=${GDNCode}`);
  }

  approveGDN(gdnCode: any) {
    return this.baseService.getData(`api/gdn/approve?code=${gdnCode}`);
  }
  updatePickingStatus(gdnCode: any) {
    return this.baseService.putData(`${url}/export/${gdnCode}`, {});
  }
  getListLocation(data: any) {
    return this.baseService.postData(`api/locations/location-list`, data);
  }
}
