import { Injectable } from '@angular/core';
import { BaseService } from '../baseService.service';

@Injectable({
  providedIn: 'root',
})
export class WarningService {
  constructor(private baseService: BaseService) {}

  getConfiguration() {
    return this.baseService.getData(`api/warning/configuration`);
  }

  read(warningId: any) {
    return this.baseService.getData(`api/warning?warningId=${warningId}`);
  }

  updateConfiguration(data: any) {
    return this.baseService.postData(`api/warning/configuration`, data);
  }

  getListWarning(data: any) {
    return this.baseService.postData(`api/warning/warning-list`, data);
  }

  getDashboardWarning() {
    return this.baseService.getData(`api/dashboard/warning`);
  }
}
