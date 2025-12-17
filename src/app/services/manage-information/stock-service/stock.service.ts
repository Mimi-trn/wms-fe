import { Injectable } from '@angular/core';
import { BaseService } from '../../baseService.service';
import { environment } from '../../../../environment/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class StockService {
  path = environment.api_end_point;
  constructor(private baseService: BaseService, private http: HttpClient) { }

  getLocationStock(data: any) {
    return this.baseService.postData(`api/stock/location_stock`, data);
  }

  getListStock(data: any) {
    return this.baseService.postData(`api/stock/v2`, data);
  }

  getDetailStock(id: any, data: any) {
    return this.baseService.postData(`api/items/stock?id=${id}`, data);
  }

  exportStock(data: any, mode: 1 | 2) {
    return this.http.post(
      `${this.path}/api/stock/export-excel/${mode === 1 ? 'stock' : 'import-export'
      }`,
      data,
      {
        responseType: 'blob',
        observe: 'response',
      }
    );
  }

  exportStockNew(data: any) {
    return this.http.post(
      `${this.path}/api/stock/export-excel/stock-exists`,
      data,
      {
        responseType: 'blob',
        observe: 'response',
      }
    );
  }

  getLocationWarehouseList(page: number, pageSize: number) {
    return this.http.post<{
      data: { locationCode: string; locationName: string }[];
      totalElements: number;
    }>(`${this.path}/api/locations/location-list`, {
      common: '',
      pageIndex: page,
      pageSize: pageSize,
      filter: {
        parent: 0,
      },
      sortProperty: 'updatedAt',
      sortOrder: 'descend',
    });
  }

  getProductList(page: number, pageSize: number) {
    return this.http.post<{
      data: { productCode: string; itemName: string }[];
      totalElements: number;
    }>(`${this.path}/api/items/export-list`, {
      pageIndex: page,
      pageSize: pageSize,
      filter: {
        productCode: '',
        itemName: '',
        description: '',
        itemGroup: null,
        uom: null,
      },
      common: '',
      sortProperty: '',
      sortOrder: '',
    });
  }
  getGroupProductList(data: any) {
    return this.baseService.postData(`api/item-group/list`, data);
  }

  async getWarehouse() {
    return await this.baseService.getData(`api/warehouses`);
  }

  getExportStocks(productCode: string, warehouseCode: string) {
    return this.http.post(
      `${this.path}/api/item-export/stock/physical/${productCode}/${warehouseCode}`,
      {
        pageIndex: 0,
        pageSize: 100000,
        filter: {
          productCode: '',
          itemName: '',
          description: '',
          itemGroup: null,
          uom: null,
        },
        common: '',
        sortProperty: '',
        sortOrder: '',
      }
    );
  }

  getImportStocks(productCode: string, warehouseCode: string) {
    return this.http.post(
      `${this.path}/api/items/stock/physical/${productCode}/${warehouseCode}`,
      {
        pageIndex: 0,
        pageSize: 100000,
        filter: {
          productCode: '',
          itemName: '',
          description: '',
          itemGroup: null,
          uom: null,
        },
        common: '',
        sortProperty: '',
        sortOrder: '',
      }
    );
  }

  createItem(payload: any) {
    return this.http.post(`${this.path}/api/item-group/create`, payload)
  }
}
