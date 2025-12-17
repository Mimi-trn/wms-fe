import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'src/app/services/message.service';
import { NotificationService } from 'src/app/services/notify/notification.service';
import { NotifyService } from 'src/app/services/notify/notify.service';
import { WebsocketService } from 'src/app/services/notify/websocket.service';
import { TransferDataService } from 'src/app/services/transferData.service';
const icon = new Map([
  ['info', 'assets/bell-info.png'],
  ['warn', 'assets/bell-warning.png'],
]);
@Component({
  selector: 'app-notify-quick',
  templateUrl: './notify-quick.component.html',
  styleUrls: ['./notify-quick.component.css'],
})
export class NotifyQuickComponent implements OnInit {
  constructor(
    private router: Router,
    private loading: NgxUiLoaderService,
    private notifyService: NotifyService,
    private messageService: MessageService,
    private transferdata: TransferDataService,
    private notificationService: NotificationService,
    private websocketService: WebsocketService

  ) {}
  intervalId: any;
  ngOnInit() {
     this.getNotify();
    // this.connect();

    // this.intervalId = setInterval(() => {
    //   this.getNotify();
    // }, 300000); // Lặp lại sau mỗi .. giây

    // setTimeout(() => {
    //   clearInterval(this.intervalId);
    // }, 86400000); // Dừng sau .. giây
  }

  connect(): void {
    console.log('connect WSS');

    this.websocketService.connect();
    console.log('connected');
    // subscribe receives the value.
    this.notificationService.notificationMessage.subscribe((data) => {
      console.log('receive message:', data.id + ' - ' + data.content);
      // this.notificationService
      //   .updateMessageReceivedStatus(data.id, 1)
      //   .subscribe(
      //     (res) => {
      //       console.log('update status success');
      //     },
      //     (err) => {
      //       console.log('update status error');
      //     }
      //   );
      this.notify(data);
    });
  }

  disconnect(): void {
    this.websocketService.disconnect();
  }
  counter = 0;

  notify(message: any): void {
    this.count++;
    // const options = {
    //   body: message.content,
    //   icon: icon.get(message.sourceType.toLowerCase()),
    // };
    // if (
    //   message.optionSend == 'SEND_ALL' ||
    //   message?.userId == this.userName ||
    //   message?.userId == 'ALL_USER'
    // )
    // this.notificationListRaw.unshift(message);
    this.listData.push(message)
    this.childDataChange.emit(this.count);
  }

  notificationListRaw: any = [];
  listData: any[] = [];
  count: any = 0;
  countSend: any;
  async getNotify() {
    let res = await this.notifyService.getNotify();
    if (res.result.responseCode == '00') {
      this.listData = res.data;
      this.count = res.isNotReadDataCount;
      this.countSend = res.dataCount;
      this.childDataChange.emit(res.isNotReadDataCount);
    }
  }

  @Input() childData!: string;
  @Output() childDataChange = new EventEmitter<any>();

  checkMarkAll: boolean = true;

  // On handle click mark all read
  async onHandleMarkAllRead() {
    let data = {
      firstIndex: this.listData[0].id,
      dataCount: this.count,
    };
    let resp = await this.notifyService.isReadAll();
    if (resp.result.responseCode == '00') {
      this.getNotify();
      this.messageService.success(``, `Đánh dấu đã đọc tất cả`);
    }
    this.childDataChange.emit(this.count);
  }

  // On handle click see notify
  async onHandleSeeNotify(item: any) {
    this.transferdata.changeMessage(item);
    this.router.navigate(['./notify']);

    if (!item.isRead) {
      item.isRead = !item.isRead;
      let res = this.notifyService.isRead(item.id).then(() => {
        this.getNotify();
      });
    } else {
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

  openRead: boolean = false;
  openReadAll() {
    this.openRead = !this.openRead;
  }
}
