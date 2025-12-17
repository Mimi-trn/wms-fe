import { Injectable } from '@angular/core';
import { BaseService } from '../../baseService.service';

const url_contract = 'api/consignment-contract';
const url_item = 'api/items';
@Injectable({
  providedIn: 'root',
})
export class ContractService {
  constructor(private baseService: BaseService) {}

  getList(data: any) {
    return this.baseService.postData(`${url_contract}/search`, data);
  }

  getFile(grnCode: any) {
    return this.baseService.getData(`api/file/${grnCode}/2`);
  }

  getItemWithContractCode(data: any) {
    return this.baseService.postData(`${url_contract}/item-list`, data);
  }

  getListCustomer(data: any) {
    return this.baseService.postData(
      `${url_contract}/customer-list-from-mdm`,
      data
    );
  }

  getItems(data: any) {
    return this.baseService.postData(`${url_item}/coitt`, data);
  }

  newContract(data: any) {
    return this.baseService.postData(`${url_contract}/new`, data);
  }

  newListItemWithContract(data: any) {
    return this.baseService.postData(`${url_item}/new`, data);
  }

  updateDraft(data: any, params: any) {
    return this.baseService.putData(`${url_contract}/${params}`, data);
  }
}
