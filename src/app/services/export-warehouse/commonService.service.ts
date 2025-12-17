import { Injectable } from '@angular/core';
import { BaseService } from '../baseService.service';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  constructor(private baseService: BaseService) {}

  getListEmailConfig(data: any) {
    return this.baseService.postData(`api/email-configuration`, data);
  }

  putEmailConfig(data: any){
    return this.baseService.putData(`api/email-configuration`, data)
  }

  getListEmployees(data: any) {
    return this.baseService.postData(`api/employees`, data);
  }

  getListGroup() {
    return this.baseService.getData(`api/team-group`);
  }

  async getWarehouse() {
    return await this.baseService.getData(`api/warehouses`);
  }
  async getListApprovedBy() {
    return await this.baseService.getData(`api/approved-by`);
  }

  async getTeamGroup() {
    return await this.baseService.getData(`api/team-group`);
  }

  async getListTechForm(data: any) {
    return await this.baseService.postData(`api/tech-form`, data);
  }

  async getListProduct(data: any) {
    return await this.baseService.postData(
      `api/tech-form/bom-body-card-material`,
      data
    );
  }

  async createReasonRefuseExportRequest(exportRequestCode: any, content: any) {
    return await this.baseService.postData(`api/reason`, {
      exportRequestCode: exportRequestCode,
      content: content,
    });
  }

  async createReasonRefuseGDN(gdnCode: any, content: any) {
    return await this.baseService.postData(`api/reason`, {
      gdnCode: gdnCode,
      content: content,
    });
  }

  async createRevokeExportRequest(exportRequestCode: any, content: any) {
    return await this.baseService.postData(`api/reason/revoke`, {
      exportRequestCode: exportRequestCode,
      content: content,
    });
  }

  async createRevokeGDN(gdnCode: any, content: any) {
    return await this.baseService.postData(`api/reason/revoke`, {
      gdnCode: gdnCode,
      content: content,
    });
  }

  async readRevokeExportRequest(exportRequestCode: any) {
    return await this.baseService.getData(
      `api/reason/export-request?code=${exportRequestCode}&type=2 `
    );
  }

  async readRefuseExportRequest(exportRequestCode: any) {
    return await this.baseService.getData(
      `api/reason/export-request?code=${exportRequestCode}&type=1 `
    );
  }

  async readRevokeGDN(gdnCode: any) {
    return await this.baseService.getData(
      `api/reason/gdn?code=${gdnCode}&type=2 `
    );
  }

  async readRefuseGDN(gdnCode: any) {
    return await this.baseService.getData(
      `api/reason/gdn?code=${gdnCode}&type=1 `
    );
  }
}
