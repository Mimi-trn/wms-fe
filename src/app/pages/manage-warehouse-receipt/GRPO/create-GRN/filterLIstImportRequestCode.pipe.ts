import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterLIstImportRequestCode',
})
export class FilterLIstImportRequestCodePipe implements PipeTransform {
  transform(
    list: readonly any[],
    code: string,
    importType: string,
    warehouseCode: string,
    poCode: string,
    consignmentContractCode: string,
    shipper: string,
    createdBy: string
  ): any {
    let filteredData: any;
    filteredData = code
      ? list.filter((item: any) => this.checkCode(item, code))
      : list;
    filteredData = importType
      ? filteredData.filter((item: any) =>
          this.checkImportType(item, importType)
        )
      : filteredData;
    filteredData = warehouseCode
      ? filteredData.filter((item: any) =>
          this.checkWarehouse(item, warehouseCode)
        )
      : filteredData;
    filteredData = poCode
      ? filteredData.filter((item: any) => this.checkPO(item, poCode))
      : filteredData;
    filteredData = consignmentContractCode
      ? filteredData.filter((item: any) =>
          this.checkContractCode(item, consignmentContractCode)
        )
      : filteredData;
    filteredData = shipper
      ? filteredData.filter((item: any) => this.checkShipper(item, shipper))
      : filteredData;
    filteredData = createdBy
      ? filteredData.filter((item: any) => this.checkCreatedBy(item, createdBy))
      : filteredData;
    return filteredData;
  }

  checkCode(item: any, code: any) {
    if (
      item.code != null &&
      item.code.toLowerCase().indexOf(code.trim().toLowerCase()) > -1
    ) {
      return true;
    }
    return false;
  }

  checkImportType(item: any, importType: any) {
    if (
      item.importType != null &&
      item.importType
        .toString()
        .toLowerCase()
        .indexOf(importType.toString().trim().toLowerCase()) > -1
    ) {
      return true;
    }
    return false;
  }

  checkWarehouse(item: any, warehouseCode: any) {
    if (
      item.warehouseCode != null &&
      item.warehouseCode
        .toLowerCase()
        .indexOf(warehouseCode.trim().toLowerCase()) > -1
    ) {
      return true;
    }
    return false;
  }

  checkPO(item: any, poCode: any) {
    if (
      item.poCode != null &&
      item.poCode.toLowerCase().indexOf(poCode.trim().toLowerCase()) > -1
    ) {
      return true;
    }
    return false;
  }

  checkContractCode(item: any, consignmentContractCode: any) {
    if (
      item.consignmentContractCode != null &&
      item.consignmentContractCode
        .toLowerCase()
        .indexOf(consignmentContractCode.trim().toLowerCase()) > -1
    ) {
      return true;
    }
    return false;
  }

  checkShipper(item: any, shipper: any) {
    if (
      item.shipper != null &&
      item.shipper.toLowerCase().indexOf(shipper.trim().toLowerCase()) > -1
    ) {
      return true;
    }
    return false;
  }

  checkCreatedBy(item: any, createdBy: any) {
    if (
      item.createdBy != null &&
      item.createdBy.toLowerCase().indexOf(createdBy.trim().toLowerCase()) > -1
    ) {
      return true;
    }
    return false;
  }
}
