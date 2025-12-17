import { Injectable } from '@angular/core';
import { BaseService } from '../baseService.service';

const api_url = `api/reason`;
@Injectable({
  providedIn: 'root',
})
export class ReasonService {
  constructor(private baseService: BaseService) {}

  postReason(data: any) {
    return this.baseService.postData(`${api_url}`, data);
  }

  postRevoke(data: any) {
    return this.baseService.postData(`${api_url}/revoke`, data);
  }

  getReason(grnCode: any) {
    return this.baseService.getData(`${api_url}?code=${grnCode}`);
  }

  getDraft(grnCode: any) {
    return this.baseService.getData(`${api_url}/grn?code=${grnCode}&type=2`);
  }

  getRevoke(grnCode: any) {
    return this.baseService.getData(`${api_url}?code=${grnCode}&type=2`);
  }

  // Đọc nội dung thu hồi
  async readRevokeGRN(grn: any) {
    return await this.baseService.getData(`api/reason/grn?code=${grn}&type=2 `);
  }

  // Đọc nội dung từ chối
  async readRefuseGRN(grn: any) {
    return await this.baseService.getData(`api/reason/grn?code=${grn}&type=1 `);
  }
}
