import { Component, OnInit } from '@angular/core';
import { MessageService } from 'src/app/services/message.service';
import { WarningService } from 'src/app/services/warning/warning.service';

@Component({
  selector: 'app-warning-configuration',
  templateUrl: './warning-configuration.component.html',
  styleUrls: ['./warning-configuration.component.css'],
})
export class WarningConfigurationComponent implements OnInit {
  constructor(
    private warningService: WarningService,
    private message: MessageService
  ) {}

  async getConfiguration() {
    this.isSpinning = true;
    let res = await this.warningService.getConfiguration();
    if (res) {
      if (res.result.responseCode == '00') {
        this.isSpinning = false;
        this.configWarning = res.data;
      } else {
        this.message.warning(` Có lỗi xảy ra vui lòng thử lại`, ` Thông báo`);
      }
    } else {
      this.message.warning(` Có lỗi xảy ra vui lòng thử lại`, ` Thông báo`);
    }
  }

  ngOnInit(): void {
    this.getConfiguration();
  }

  isSpinning: boolean = true;
  async updateConfiguration() {
    this.isSpinning = true;
    let res = await this.warningService.updateConfiguration(this.configWarning);
    if (res) {
      if (res.result.responseCode == '00') {
        this.isSpinning = false;
        this.message.success(
          ` Cập nhật cấu hình cảnh báo thành công`,
          ` Thông báo`
        );
      } else {
        this.message.warning(` Có lỗi xảy ra vui lòng thử lại`, ` Thông báo`);
      }
    } else {
      this.message.warning(` Có lỗi xảy ra vui lòng thử lại`, ` Thông báo`);
    }
  }

  breadcrumbs = [
    {
      name: 'sidebar.warning.name',
      route: ``,
    },
    {
      name: 'sidebar.warning.child.configWarning',
      route: ``,
    },
  ];

  listDate: any[] = [
    {
      value: 1,
      text: 'Ngày',
    },
    {
      value: 7,
      text: 'Tháng',
    },
    {
      value: 30,
      text: 'Năm',
    },
  ];

  configWarning: any = {
    emailWarning: false,
    systemWarning: false,
    inventoryWarning: false,
    expirationWarning: false,
    soonExpirationWarning: false,
    lessThanMinQuantityInventoryWarning: false,
    lessThanDefiniteQuantityInventoryWarning: false,
    warningQuantity: 0.0,
    duration: 1,
    durationType: 1,
  };
}
