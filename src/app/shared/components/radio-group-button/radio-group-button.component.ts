import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-radio-group-button',
  templateUrl: './radio-group-button.component.html',
  styleUrls: ['./radio-group-button.component.css'],
})
export class RadioGroupButtonComponent {
  @Input() listOfButton: string[] = [];

  @Output() onChange: EventEmitter<Number> = new EventEmitter();

  currentButtonIndex: number = 0;

  onChangeSelect(index: number) {
    this.currentButtonIndex = index;
    this.onChange.emit(index);
  }
}
