import { Component, OnInit } from '@angular/core';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonService } from 'src/app/services/export-warehouse/commonService.service';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-email-send',
  templateUrl: './email-send.component.html',
  styleUrls: ['./email-send.component.css'],
})
export class EmailSendComponent implements OnInit {
  constructor(
    private loading: NgxUiLoaderService,
    private messageService: MessageService,
    private commonService: CommonService
  ) {}
  page: number = 1;
  per_page: number = 10;
  total: number = 0;
  dataFilter: any = {};
  datas: any[] = [];
  sortProperty: any = '';
  sortOrder: any = '';

  ngOnInit() {
    this.getList();
  }

  async getList() {
    this.loading.start();
    let data = {
      pageIndex: this.page - 1, //number of page
      pageSize: this.per_page, //number of display elements per page
      filter: this.dataFilter,
      common: this.searchGeneral,
      sortProperty: this.sortProperty, //property want to sort
      sortOrder: this.sortOrder, //sort by ascending or descending
    };
    let resp = await this.commonService.getListEmailConfig(data);
    if (resp.result.responseCode == '00') {
      this.loading.stop();
      this.datas = resp.data;
      this.total = resp.dataCount;
    } else {
      this.loading.stop();
    }
  }

  listStatus: any[] = [
    {
      label: 'Tắt thông báo',
      value: 1,
    },
    {
      label: 'Bật thông báo',
      value: 2,
    },
  ];

  listEmailType: any[] = [
    {
      label: 'Thêm mới PO',
      value: 1,
    },
    {
      label: 'Thêm mới yêu cầu IQC',
      value: 2,
    },
    {
      label: 'Thêm mới yêu cầu nhập kho',
      value: 3,
    },
    {
      label: 'Thêm mới phiếu nhập kho',
      value: 4,
    },
  ];

  breadcrumbs = [
    {
      name: 'Cấu hình thông báo',
      route: ``,
    },
    {
      name: 'Cấu hình email nhận thông báo',
      route: ``,
    },
  ];

  searchGeneral: any = '';
  searchGeneralFunc() {}

  columns = [
    {
      keyTitle: 'Tiêu đề email',
      keyName: 'emailHeader',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'Loại thông báo',
      keyName: 'emailType',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'Nhóm người nhận',
      keyName: 'receiverGroupList',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'Email người nhận',
      keyName: 'receiverList',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'Nhóm người được CC',
      keyName: 'ccGroupList',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'Email CC',
      keyName: 'ccList',
      width: '200px',
      check: true,
    },
    {
      keyTitle: 'Trạng thái',
      keyName: 'status',
      width: '200px',
      check: true,
    },
  ];

  allChecked: boolean = true;
  indeterminated: boolean = false;

  onClickCheckBox(column: any) {
    if (this.columns.every((item) => !item.check)) {
      this.allChecked = false;
      this.indeterminated = false;
    } else if (this.columns.every((item) => item.check)) {
      this.allChecked = true;
      this.indeterminated = false;
    } else {
      this.indeterminated = true;
    }
  }

  updateAllChecked(): void {
    this.indeterminated = false;
    if (this.allChecked) {
      this.columns = this.columns.map((item) => ({
        ...item,
        check: true,
      }));
    } else {
      this.columns = this.columns.map((item) => ({
        ...item,
        check: false,
      }));
    }
  }

  pagination(event: any) {
    this.page = event.page;
    this.per_page = event.size;
    this.getList();
  }

  id = -1;
  onResize({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.columns[i].width = width + 'px';
    });
  }

  countSort = 0;
  customSortFunction(sortColumn: string) {
    this.countSort = this.countSort + 1;
    if (this.countSort % 2 == 1) {
      this.sortOrder = 'descend';
    } else {
      this.sortOrder = 'ascend';
    }
    this.sortProperty = sortColumn;
    this.getList();
  }
  search() {
    this.getList();
  }
  clear(row: any) {
    this.dataFilter[row.keyName] = '';
    this.getList();
  }
  enterSearch($event: any) {
    if ($event.keyCode == 13) {
      this.getList();
    }
  }

  visible: boolean = false;
  onHandleView(row: any) {
    this.visible = true;
    this.currentData = row;
  }
  currentData: any = {};
  onHandleCancel() {
    this.visible = false
  }
}
