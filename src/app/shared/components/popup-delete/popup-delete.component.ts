import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-popup-delete',
  templateUrl: './popup-delete.component.html',
  styleUrls: ['./popup-delete.component.css'],
})
export class PopupDeleteComponent implements OnInit {
  constructor() {}

  @Input() title: string = 'This is title';
  @Input() nameData: string = 'This is name data';
  @Input() isVisible: boolean = false;
  @Output() hidePopup: EventEmitter<boolean> = new EventEmitter();
  @Output() confirmDelete: EventEmitter<boolean> = new EventEmitter();

  ngOnInit() {}

  handleCancel() {
    this.hidePopup.emit(false);
  }

  handleSubmit() {
    this.hidePopup.emit(false);
    this.confirmDelete.emit(true);
  }
}
