import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "app-popup-focus-out",
  templateUrl: "./popup-focus-out.component.html",
  styleUrls: ["./popup-focus-out.component.css"],
})
export class PopupFocusOutComponent {
  @Input() isVisible: boolean = false;
  @Output() onCreate: EventEmitter<boolean> = new EventEmitter();
  @Output() onCancelCreate: EventEmitter<boolean> = new EventEmitter();
  @Output() cancel: EventEmitter<boolean> = new EventEmitter();

  ngOnInit() {}

  onClickCancelCreate() {
    this.isVisible = false;
    this.onCancelCreate.emit(false);
    this.cancel.emit(false);
  }

  onClickCreate() {
    this.isVisible = false;
    this.onCreate.emit(false);
    this.cancel.emit(false);
  }
}
