import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environment/environment';
import Swal from 'sweetalert2';
import { KeycloakService } from 'keycloak-angular';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Injectable({
  providedIn: 'root',
})
export class BaseService {
  path: string = '';
  constructor(
    private http: HttpClient,
    private keyCloack: KeycloakService,
    private loadService: NgxUiLoaderService
  ) {
    this.path = environment.api_end_point;
  }

  async getData(url: string): Promise<any> {
    try {
      let response = await this.http
        .get<any>(`${this.path}/${url}`, {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }),
          observe: 'response',
        })
        .toPromise();
      if (response?.status == 200 && response?.body) {
        this.loadService.stop();
        return response?.body;
      } else {
        throw new Error(`${response?.body.result}`);
      }
    } catch (error: any) {
      // this.loadService.stop();
      // if (error.error) {
      //   Swal.fire(`Thông báo`, `${error.error.result.message}`, `error`);
      // } else {
      //   Swal.fire(`Thông báo`, `${error.message}`, `error`);
      // }
      // throw error;
      if (error.ok == false) {
        Swal.fire(
          `Thông báo`,
          `Có lỗi xảy ra. Vui lòng kiểm tra kết nối`,
          `error`
        );
      }
    }
  }

  async postData(url: string, data: any): Promise<any> {
    try {
      let response = await this.http
        .post<any>(`${this.path}/${url}`, data, {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }),
          observe: 'response',
        })
        .toPromise();
      if (response?.status == 200 && response?.body) {
        this.loadService.stop();
        return response?.body;
      } else {
        throw new Error(`${response?.body.result.message}`);
      }
    } catch (error: any) {
      // Swal.fire(`Thông báo`, `${error.message}`, `error`);
      // throw error;
      if (error.ok == false) {
        Swal.fire(
          `Thông báo`,
          `Có lỗi xảy ra. Vui lòng kiểm tra kết nối`,
          `error`
        );
      }
    }
  }

  async deleteData(url: string): Promise<any> {
    try {
      let response = await this.http
        .delete<any>(`${this.path}/${url}`, {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }),
          observe: 'response',
        })
        .toPromise();
      if (response?.status == 200 && response?.body) {
        this.loadService.stop();
        return response?.body;
      } else {
        throw new Error(`${response?.body.result.message}`);
      }
    } catch (error: any) {
      Swal.fire(`Cảnh báo`, `${error.message}`, `error`);
      throw error;
    }
  }

  async putData(url: string, data: object): Promise<any> {
    try {
      let response = await this.http
        .put<any>(`${this.path}/${url}`, data, {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }),
          observe: 'response',
        })
        .toPromise();
      if (response?.status == 200 && response?.body) {
        this.loadService.stop();
        return response?.body;
      } else {
        throw new Error(`${response?.body.result.message}`);
      }
    } catch (error: any) {
      Swal.fire(`Cảnh báo`, `${error.message}`, `error`);
      throw error;
    }
  }

  async patchData(url: string, data: object): Promise<any> {
    try {
      let response = await this.http
        .patch<any>(`${this.path}/${url}`, data, {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }),
          observe: 'response',
        })
        .toPromise();
      if (response?.status == 200 && response?.body) {
        this.loadService.stop();
        return response?.body;
      } else {
        throw new Error(`${response?.body.result.message}`);
      }
    } catch (error: any) {
      this.loadService.stop();
      if (error.error) {
        Swal.fire(`Cảnh báo`, `${error.error.result.message}`, `error`);
      } else {
        Swal.fire(`Cảnh báo`, `${error.message}`, `error`);
      }
      throw error;
    }
  }
}
