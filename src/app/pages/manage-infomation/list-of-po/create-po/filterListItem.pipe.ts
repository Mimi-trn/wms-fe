import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterListItem',
})
export class FilterListItemPipe implements PipeTransform {
  transform(
    list: readonly any[],
    productCode: string,
    proName: string,
    description: string,
    uom: string
  ): any {
    let filteredData: any;
    filteredData = proName
      ? list.filter((item: any) => this.checkProductName(item, proName))
      : list;
    filteredData = productCode
      ? filteredData.filter((item: any) => this.checkProductCode(item, productCode))
      : filteredData;
    filteredData = description
      ? filteredData.filter((item: any) => this.checkDescription(item, description))
      : filteredData;
    filteredData = uom
      ? filteredData.filter((item: any) => this.checkUom(item, uom))
      : filteredData;
    return filteredData;
  }

  checkProductCode(item: any, productCode: string): boolean {

    return item.productCode != null &&
      item.productCode.toLowerCase().indexOf(productCode.trim().toLowerCase()) >
      -1;

  }

  checkProductName(item: any, productName: string): boolean {

    return item.proName != null &&
      item.proName.toLowerCase().indexOf(productName.trim().toLowerCase()) >
      -1;
  }

  checkDescription(item: any, description: string): boolean {
    return item.proName != null &&
      item.proName.toLowerCase().indexOf(description.trim().toLowerCase()) >
      -1;

  }

  checkUom(item: any, uom: string): boolean {
    return item.unit != null &&
      item.unit.toLowerCase().indexOf(uom.trim().toLowerCase()) > -1;
  }
}
