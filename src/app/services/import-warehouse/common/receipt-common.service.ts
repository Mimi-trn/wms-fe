import { Injectable } from '@angular/core';
import { BaseService } from '../../baseService.service';

@Injectable({
  providedIn: 'root',
})
export class ReceiptCommonService {
  constructor(private baseService: BaseService) { }

  async getImportType() {
    return await this.baseService.getData(`api/import-type`);
  }

  async getWarehouse() {
    return await this.baseService.getData(`api/warehouses`);
  }

  async getImportRequestCode(data: any) {
    return await this.baseService.postData(
      `api/import-request?process=false`,
      data
    );
  }

  async getPoCode() {
    return await this.baseService.getData(`api/purchase-order`);
  }

  async getListItemsByPoCode(poCode: String) {
    return await this.baseService.getData(
      `api/items/by-po-code?po_code=${poCode}`
    );
  }

  async updateListItems(data: any) {
    return await this.baseService.postData(`api/items`, data);
  }

  async getListFile(importRequestCode: string) {
    return await this.baseService.getData(
      `api/file?import_request_code=${importRequestCode}`
    );
  }

  async getListReportFile(importRequestCode: string) {
    return await this.baseService.getData(
      `api/file?import_request_code=${importRequestCode}&type=2`
    );
  }


  async downloadFile(id: number) {
    return await this.baseService.postData(`api/file/download/${id}`, '');
  }

  async changeStatusToWaitQc(code: string, data: any) {
    return await this.baseService.postData(
      `api/items/change-status?import_request_code=${code}`,
      data
    );
  }

  async getPoAvailable(data: any) {
    return await this.baseService.postData(
      `api/purchase-order/available`,
      data
    );
  }

  async getListApprovedBy() {
    return await this.baseService.getData(`api/approved-by`);
  }

  async getTeamGroup() {
    return await this.baseService.getData(`api/team-group`);
  }

  async getAllContract(data: any) {
    return await this.baseService.postData(
      `api/consignment-contract/search`,
      data
    );
  }

  async getListItemByContractCode(contractCode: string) {
    return await this.baseService.postData(
      `api/consignment-contract/item-list`,
      {
        pageIndex: 0,
        pageSize: 0,
        common: '',
        sortProperty: '',
        sortOrder: '',
        filter: {
          consignmentContractCode: contractCode,
        },
      }
    );
  }

  async getListItemBySoCode(soCode: string) {
    return await this.baseService.postData(
      `api/consignment-contract/item-list`,
      {
        pageIndex: 0,
        pageSize: 0,
        common: '',
        sortProperty: '',
        sortOrder: '',
        filter: {
          productOrderCode: soCode,
        },
      }
    );
  }

  async update(importRequestCode: any, payload: any) {
    return await this.baseService.postData(`api/import-request/approve?import_request_code=${importRequestCode}`, payload);
  }

}
