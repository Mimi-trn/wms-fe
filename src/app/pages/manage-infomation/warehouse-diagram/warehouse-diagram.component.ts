import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CheckRoleService } from 'src/app/services/checkRole.service';
import { ReceiptCommonService } from 'src/app/services/import-warehouse/common/receipt-common.service';
import { MessageService } from 'src/app/services/message.service';
import { WarehouseDiagramService } from 'src/app/services/warehouse-diagram/warehouse-diagram.service';

@Component({
  selector: 'app-warehouse-diagram',
  templateUrl: './warehouse-diagram.component.html',
  styleUrls: ['./warehouse-diagram.component.css'],
})
export class WarehouseDiagramComponent implements OnInit {
  checkIsRole(role: string) {
    return this.checkRole.checkRole(role);
  }
  constructor(
    private messageService: MessageService,
    private translateService: TranslateService,
    private loading: NgxUiLoaderService,
    private warehouseDiagramService: WarehouseDiagramService,
    private checkRole: CheckRoleService
  ) {}
  // Danh sách breadcrumb
  breadcrumbs: Object = [
    {
      name: 'menu.manage.information',
      route: ``,
    },
    {
      name: 'sidebar.information.child.warehouseDiagram',
      route: `/manage-info/warehouse-diagram`,
    },
  ];
  //Param
  searchCommon: string = '';
  pageIndex: number = 1;
  pageSize: number = 10;
  total: number = 0;

  // Danh sách kho
  listOfLocation: any = [];
  isVisibleCreateLocation: boolean = false;

  ngOnInit() {
    this.getDataListWarehouse('');
  }

  getDataListWarehouse(common: string) {
    this.loading.start();
    // this.translateService
    //   .get("sidebar.information.child.warehouseDiagram")
    //   .subscribe((text) => {
    //     this.title.setTitle(text);
    //   });

    let request = {
      pageIndex: this.pageIndex - 1,
      pageSize: this.pageSize,
      common: common,
    };
    // Lấy danh sách kho
    this.warehouseDiagramService
      .getListLocation(request)
      .then((response) => {
        if (response.result.message == 'success') {
          this.listOfLocation = response.data.content.map((data: any) => ({
            ...data,
            isOpen: false,
            child: [],
          }));

          this.total = response.data.totalElements;

          console.log('listOfLocation', this.listOfLocation);
        } else {
          this.messageService.error('Lấy dữ liệu vị trí', 'Lỗi');
        }
      })
      .finally(() => {
        this.loading.stop();
      });
  }

  searchWarehouse(event: any) {
    this.searchCommon = this.searchCommon.trim();
    console.log('searchCommon', this.searchCommon);
    console.log('event', event);
    if (this.searchCommon.length > 0 && event.keyCode == 13) {
      this.getDataListWarehouse(this.searchCommon);
    }
  }

  openListLocationInWarehouse(warehouse: any) {
    let data = {
      pageIndex: 0,
      pageSize: 0,
      common: '',
      sortProperty: 'createdAt',
      sortOrder: 'ASC',
      filter: {
        warehouseId: warehouse.id,
        parent: 0,
      },
    };

    if (!warehouse.isOpen) {
      this.loading.start();
      this.warehouseDiagramService
        .getListLocation(data)
        .then((response) => {
          if (response.result.responseCode == '00') {
            warehouse.child = response.data.map((data: any) => {
              return { ...data, isOpen: false, child: [] };
            });
            warehouse.isOpen = true;
          } else {
            this.messageService.error('Không lấy được dữ liệu vị trí', 'Lỗi');
          }
        })
        .finally(() => {
          this.loading.stop();
        });
    } else {
      warehouse.isOpen = false;
    }
  }

  // Hàm xử lý sự kiện phân trang
  pagination(event: any) {
    console.log('event', event);
    this.pageIndex = event.page;
    this.pageSize = event.size;

    this.getDataListWarehouse('');
  }

  onCreateSuccessfully(event: any) {
    if (event) {
      this.getDataListWarehouse('');
    }
  }
}
