import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';


@Component({
  selector: 'app-upload-file-two',
  templateUrl: './upload-file-two.component.html',
  styleUrls: ['./upload-file-two.component.css']
})
export class UploadFileTwoComponent {
  @Input() isDisabled: boolean = false;
  @Input() fileList: File[] = [];
  @Output()
  fileReturn: EventEmitter<any> = new EventEmitter<any>();


  onUploadFile(event: any) {
    for (let i = 0; i < event.target.files.length; i++) {
      this.fileList.push(event.target.files.item(i));
    }
    console.log(this.fileList);

    this.fileReturn.emit(this.fileList);
  }

  downloadFile() {}

  deleteFile(index: any) {
    this.fileList.splice(index, 1);
  }

  convertToKb(byte: any) {
    return Math.ceil(Number(byte) / 1024) + 'Kb';
  }

}
