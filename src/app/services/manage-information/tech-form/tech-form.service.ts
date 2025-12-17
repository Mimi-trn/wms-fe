import { Injectable } from '@angular/core';
import { BaseService } from '../../baseService.service';

@Injectable({
  providedIn: 'root',
})
export class TechFormService {
  constructor(private baseService: BaseService) {}

  getTechForm(data: any) {
    return this.baseService.postData(`api/tech-form`, data);
  }

  getProductionRequirement(data: any) {
    return this.baseService.postData(
      `api/tech-form/production-requirement`,
      data
    );
  }

  getMaterial(data: any) {
    return this.baseService.postData(
      `api/tech-form/bom-body-card-material`,
      data
    );
  }
}
