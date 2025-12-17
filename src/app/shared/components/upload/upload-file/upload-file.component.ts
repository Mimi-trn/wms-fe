import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.css'],
})
export class UploadFileComponent {
  @Input() isDisabled: boolean = false;
  @Input() idInput: string = '';
  @Input() isDownload: boolean = true;
  @Input() isUpload: boolean = true;
  @Output() onFileChange: EventEmitter<any> = new EventEmitter<any>();
  constructor(
    private sanitizer: DomSanitizer,
    private messageService: MessageService
  ) {}
  fileList: File[] = [];
  isVisiblePdf: boolean = false;
  isVisible: boolean = false;
  imagesByColumn: any;
  pdfFileUrl: any = '';

  onUploadFile(event: any) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files.item(i);
      if (file.size > maxSize) {
        this.messageService.warning(
          `File ${file.name} vượt quá kích thước cho phép (5MB)`,
          ' Thông báo'
        );
        continue;
      }
      this.fileList.push(file);
    }
    this.onFileChange.emit(this.fileList);
  }

  downloadFile() {}

  deleteFile(index: any) {
    this.fileList.splice(index, 1);
  }

  convertToKb(byte: any) {
    return Math.ceil(Number(byte) / 1024) + 'Kb';
  }

  preview(index: any) {
    if (this.fileList.length === 0) return;
    const file = this.fileList[index];
    if (!file || !file.name) return;
    const fileNameParts = file.name.split('.');
    const fileExtension =
      fileNameParts[fileNameParts.length - 1]?.toLowerCase() || '';
    // Danh sách định dạng ảnh hỗ trợ
    const imageFormats = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagesByColumn = e.target.result;
    };

    if (fileExtension === 'pdf') {
      this.isVisiblePdf = true;
      this.pdfFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        URL.createObjectURL(file)
      );
    } else if (imageFormats.includes(fileExtension)) {
      this.isVisible = true;
      reader.readAsDataURL(file);
    } else {
      this.messageService.warning(
        'Định dạng file không được hỗ trợ xem trước',
        ' Thông báo'
      );
    }
  }

  handleCancel() {
    this.isVisible = false;
    this.isVisiblePdf = false;
  }
}
