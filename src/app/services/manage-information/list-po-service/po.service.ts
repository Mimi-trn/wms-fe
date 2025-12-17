import { Injectable } from '@angular/core';
import { BaseService } from '../../baseService.service';
const api_url = 'api/purchase-order';
@Injectable({
  providedIn: 'root',
})
export class PoService {
  constructor(private baseService: BaseService) {}

  getListPO(data: any) {
    return this.baseService.postData(api_url, data);
  }


  putPO(data: any) {
    return this.baseService.putData(api_url, data);
  }

  createPO(data: any) {
    return this.baseService.postData(`${api_url}/new`, data);
  }

  viewPO(poCode: any) {
    return this.baseService.getData(`${api_url}/detail?poCode=${poCode}`);
  }

  generateRandomString(length: number, prefix: string): string {
    const randomChars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = prefix;

    for (let i = 0; i < length - prefix.length; i++) {
      const randomIndex = Math.floor(Math.random() * randomChars.length);
      result += randomChars.charAt(randomIndex);
    }

    return result;
  }

  fillUnitAndExchangeRate(data: any){
    return this.baseService.postData(`api/vendor-param`, data);
  }
}
