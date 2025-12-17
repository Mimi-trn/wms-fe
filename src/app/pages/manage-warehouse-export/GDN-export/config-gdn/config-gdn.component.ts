import {Component, OnInit} from '@angular/core';
import jwt_decode from "jwt-decode";
import {MessageService} from "../../../../services/message.service";
import {KeycloakService} from "keycloak-angular";
import {TranslateService} from "@ngx-translate/core";
import {ActivatedRoute, Router} from "@angular/router";
import {NgxUiLoaderService} from "ngx-ui-loader";
import {ReceiptCommonService} from "../../../../services/import-warehouse/common/receipt-common.service";
import {GrnService} from "../../../../services/import-warehouse/GRN/grn.service";
import {CheckRoleService} from "../../../../services/checkRole.service";
import {PoCommonService} from "../../../../services/manage-information/common/po-common.service";
import {ReasonService} from "../../../../services/reason/reason.service";
import {ContractService} from "../../../../services/manage-information/contract-service/contract.service";
import {ExportRequestService} from "../../../../services/export-warehouse/exportRequestService.service";
import {HttpClient} from "@angular/common/http";
import {NzUploadChangeParam, NzUploadFile} from "ng-zorro-antd/upload";
import {NzResizeEvent} from "ng-zorro-antd/resizable";
import html2canvas from "html2canvas";
import jspdf from "jspdf";
import {environment} from "../../../../../environment/environment";
import {TransferDataService} from "../../../../services/transferData.service";
import {CommonService} from "../../../../services/export-warehouse/commonService.service";
import {GDNService} from "../../../../services/export-warehouse/GDNRequestService.service";

@Component({
  selector: 'app-config-gdn',
  templateUrl: './config-gdn.component.html',
  styleUrls: ['./config-gdn.component.css']
})
export class ConfigGDNComponent implements OnInit{
  token: any = '';
  checkGroupsInTokenQcer: boolean = false;
  checkGroupsInTokenKeeper: boolean = false;
  checkGroupsInTokenSaler: boolean = false;
  checkGroupsInTokenAdmin: boolean = false;
  getDecodedAccessToken(token: string): any {
    try {
      return jwt_decode(token);
    } catch (Error) {
      return null;
    }
  }

  async getToken() {
    this.token = await this.keycloakService.getToken();
  }
  constructor(
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private loading: NgxUiLoaderService,
    private checkRole: CheckRoleService,
    private transferData: TransferDataService,
    private keycloakService: KeycloakService,
    private commonService: CommonService,
    private exportRequestService: ExportRequestService,
    private gdnService: GDNService,
    private http: HttpClient
  ) {
    let encodedToken;
    this.getToken().then(() => {
      encodedToken = this.getDecodedAccessToken(this.token);
      this.checkGroupsInTokenQcer =
        encodedToken.groups.includes('/WMS_GROUP_QCER');
      this.checkGroupsInTokenKeeper =
        encodedToken.groups.includes('/WMS_GROUP_KEEPER');
      this.checkGroupsInTokenAdmin =
        encodedToken.groups.includes('/WMS_GROUP_ADMIN');
      this.checkGroupsInTokenSaler =
        encodedToken.groups.includes('/WMS_GROUP_SALER');
    });
  }
  params: any = '';
  // Breadcrumb
  isBreadcrumb: boolean = false;
  isHidden: boolean = true;
  breadcrumbs: Object[] = [];
  // Thông tin yêu cầu xuất kho
  dataInformation: any = {
    exportType: 1,
  };
  listWarehouse: any[] = [];
  listStatus: any[] = [];
  listExportType: any[] = [
    {
      text: 'Xuất kho sản xuất',
      value: 1,
    },
    {
      text: 'Xuất kho thành phẩm',
      value: 2,
    },
    {
      text: 'Xuất kho khác',
      value: 3,
    },
  ];
  // Mã yêu cầu xuất kho
  showExportRequestCode: boolean = false;
  listExportRequestCode: any[] = [];
  dataFilterExportRequestCode: any = {
    startAt: [],
    endAt: [],
    orderDate: [],
    deliveryAt: [],
    createdAt: [],
    updatedAt: [],
  };
  // Danh sách hàng hóa
  columns: any[] = [];
  dataItems: any[] = [];
  countTotalActualQuantity: number = 0;
  countTotalQuantityRequest: number = 0;
  dataFilterProduct: any = {};
  visiblePopup: boolean = false;
  listItem: any[] = [];
  checked = false;
  indeterminate = false;
  listOfCurrentPageData: readonly any[] = [];
  setOfCheckedId = new Set<any>();
  dataDraft: any[] = [];
  filterChildItems: any = {};
  pageItem: any = 1;
  perPageItem: any = 10;
  totalItem: any = 0;
  showApproveBy: boolean = false;
  // Danh sách yêu cầu
  totalExportRequest: number = 0;
  pageExportRequest: number = 1;
  perPageExportRequest: number = 10;

  // Nhân viên
  showEmployee: boolean = false;
  dataApprovedBy: any = {};
  listTeamGroup: any[] = [];
  listEmployee: any[] = [];
  ngOnInit() {
    // this.getExportRequest();
    this.params = this.activatedRoute.snapshot.params['id'];
    this.readGDN(this.params).then(() => {
      // if (this.dataInformation.status == 0) { //Sửa nghiệp vụ 20/09, backend bỏ chức năng này r
      //   this.getMessageRevoke(this.params);
      // }
      if (this.dataInformation.status == 3) {
        this.getMessaRefuse(this.params);
      }
    });
    this.getWarehouse();
    this.setBreadcrumb();
    this.getTeamGroup();
    this.getEmployee();
    this.getDataPrintPDF();
    this.columns = [
      {
        keyTitle: 'Mã hàng hóa',
        keyName: 'productCode',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'Tên hàng hóa',
        keyName: 'itemName',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'Mô tả hàng hóa',
        keyName: 'description',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'Đơn vị tính',
        keyName: 'uom',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'Số lượng yêu cầu',
        keyName: 'requestQuantity',
        width: '200px',
        check: true,
      },
      {
        keyTitle: 'Số lượng thực xuất',
        keyName: 'actualQuantity',
        width: '200px',
        check: true,
      },
    ];

    this.listStatus = [
      {
        text: 'Bản nháp',
        value: 0,
      },
      {
        text: ' Xuất kho chờ ký xác nhận',
        value: 1,
      },
      {
        text: 'Xuất kho đã ký xác nhận',
        value: 2,
      },
    ];
  }
  dataPrintPDF: any[] = [];
  inforGDN: any;
  getDataPrintPDF(){
    this.exportRequestService.getDataPrintPDF(this.params).subscribe({
      next: (res) => {
        this.inforGDN = res.data.gdnDTO;
        if(this.inforGDN.warehouseCode == 'K0001') {
          this.inforGDN.warehouseName = 'Kho sản xuất'
        } else if(this.inforGDN.warehouseCode == 'K0002') {
          this.inforGDN.warehouseName = 'Kho nhà máy'
        }
        if(res.data.itemList.length > 0) {
          for(let i = 0; i < res.data.itemList.length; i++) {
            this.dataPrintPDF.push(res.data.itemList[i]);
          }
        }
        console.log(this.dataPrintPDF)
      }, error: (err) => {
        console.log(err);
      }
    });
  }

  print() {
    console.log('check')
    var data = document.getElementById('print');
    html2canvas(data!).then(canvas => {
      // Few necessary setting options
      var imgWidth = 208;
      var pageHeight = 295;
      var imgHeight = canvas.height * imgWidth / canvas.width;
      var heightLeft = imgHeight;

      const contentDataURL = canvas.toDataURL('image/png')
      let pdf = new jspdf('p', 'mm', 'a4'); // A4 size page of PDF
      var position = 0;
      pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight)
      console.log("du me")
      pdf.save('new-file.pdf'); // Generated PDF
    });
  }

  setBreadcrumb() {
    this.breadcrumbs = [
      {
        name: 'sidebar.export.name',
        route: ``,
      },
      {
        name: 'sidebar.export.child.goodDeliveryNote.child.list',
        route: `/export/list-GDN`,
      },
      {
        name: 'sidebar.export.child.goodDeliveryNote.child.read',
        route: `/export/list-GDN/${this.params}`,
      },
    ];
    this.isBreadcrumb = true;
  }

  async getWarehouse() {
    let resp = await this.commonService.getWarehouse();
    resp.data.forEach((element: any) => {
      let data = {
        text: element.warehouseName,
        value: element.warehouseCode,
      };
      this.listWarehouse.push(data);
    });
  }

  async readGDN(gdnCode: any) {
    let res = await this.gdnService.readGDN(gdnCode);
    if (res.result.responseCode == '00') {
      this.dataInformation = {
        ...res.data.gdnDTO,
        exportRequestCode: res.data.gdnDTO.exportRequestCode,
        woCode: res.data.gdnDTO.woCode,
        productCode: res.data.gdnDTO.productCode,
        productName: res.data.gdnDTO.productName,
        quantity: res.data.gdnDTO.quantity,
        totalLotNumber: res.data.gdnDTO.totalLotNumber,
        exportType: res.data.gdnDTO.exportType,
        warehouseCode: res.data.gdnDTO.warehouseCode,
        status: res.data.gdnDTO.status,
        shipperCode: res.data.gdnDTO.shipperCode,
        shipper: res.data.gdnDTO.shipperName,
        lotId: res.data.gdnDTO.lotId,
        lotNumber: res.data.gdnDTO.lotNumber,
        receiverName: res.data.gdnDTO.receiverName,
        customerCode: res.data.gdnDTO.customerCode,
        customerName: res.data.gdnDTO.customerName,
        customerAddress: res.data.gdnDTO.customerAddress,
        customerPhone: res.data.gdnDTO.customerPhone,
        startAt: res.data.gdnDTO.startAt
          ? new Date(res.data.gdnDTO.startAt)
          : new Date(''),
        endAt: res.data.gdnDTO.endAt
          ? new Date(res.data.gdnDTO.endAt)
          : new Date(''),
        deliveryAt: res.data.gdnDTO.deliveryAt
          ? new Date(res.data.gdnDTO.deliveryAt)
          : '',
        createdBy: res.data.gdnDTO.createdBy,
        createdAt: new Date(res.data.gdnDTO.createdAt),
        updatedAt: new Date(res.data.gdnDTO.updatedAt),
        note: res.data.gdnDTO.note,
      };


      this.dataItems = res.data.itemList;
    }
    this.calculateTotalActualQuantity();
    this.calculateTotalQuantityRequest();
  }

  messageRevoke: any = '';
  async getMessageRevoke(gdnCode: any) {
    let resp = await this.commonService.readRevokeGDN(gdnCode);
    if (resp.data) {
      this.messageRevoke = resp.data.content;
    }
  }

  messageRefuse: any = '';
  async getMessaRefuse(gdnCode: any) {
    let resp = await this.commonService.readRefuseGDN(gdnCode);
    if (resp.data) {
      this.messageRefuse = resp.data.content;
    }
  }

  async getEmployee() {
    let res = await this.commonService.getListApprovedBy();
    this.listEmployee = res.data;
  }

  async getTeamGroup() {
    let res = await this.commonService.getTeamGroup();
    if (res.result.responseCode == '00') {
      res.data.forEach((element: any) => {
        this.listTeamGroup.push({
          text: element.teamGroupName,
          value: element.teamGroupId,
        });
      });
    } else {
      this.messageService.warning(`${res.result.message}`, `Warning`);
    }
  }

  calculateTotalActualQuantity() {
    this.countTotalActualQuantity = this.dataItems.reduce(
      (sum, item) => sum + parseFloat(item.exportQuantity),
      0
    );
  }

  calculateTotalQuantityRequest() {
    this.countTotalQuantityRequest = this.dataItems.reduce(
      (sum, item) => sum + parseFloat(item.requestQuantity),
      0
    );
  }

  close() {
    this.router.navigate([
      `/export/list-GDN/${this.params}`,
    ]);
  }
  protected readonly Date = Date;
}
