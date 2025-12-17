import { HttpClient } from '@angular/common/http';
import { Injectable, Pipe } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../baseService.service';
import { environment } from 'src/environment/environment';

const url = 'api/export-request';
@Injectable({
  providedIn: 'root',
})
export class ExportRequestService {
  path: string = '';
  constructor(
    private baseService: BaseService,
    private httpClient: HttpClient
  ) {
    this.path = environment.api_end_point;
  }

  newExportRequest(data: any) {
    return this.baseService.postData(`${url}/add`, data);
  }

  draftExportRequest(data: any) {
    return this.baseService.postData(`${url}/add-draft`, data);
  }

  listExportRequest(data: any) {
    return this.baseService.postData(`${url}`, data);
  }

  readExportRequest(exportRequestCode: any) {
    return this.baseService.getData(
      `${url}/detail?export-request-code=${exportRequestCode}`
    );
  }

  getItemsOfOtherExportNew(data: any) {
    return this.baseService.postData(`api/item-group/item-list`, data);
  }
  // Yêu cầu xuất kho khác - Lấy danh sách hàng hóa
  getItemsOfOtherExport(data: any) {
    return this.baseService.postData(`api/stock/v2`, data);
  }

  // Danh sách wo - xuất kho sản xuất
  getListWo(data: any) {
    return this.baseService.postData(`api/wo`, data);
  }

  // Danh sách người nhận hàng
  getListReceiver(data: any) {
    return this.baseService.postData(`api/employees/v2`, data);
  }

  /**
   * Danh sách hàng hóa xuất kho sản xuất
   */
  getListItemWithExportMaterial(data: any) {
    return this.baseService.postData(`api/item-export/material`, data);
  }

  /**
   * Danh sách hàng hóa xuất kho thành phẩm
   */
  getListItemWithExportProduct(data: any) {
    return this.baseService.postData(`api/item-export/product`, data);
  }
  /**
   * Danh sách khách hàng xuất kho thành phẩm
   */
  getListCustomer(data: any) {
    return this.baseService.postData(
      `api/consignment-contract/customer-list-from-mdm`,
      data
    );
  }

  getLocationWarehouse(data: any) {
    return this.baseService.postData(`api/locations/location-list`, data);
  }

  getLocationCode(productCode: any, locationId: any) {
    return this.baseService.getData(
      `api/locations/by-product?productCode=${productCode}&locationId=${locationId}`
    );
  }

  getGrnCode(productCode: any, locationId: any) {
    return this.baseService.getData(
      `api/grn/by-location?productCode=${productCode}&locationId=${locationId}`
    );
  }

  getItemQuantity(productCode: any, grnCode: any, locationId: any) {
    return this.baseService.getData(
      `api/package/location-package?productCode=${productCode}&grnCode=${grnCode}&locationId=${locationId}`
    );
  }

  getListLocation(data: any) {
    return this.baseService.postData(`api/stock/location_stock`, data);
  }

  getDataPrintPDF(request: any): Observable<any> {
    return this.httpClient.get(
      `${this.path}/api/gdn/detail?gdn-code=${request}`
    );
  }
}
