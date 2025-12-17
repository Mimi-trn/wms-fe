import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  transform(
    list: readonly any[],
    productCode: string,
    itemName: string,
    description: string,
    note: string,
    supplier: string,
    unit: string,
    po_quantity: number,
    actual_quantity: number
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
    filteredData = supplier
      ? filteredData.filter((item: any) => this.checkSupplier(item, supplier))
      : filteredData;
    filteredData = unit
      ? filteredData.filter((item: any) => this.checkUnit(item, unit))
      : filteredData;
    filteredData = po_quantity
      ? filteredData.filter((item: any) =>
          this.checkPOQuantity(item, po_quantity)
        )
      : filteredData;
    filteredData = actual_quantity
      ? filteredData.filter((item: any) =>
          this.checkActualQuantity(item, actual_quantity)
        )
      : filteredData;
    filteredData = note
      ? filteredData.filter((item: any) => this.checkNote(item, note))
      : filteredData;
    return filteredData;
  }

  checkItemCode(item: any, productCode: string): boolean {
    if (
      item.productCode != null &&
      item.productCode.toLowerCase().indexOf(productCode.trim().toLowerCase()) > -1
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

  checkSupplier(item: any, supplier: string): boolean {
    if (
      item.supplier != null &&
      item.supplier.toLowerCase().indexOf(supplier.trim().toLowerCase()) > -1
    ) {
      return true;
    }
    return false;
  }

  checkUnit(item: any, unit: string): boolean {
    if (
      item.unit != null &&
      item.unit.toLowerCase().indexOf(unit.trim().toLowerCase()) > -1
    ) {
      return true;
    }
    return false;
  }

  checkPOQuantity(item: any, poQuantity: number): boolean {
    if (
      item.poQuantity != null &&
      item.poQuantity.toString().toLowerCase().indexOf(poQuantity) > -1
    ) {
      return true;
    }
    return false;
  }

  checkActualQuantity(item: any, actualQuantity: number): boolean {
    if (
      item.actualQuantity != null &&
      item.actualQuantity.toString().toLowerCase().indexOf(actualQuantity) >
        -1
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
