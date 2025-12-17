import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-pagination',
  template: `
    <nz-divider class="m-0 mt-12"></nz-divider>
    <div
      nz-row
      nzJustify="space-between"
      nzGutter="24"
      nzAlign="top"
      class="mt-12"
    >
      <div nz-col>
        <nz-select
          [(ngModel)]="currentSize"
          (ngModelChange)="changeSize()"
          [nzShowArrow]="true"
          [nzDropdownMatchSelectWidth]="false"
        >
          <nz-option
            [nzValue]="10"
            nzLabel="10 / {{ 'pagi.page' | translate }}"
          ></nz-option>
          <nz-option
            [nzValue]="20"
            nzLabel="20 / {{ 'pagi.page' | translate }}"
          ></nz-option>
          <nz-option
            [nzValue]="30"
            nzLabel="30 / {{ 'pagi.page' | translate }}"
          ></nz-option>
        </nz-select>
      </div>
      <div nz-col>
        <div nz-row nzJustify="center">
          <nz-pagination
            [(nzPageIndex)]="currentPage"
            [nzTotal]="total"
            [nzShowQuickJumper]="false"
            [nzSize]="'small'"
            [(nzPageSize)]="currentSize ? currentSize : total"
            [nzResponsive]="false"
            [nzShowSizeChanger]="false"
            (nzPageIndexChange)="changeIndex()"
            (nzPageSizeChange)="changeSize()"
            [nzShowTotal]="rangeTemplate"
          ></nz-pagination>

          <ng-template #rangeTemplate let-range="range" let-total>
            {{ 'pagi.show' | translate }} {{ currentPage }}
            {{ 'pagi.total' | translate }} {{ totalPage }} ( {{ total }}
            {{ 'pagi.record' | translate }} )
          </ng-template>
        </div>
      </div>
      <div nz-col>
        <nz-row nzJustify="end" nzAlign="middle">
          <div class="mr-8">
            {{ 'pagi.page.goto' | translate }}
          </div>
          <div>
            <input
              style="width: 60px"
              type="number"
              nz-input
              [value]="currentPage"
              (keyup)="changePage($event)"
            />
          </div>
        </nz-row>
      </div>
    </div>
  `,
})
export class PaginationComponent {
  constructor(private toast: ToastrService) {}
  @Input() total: number = 0;
  @Output() emitPage: EventEmitter<any> = new EventEmitter();
  @Input() currentPage = 1;

  @Input() currentSize = 10;

  pageSize: any;
  totalPage: number = 0;

  getPage(page: number) {
    this.currentPage = page;
  }
  getSize(size: number) {
    this.currentSize = size;
  }

  changeIndex() {
    this.totalPage = this.currentSize
      ? Math.ceil(this.total / this.currentSize)
      : 1;
    this.emitPage.emit({ page: this.currentPage, size: this.currentSize });
  }

  changeSize() {
    this.totalPage = this.currentSize
      ? Math.ceil(this.total / this.currentSize)
      : 1;
    this.emitPage.emit({ page: this.currentPage, size: this.currentSize });
  }

  changePage($event: any) {
    let page = this.currentPage;
    if ($event.keyCode == 13) {
      this.currentPage = $event.target.value;

      if (this.currentPage < 1) {
        this.toast.warning('Trang nhỏ nhất là 1');
        this.currentPage = page;
      } else if (this.currentPage > this.totalPage) {
        this.toast.warning('Trang lớn nhất là ' + this.totalPage);
        this.currentPage = page;
      } else {
        this.emitPage.emit({ page: this.currentPage, size: this.currentSize });
      }
    }
  }

  ngOnInit(): void {
    // this.emitPage.emit({ page: this.currentPage, size: this.currentSize });
    this.totalPage = this.currentSize
      ? Math.ceil(this.total / this.currentSize)
      : 1;
  }

  ngOnChanges(changes: any): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    this.totalPage = this.currentSize
      ? Math.ceil(this.total / this.currentSize)
      : 1;
  }
}
