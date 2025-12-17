import { Injectable } from '@angular/core';
import { BaseService } from '../baseService.service';
const api_url = `api/notification`;
@Injectable({
  providedIn: 'root',
})
export class NotifyService {
  constructor(private baserService: BaseService) {}
  getNotify() {
    return this.baserService.getData(`${api_url}`);
  }

  isReadAll() {
    return this.baserService.getData(`${api_url}/all/isRead`);
  }

  isRead(id: any){
    return this.baserService.getData(`${api_url}/isRead?id=${id}`);
  }
}
