import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class TransferDataService {
  private messageSource = new BehaviorSubject({});
  currentMessage = this.messageSource.asObservable();

  constructor() {}

  changeMessage(message: any) {
    this.messageSource.next(message);
  }

  objectWO: any = {};
  materialObjectWo :any = {}
  setObjectWO(obj: any) {
    this.objectWO = obj;
  }
  getObjectWO() {
    return this.objectWO;
  }
  setObjectWOForMaterial(obj:any){
    this.materialObjectWo = obj;
  }
  getObjectWOForMaterial(){
    return this.materialObjectWo;
  }



  dataSaveObject: any = {};
  setObject(obj: any) {
    this.dataSaveObject = obj;
  }

  getObj() {
    return this.dataSaveObject;
  }

  soBody: any = {};
  setObjSo(obj: any) {
    this.soBody = obj;
  }

  getObjSo() {
    return this.soBody;
  }

  dataFromImportrequest: any = {};
  setObjectFromImportRequest(obj: any) {
    this.dataFromImportrequest = obj;
  }
  getObjectFromImportRequest() {
    return this.dataFromImportrequest;
  }

  dataFromConsignmentContractCode: any = {};
  setObjectFromConsignmentContractCode(obj: any) {
    this.dataFromConsignmentContractCode = obj;
  }
  getObjectFromConsignmentContractCode() {
    return this.dataFromConsignmentContractCode;
  }

  dataFromPO: any = {};
  setObjectFromPO(obj: any) {
    this.dataFromPO = obj;
  }
  getObjectFromPO() {
    return this.dataFromPO;
  }

  informationExportMaterial: any = {};
  // Get thông tin yêu cầu xuất kho sản xuất
  getInformationExportMaterial() {
    return this.informationExportMaterial;
  }
  // Set thông tin yêu cầu xuất kho sản xuất
  setInformationExportMaterial(data: any) {
    this.informationExportMaterial = data;
  }

  inventory: any = {};
  // Set phiếu kiểm kê
  setInventory(data: any) {
    this.inventory = data;
  }
  getInventory() {
    return this.inventory;
  }
}
