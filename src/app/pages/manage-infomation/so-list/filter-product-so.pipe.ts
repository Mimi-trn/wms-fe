import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterProductSo',
})
export class FilterProductSoPipe implements PipeTransform {
  transform(
    list: readonly any[],
    productCode: string,
    productName: string,
    description: string,
    uom: string
  ): any {
    let filteredData: any;
    filteredData = productCode
      ? list.filter((item: any) => this.checkProductCode(item, productCode))
      : list;
    filteredData = productName
      ? filteredData.filter((item: any) =>
          this.checkProductName(item, productName)
        )
      : filteredData;
    filteredData = description
      ? filteredData.filter((item: any) =>
          this.checkDescription(item, description)
        )
      : filteredData;
    filteredData = uom
      ? filteredData.filter((item: any) => this.checkUom(item, uom))
      : filteredData;
    return filteredData;
  }

  checkProductCode(item: any, productCode: string): boolean {
    if (
      item.productCode != null &&
      item.productCode.toLowerCase().indexOf(productCode.trim().toLowerCase()) >
        -1
    ) {
      return true;
    }
    return false;
  }
  checkProductName(item: any, productName: string): boolean {
    if (
      item.productName != null &&
      item.productName.toLowerCase().indexOf(productName.trim().toLowerCase()) >
        -1
    ) {
      return true;
    }
    return false;
  }
  checkDescription(item: any, description: string): boolean {
    if (
      item.description != null &&
      item.description.toLowerCase().indexOf(description.trim().toLowerCase()) >
        -1
    ) {
      return true;
    }
    return false;
  }
  checkUom(item: any, uom: string): boolean {
    if (
      item.uom != null &&
      item.uom.toLowerCase().indexOf(uom.trim().toLowerCase()) > -1
    ) {
      return true;
    }
    return false;
  }
}
