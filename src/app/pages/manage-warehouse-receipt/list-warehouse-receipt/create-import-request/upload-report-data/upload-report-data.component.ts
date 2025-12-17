import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-upload-report-data',
  templateUrl: './upload-report-data.component.html',
  styleUrls: ['./upload-report-data.component.css'],
})
export class UploadReportDataComponent implements OnInit {
  @Output() fileReturn: EventEmitter<any> = new EventEmitter();
  constructor() {}

  ngOnInit() {}

  onFileChangeShowUpload(event: any) {
    this.fileReturn.emit(event);
  }
}
