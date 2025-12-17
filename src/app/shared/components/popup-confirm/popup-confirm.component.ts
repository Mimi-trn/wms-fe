import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-popup-confirm',
  templateUrl: './popup-confirm.component.html',
  styleUrls: ['./popup-confirm.component.css'],
})
export class PopupConfirmComponent {
  @Input() isVisible: boolean = false;
  @Input() title: string = '';
  @Input() content: string = '';
  @Output() isVisibleChange: EventEmitter<boolean> = new EventEmitter();
  @Output() cancel: EventEmitter<boolean> = new EventEmitter();

  ngOnInit() {}

  handleCancel() {
    this.isVisible = false;
    this.cancel.emit(false);
  }

  submit() {
    this.isVisible = false;
    this.isVisibleChange.emit(false);
    this.cancel.emit(false);
  }
}
