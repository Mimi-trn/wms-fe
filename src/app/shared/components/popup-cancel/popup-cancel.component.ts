import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
@Component({
  selector: 'app-popup-cancel',
  templateUrl: './popup-cancel.component.html',
  styleUrls: ['./popup-cancel.component.css'],
})
export class PopupCancelComponent implements OnInit {
  @Input() isVisible: boolean = false;
  @Output() isVisibleChange: EventEmitter<boolean> = new EventEmitter();
  @Output() cancel: EventEmitter<boolean> = new EventEmitter();

  ngOnInit() {}

  handleCancel() {
    this.isVisible = false;
    this.cancel.emit(false);
    this.isVisibleChange.emit(true);
  }

  submit() {
    this.isVisible = false;
    this.isVisibleChange.emit(false);
    this.cancel.emit(false);
  }
}
