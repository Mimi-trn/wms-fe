import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirm-delete',
  templateUrl: './confirm-delete.component.html',
  styleUrls: ['./confirm-delete.component.css'],
})
export class ConfirmDeleteComponent implements OnInit {
  @Input() title: string = 'This is title';
  @Input() nameData: string = 'This is name data';
  @Input() content: string = 'This is content';
  @Input() isVisible: boolean = false;
  @Output() hidePopup: EventEmitter<boolean> = new EventEmitter();
  @Output() confirmDelete: EventEmitter<boolean> = new EventEmitter();
  constructor() {}

  ngOnInit() {}

  handleCancel() {
    this.hidePopup.emit(false);
  }

  handleSubmit() {
    this.hidePopup.emit(false);
    this.confirmDelete.emit(true);
  }
}
