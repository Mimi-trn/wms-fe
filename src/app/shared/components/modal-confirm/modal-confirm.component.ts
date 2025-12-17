import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal-confirm',
  templateUrl: './modal-confirm.component.html',
  styleUrls: ['./modal-confirm.component.css'],
})
export class ModalConfirmComponent {
  @Input() isVisible: boolean = false;
  @Input() title: string = '';
  @Input() content: string = '';
  @Output() isVisibleChange: EventEmitter<boolean> = new EventEmitter();
  @Output() cancel: EventEmitter<boolean> = new EventEmitter();
  constructor() {}

  handleCancel() {
    this.isVisible = false;
    this.cancel.emit(false);
  }

  submit() {
    this.isVisible = false;
    this.isVisibleChange.emit(true);
    this.cancel.emit(false);
  }
}
