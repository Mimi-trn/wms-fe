import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterPO',
})
export class FilterPOPipe implements PipeTransform {
  transform(
    list: readonly any[],
    productCode: string,
    itemName: string,
    description: string,
    supplier: string,
    supplierUom: string,
    uom: string,
    exchangeRate: number,
    discount: number
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
    filteredData = supplierUom
      ? filteredData.filter((item: any) =>
          this.checkSupplierUom(item, supplierUom)
        )
      : filteredData;
    filteredData = uom
      ? filteredData.filter((item: any) => this.checkUom(item, uom))
      : filteredData;
    filteredData = exchangeRate
      ? filteredData.filter((item: any) =>
          this.checkExchangeRate(item, exchangeRate)
        )
      : filteredData;
    filteredData = discount
      ? filteredData.filter((item: any) => this.checkDiscount(item, discount))
      : filteredData;
    return filteredData;
  }

  checkExchangeRate(item: any, exchangeRate: number): boolean {
    if (
      item.exchangeRate != null &&
      item.exchangeRate.toString().toLowerCase().indexOf(exchangeRate) > -1
    ) {
      return true;
    }
    return false;
  }

  checkDiscount(item: any, discount: number): boolean {
    if (
      item.discount != null &&
      item.discount.toString().toLowerCase().indexOf(discount) > -1
    ) {
      return true;
    }
    return false;
  }

  checkSupplier(item: any, supplier: any): boolean {
    if (
      item.supplier != null &&
      item.supplier.toLowerCase().indexOf(supplier.trim().toLowerCase()) > -1
    ) {
      return true;
    }
    return false;
  }

  checkSupplierUom(item: any, supplierUom: any): boolean {
    if (
      item.supplierUom != null &&
      item.supplierUom
        .toString()
        .toLowerCase()
        .indexOf(supplierUom.toString().trim().toLowerCase()) > -1
    ) {
      return true;
    }
    return false;
  }

  checkUom(item: any, uom: any): boolean {
    if (
      item.uom != null &&
      item.uom.toLowerCase().indexOf(uom.trim().toLowerCase()) > -1
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

  checkItemName(item: any, itemName: string): boolean {
    if (
      item.itemName != null &&
      item.itemName.toLowerCase().indexOf(itemName.trim().toLowerCase()) > -1
    ) {
      return true;
    }
    return false;
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
}
