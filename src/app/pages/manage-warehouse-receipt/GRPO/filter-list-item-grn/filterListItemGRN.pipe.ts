import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterListItemGRN',
})
export class FilterListItemGRNPipe implements PipeTransform {
  transform(
    list: readonly any[],
    productCode: string,
    itemName: string,
    description: string,
    note: string,
    supplier: string,
    uom: string
  ) {
    let filteredData: any;
    filteredData = productCode
      ? list.filter((item: any) => this.checkItemCode(item, productCode))
      : list;
    filteredData = itemName
      ? filteredData.filter((item: any) => this.checkItemName(item, itemName))
      : filteredData;

    filteredData = description
      ? filteredData.filter((item: any) =>
          this.checkDescription(item, description)
        )
      : filteredData;
    filteredData = note
      ? filteredData.filter((item: any) => this.checkNote(item, note))
      : filteredData;
    filteredData = supplier
      ? filteredData.filter((item: any) => this.checkSupplier(item, supplier))
      : filteredData;
    filteredData = uom
      ? filteredData.filter((item: any) => this.checkUnit(item, uom))
      : filteredData;
    return filteredData;
  }

  checkItemCode(item: any, productCode: string): boolean {
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

  checkItemType(item: any, itemType: string): boolean {
    if (
      item.itemType != null &&
      item.itemType.toLowerCase().indexOf(itemType.trim().toLowerCase()) > -1
    ) {
      return true;
    }
    return false;
  }

  checkSupplier(item: any, supplier: string): boolean {
    if (
      item.supplier != null &&
      item.supplier.toLowerCase().indexOf(supplier.trim().toLowerCase()) > -1
    ) {
      return true;
    }
    return false;
  }

  checkUnit(item: any, uom: string): boolean {
    if (
      item.uom != null &&
      item.uom.toLowerCase().indexOf(uom.trim().toLowerCase()) > -1
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
