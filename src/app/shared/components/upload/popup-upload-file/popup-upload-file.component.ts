import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-popup-upload-file',
  templateUrl: './popup-upload-file.component.html',
  styleUrls: ['./popup-upload-file.component.css'],
})
export class PopupUploadFileComponent {
  constructor(private messageService: MessageService) {}
  @Input() isVisible: boolean = false;
  @Input() formData: any[] = [];
  @Input() header: any[] = [];
  @Input() TemplateName: string = '';
  @Input() entityType: number = 0;
  @Input() isMultiple: boolean = true;
  @Output() isVisibleChange: EventEmitter<boolean> = new EventEmitter();
  @Output() import: EventEmitter<any> = new EventEmitter();
  @Output() downloadChange: EventEmitter<any> = new EventEmitter<any>();
  check: boolean = true;

  ngOnInit() {}

  downloadTemplate() {
    this.downloadChange.emit();
  }
  linkdata: boolean = false;
  file: File[] = [];
  fileList: NzUploadFile[] = [];
  handleChange = (item: any) => {
    if (item.type == 'removed') this.linkdata = false;
    else this.linkdata = true;
    if (this.isMultiple == false) {
      this.fileList = [item.file];
      this.file = [];
    }
    this.file.push(item.file.originFileObj);
    this.check = false;
  };

  isvisibleCancel: boolean = false;

  handleCancel() {
    this.isvisibleCancel = true;
    this.isVisibleChange.emit(false);
  }

  submit() {
    if (this.check) {
      this.messageService.warning('Bạn chưa chọn file cần import', 'Thông báo');
    } else {
      this.isVisibleChange.emit(false);
      this.import.emit(this.file);
    }
  }
}
