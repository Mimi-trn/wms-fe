import { Component, OnInit, Input, EventEmitter, Optional, Output, Self } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { format } from 'date-fns';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.css']
})
export class DatePickerComponent implements OnInit, ControlValueAccessor{

  @Input() placeHolder = 'dd/mm/yyyy';
  @Input() labelContent!: string;
  @Input() errorTip!: string;
  @Input() disabled = false;
  @Input() required = false;
  @Input() name = 'birthdate';
  @Input() span = 16;
  @Input() format = 'DD/MM/YYYY';
  @Input() hideLabel = false;
  @Input() labelHorizontal = true;
  @Input() classWidth: any;
  @Input() isFilterList = false;
  @Input() isVisibilityLabel = false;
  @Output() changeDate: EventEmitter<Date> = new EventEmitter<Date>();


  date!: string;

  constructor(
    @Optional() @Self() public ngControl: NgControl,
   
  ) {
    // if (this.ngControl != null) {
    //   this.ngControl.valueAccessor = this;
    // }
  }

  ngOnInit(){
    if(!this.errorTip) {
      this.errorTip = this.labelContent + ' ' + 'không được để trống'
    }
  }

  writeValue(obj: any): void {
    if (obj) {
      this.date = 'trung';
    }
  }

  registerOnChange(fn: any): void {
  }

  registerOnTouched(fn: any): void {
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

}
