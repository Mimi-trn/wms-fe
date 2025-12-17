import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterItemInExportRequest',
})
export class FilterItemInExportRequestPipe implements PipeTransform {
  transform(
    list: readonly any[],
    productCode: string,
    itemName: string,
    description: string,
    uom: string,
    note: string
  ): any {
    let filteredData: any;
    filteredData = productCode
      ? list.filter((item: any) => this.checkProductCode(item, productCode))
      : list;
    filteredData = itemName
      ? filteredData.filter((item: any) => this.checkItemName(item, itemName))
      : filteredData;
    filteredData = description
      ? filteredData.filter((item: any) =>
          this.checkDescription(item, description)
        )
      : filteredData;
    filteredData = uom
      ? filteredData.filter((item: any) => this.checkUom(item, uom))
      : filteredData;
    filteredData = note
      ? filteredData.filter((item: any) => this.checkNote(item, note))
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
  checkItemName(item: any, itemName: string): boolean {
    if (
      item.itemName != null &&
      item.itemName.toLowerCase().indexOf(itemName.trim().toLowerCase()) > -1
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
  checkUom(item: any, unit: string): boolean {
    if (
      item.unit != null &&
      item.unit.toLowerCase().indexOf(unit.trim().toLowerCase()) > -1
    ) {
      return true;
    }
    return false;
  }
  checkNote(item: any, note: string): boolean {
    if (
      item.note != null &&
      item.note.toLowerCase().indexOf(note.trim().toLowerCase()) > -1
    ) {
      return true;
    }
    return false;
  }
}
