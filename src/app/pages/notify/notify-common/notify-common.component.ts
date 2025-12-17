import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'src/app/services/message.service';
import { NotifyService } from 'src/app/services/notify/notify.service';
import { TransferDataService } from 'src/app/services/transferData.service';

@Component({
  selector: 'app-notify-common',
  templateUrl: './notify-common.component.html',
  styleUrls: ['./notify-common.component.css'],
})
export class NotifyCommonComponent implements OnInit {
  constructor(
    private router: Router,
    private loading: NgxUiLoaderService,
    private notifyService: NotifyService,
    private messageService: MessageService,
    private dataTransfer: TransferDataService
  ) {}
  intervalId: any;
  ngOnInit() {
    this.getNotify().then(() => {
      this.dataTransfer.currentMessage.subscribe((data: any) => {
        this.dataNotify = data;
        this.listData.forEach((item: any) => {
          if (item.id === data.id) {
            item.highlighted = true;
          } else {
            item.highlighted = false;
          }
        });
      });
    });
    this.intervalId = setInterval(() => {
      this.getNotify();
    }, 300000);
    setTimeout(() => {
      clearInterval(this.intervalId);
    }, 86400000);
  }
  listData: any = [];
  count: any;
  countIsNotRead: any;
  tempArray: any = [];
  async getNotify() {
    let res = await this.notifyService.getNotify();
    if (res.result.responseCode == '00') {
      this.listData = [...res.data];
      this.countIsNotRead = res.isNotReadDataCount;
      this.count = res.dataCount;
    }
  }
  @Input() childData!: string;
  @Output() childDataChange = new EventEmitter<any>();
  checkMarkAll: boolean = true;
  dataNotify: any = {
    heading: '',
    message: '',
  };
  // On handle click mark all read
  async onHandleMarkAllRead() {
    let data = {
      firstIndex: this.listData[0].id,
      dataCount: this.count,
    };
    let resp = await this.notifyService.isReadAll();
    if (resp.result.responseCode == '00') {
      this.listData = [...resp.data];
      this.count = resp.dataCount;
      this.countIsNotRead = resp.isNotReadDataCount;
      this.messageService.success(``, `Đánh dấu đã đọc tất cả`);
    }
  }
  // On handle click see notify
  async onHandleSeeNotify(itemClick: any) {
    this.listData.forEach((item: any) => {
      if (item.id === itemClick.id) {
        itemClick.highlighted = true;
      } else {
        item.highlighted = false;
      }
    });
    if (!itemClick.isRead) {
      this.dataNotify.heading = itemClick.heading;
      this.dataNotify.message = itemClick.message;
      itemClick.isRead = !itemClick.isRead;
      let res = await this.notifyService.isRead(itemClick.id).then(() => {
        this.getNotify();
      });
    } else {
      this.dataNotify.heading = itemClick.heading;
      this.dataNotify.message = itemClick.message;
    }
  }
  // Route to common notify
  onHandleClickSeeMore() {
    this.loading.start();
    this.router.navigate(['./notify']);
    this.loading.stop();
  }
  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId); // Đảm bảo dừng interval khi component bị hủy
    }
  }
}
