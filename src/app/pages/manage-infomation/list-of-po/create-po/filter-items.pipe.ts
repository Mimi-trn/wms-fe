import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterItems',
})
export class FilterItemsPipe implements PipeTransform {
  transform(
    list: readonly any[],
    vendorCode: string,
    vendorName: string,
    otherName: string,
    email: string,
    address: string
  ) {
    let filteredData: any;
    filteredData = vendorCode
      ? list.filter((item: any) => this.checkVendorCode(item, vendorCode))
      : list;
    filteredData = vendorName
      ? filteredData.filter((item: any) =>
          this.checkVendorName(item, vendorName)
        )
      : filteredData;
    filteredData = otherName
      ? filteredData.filter((item: any) => this.checkOtherName(item, otherName))
      : filteredData;
    filteredData = email
      ? filteredData.filter((item: any) => this.checkEmail(item, email))
      : filteredData;
    filteredData = address
      ? filteredData.filter((item: any) => this.checkAddress(item, address))
      : filteredData;
    return filteredData;
  }

  checkVendorCode(item: any, vendorCode: string): boolean {
    if (
      item.vendorCode != null &&
      item.vendorCode.toLowerCase().indexOf(vendorCode.trim().toLowerCase()) >
        -1
    ) {
      return true;
    }
    return false;
  }
  checkVendorName(item: any, vendorName: string): boolean {
    if (
      item.vendorName != null &&
      item.vendorName.toLowerCase().indexOf(vendorName.trim().toLowerCase()) >
        -1
    ) {
      return true;
    }
    return false;
  }
  checkOtherName(item: any, otherName: string): boolean {
    if (
      item.otherName != null &&
      item.otherName.toLowerCase().indexOf(otherName.trim().toLowerCase()) > -1
    ) {
      return true;
    }
    return false;
  }
  checkEmail(item: any, email: string): boolean {
    if (
      item.email != null &&
      item.email.toLowerCase().indexOf(email.trim().toLowerCase()) > -1
    ) {
      return true;
    }
    return false;
  }
  checkAddress(item: any, address: string): boolean {
    if (
      item.address != null &&
      item.address.toLowerCase().indexOf(address.trim().toLowerCase()) > -1
    ) {
      return true;
    }
    return false;
  }
}
