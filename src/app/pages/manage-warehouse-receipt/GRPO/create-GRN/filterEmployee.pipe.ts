import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterEmployee',
})
export class FilterEmployeePipe implements PipeTransform {
  transform(
    list: readonly any[],
    employeeCode: string,
    employeeName: string,
    teamGroupId: string,
    employeePhone: string,
    employeeEmail: string
  ): any {
    let filteredData: any;
    filteredData = employeeCode
      ? list.filter((item: any) => this.checkemployeeCode(item, employeeCode))
      : list;
    filteredData = employeeName
      ? filteredData.filter((item: any) =>
          this.checkemployeeName(item, employeeName)
        )
      : filteredData;
    filteredData = teamGroupId
      ? filteredData.filter((item: any) =>
          this.checkteamGroupId(item, teamGroupId)
        )
      : filteredData;
    filteredData = employeePhone
      ? filteredData.filter((item: any) => this.checkPhone(item, employeePhone))
      : filteredData;
    filteredData = employeeEmail
      ? filteredData.filter((item: any) => this.checkEmail(item, employeeEmail))
      : filteredData;
    return filteredData;
  }

  checkemployeeCode(item: any, employeeCode: any) {
    if (
      item.employeeCode != null &&
      item.employeeCode
        .toLowerCase()
        .indexOf(employeeCode.trim().toLowerCase()) > -1
    ) {
      return true;
    }
    return false;
  }

  checkemployeeName(item: any, employeeName: any) {
    if (
      item.employeeName != null &&
      item.employeeName
        .toString()
        .toLowerCase()
        .indexOf(employeeName.toString().trim().toLowerCase()) > -1
    ) {
      return true;
    }
    return false;
  }

  checkPhone(item: any, employeePhone: any) {
    if (
      item.employeePhone != null &&
      item.employeePhone
        .toString()
        .toLowerCase()
        .indexOf(employeePhone.toString().trim().toLowerCase()) > -1
    ) {
      return true;
    }
    return false;
  }

  checkEmail(item: any, employeeEmail: any) {
    if (
      item.employeeEmail != null &&
      item.employeeEmail
        .toString()
        .toLowerCase()
        .indexOf(employeeEmail.toString().trim().toLowerCase()) > -1
    ) {
      return true;
    }
    return false;
  }
  checkteamGroupId(item: any, teamGroupId: any) {
    if (
      item.teamGroupId != null &&
      item.teamGroupId
        .toString()
        .toLowerCase()
        .indexOf(teamGroupId.toString().trim().toLowerCase()) > -1
    ) {
      return true;
    }
    return false;
  }
}
