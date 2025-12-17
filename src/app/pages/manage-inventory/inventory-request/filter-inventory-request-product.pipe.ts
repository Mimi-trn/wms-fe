import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterInventoryRequestProduct',
})
export class FilterInventoryRequestProductPipe implements PipeTransform {
  transform(
    list: readonly any[],
    productCode: string,
    proName: string,
    description: string,
    unit: string
  ) {
    let filteredData: any;
    filteredData = productCode
      ? list.filter((item: any) => {
          if (
            item.productCode != null &&
            item.productCode
              .toLowerCase()
              .indexOf(productCode.trim().toLowerCase()) > -1
          ) {
            return true;
          }
          return false;
        })
      : list;
    filteredData = proName
      ? filteredData.filter((item: any) => {
          if (
            item.proName != null &&
            item.proName.toLowerCase().indexOf(proName.trim().toLowerCase()) >
              -1
          ) {
            return true;
          }
          return false;
        })
      : filteredData;
    filteredData = description
      ? filteredData.filter((item: any) => {
          if (
            item.proName != null &&
            item.proName
              .toLowerCase()
              .indexOf(description.trim().toLowerCase()) > -1
          ) {
            return true;
          }
          return false;
        })
      : filteredData;
    filteredData = unit
      ? filteredData.filter((item: any) => {
          if (
            item.unit != null &&
            item.unit.toLowerCase().indexOf(unit.trim().toLowerCase()) > -1
          ) {
            return true;
          }
          return false;
        })
      : filteredData;
    return filteredData;
  }
}
