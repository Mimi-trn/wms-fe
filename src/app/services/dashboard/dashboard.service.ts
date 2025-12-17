import { Injectable } from "@angular/core";
import { BaseService } from "../baseService.service";

@Injectable({
  providedIn: "root",
})
export class DashboardService {
  constructor(private baseService: BaseService) { }

  getInfo(data: any) {
    return this.baseService.postData(`api/dashboard/info`, data);
  }

  getListItemExpiredDate(data: any) {
    return this.baseService.postData(`api/dashboard/item-list`, data);
  }

  getItem() {
    return this.baseService.getData(`api/dashboard/item-group`);
  }

  getListWarning(data: any) {
    return this.baseService.postData(`api/warning/warning-list/now`, data);
  }

  getBill(data: any) {
    return this.baseService.postData(`api/dashboard/billQuantity`, data);
  }

}
