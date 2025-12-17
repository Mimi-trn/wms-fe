import { Component, OnInit } from '@angular/core';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { MessageService } from 'src/app/services/message.service';
import { WarningService } from 'src/app/services/warning/warning.service';

@Component({
  selector: 'app-list-of-warning',
  templateUrl: './list-of-warning.component.html',
  styleUrls: ['./list-of-warning.component.css'],
})
export class ListOfWarningComponent implements OnInit {
  constructor(
    private warningService: WarningService,
    private message: MessageService
  ) { }
  isSpinning: boolean = true;

  ngOnInit(): void {
    this.onHandleFetchData();
  }

  pagination(event: any) {
    this.page = event.page;
    this.perPage = event.size;
    this.onHandleFetchData();
  }

  onHandleEnterSearch($event: any) {
    if ($event.keyCode == 13) {
      this.onHandleFetchData();
    }
  }

  onHandleClickSearch() {
    this.onHandleFetchData();
  }

  async onHandleFetchData() {
    this.isSpinning = true;
    let dataRequest = {
      pageIndex: this.page - 1,
      pageSize: this.perPage,
      filter: {
        warningCode: this.filterWarning.warningCode,
        content: this.filterWarning.content,
        warningType: this.filterWarning.warningType, // 1 canh bao nvl het han ,  2 canh bao ton kho
        isRead: this.filterWarning.isRead,
        createdAt: this.filterWarning.createdAt
          ? this.filterWarning.createdAt[0]
          : '',
        createdAt2: this.filterWarning.createdAt
          ? this.filterWarning.createdAt[1]
          : '',
      },
      common: this.searchGeneral,
      sortProperty: 'status',
      sortOrder: 'ASC',
    };

    let res = await this.warningService.getListWarning(dataRequest);
    if (res) {
      if (res.result.responseCode == '00') {
        this.isSpinning = false;
        this.listWarning = res.data;
        this.total = res.dataCount;
      } else {
        this.message.warning(` Có lỗi xảy ra vui lòng thử lại`, ` Thông báo`);
      }
    } else {
      this.message.warning(` Có lỗi xảy ra vui lòng thử lại`, ` Thông báo`);
    }
  }

  onHandleSearchCommon() {
    this.onHandleFetchData();
  }

  onHandleClickCheckBox() {
    if (this.columns.every((item) => !item.check)) {
      this.allChecked = false;
      this.indeterminate = false;
    } else if (this.columns.every((item) => item.check)) {
      this.allChecked = true;
      this.indeterminate = false;
    } else {
      this.indeterminate = true;
    }
  }

  onHandleUpdateAllChecked(): void {
    this.indeterminate = false;
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

  allChecked: boolean = false;
  indeterminate: boolean = true;

  id = -1;
  onResize({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.columns[i].width = width + 'px';
    });
  }

  customSortFunction(sortColumn: any) {
    sortColumn.count = sortColumn.count + 1;
    // this.countSort = this.countSort + 1;
    if (sortColumn.count % 2 == 1) {
      sortColumn.sortOrder = 'DESC';
    } else {
      sortColumn.sortOrder = 'ASC';
    }
    this.sortOrder = sortColumn.sortOrder;
    this.sortProperty = sortColumn.keyName;
    this.onHandleFetchData();
  }

  onHandleClearInput(keyName: string) {
    this.filterWarning[keyName] = '';
    this.onHandleFetchData();
  }

  async sendMessage(row: any) {
    await this.warningService.read(row.id);
    this.onHandleFetchData();
  }

  breadcrumbs = [
    {
      name: 'sidebar.warning.name',
      route: ``,
    },
    {
      name: 'sidebar.warning.child.listOfWarning',
      route: ``,
    },
  ];

  listWarning: any[] = [];
  searchGeneral: string = '';
  sortProperty: string = 'status';
  sortOrder: string = 'DESC';
  filterWarning: any = {
    createdAt: [],
  };
  page: number = 1;
  perPage: number = 10;
  total: number = 0;

  listStatus = [
    {
      text: 'Chưa đọc',
      value: false,
    },
    {
      text: 'Đã đọc',
      value: true,
    },
  ];

  listWarningType: any[] = [
    {
      text: 'Cảnh báo NVL hết hạn',
      value: 1,
    },
    {
      text: 'Cảnh báo tồn kho NVL',
      value: 2,
    },
  ];
  columns: any[] = [
    {
      keyTitle: 'Nội dung cảnh báo',
      keyName: 'content',
      width: '',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'Mã cảnh báo',
      keyName: 'warningCode',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'Loại cảnh báo',
      keyName: 'warningType',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'Ngày phát cảnh báo',
      keyName: 'createdAt',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
    {
      keyTitle: 'Trạng thái',
      keyName: 'isRead',
      width: '200px',
      check: true,
      count: 0,
      sortOrder: '',
    },
  ];
}
