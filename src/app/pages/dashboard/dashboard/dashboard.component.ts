import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { Chart } from 'chart.js/auto';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { MessageService } from 'src/app/services/message.service';

import { WarningService } from 'src/app/services/warning/warning.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  constructor(
    private translateService: TranslateService,
    private messageService: MessageService,
    private loading: NgxUiLoaderService,
    private dashboardService: DashboardService,
    private warningService: WarningService,
  ) { }
  // Danh sách breadcrumbs
  breadcrumbs: any = [
    {
      name: 'Dashboard',
      route: ``,
    },
  ];
  // Danh sách các cột của bảng hàng hóa quá hạn
  itemTableColumns: any = [
    {
      keyTitle: 'Nội dung cảnh báo',
      keyName: 'content',
      width: '1000px',
      align: 'left',
      isSort: false,
    }
  ];
  // Danh sách hàng hóa quán hạn
  listItems: any = [];
  // Lưu trữ body request
  pageFilter: any = {
    common: '',
    pageIndex: 0,
    pageSize: 0,
    filter: {},
    sortOrder: 'ASC',
    sortProperty: 'expiredDate',
  };
  // Biểu đồ cột
  barChart: any = {};
  // Biếu đồ tròn
  pieChart: any = {};
  // Tổng số lượng quá hạn
  totalQuantity: number = 0;
  sortProperty: string = '';
  sortOrder: string = 'DESC';
  // Lấy ngày hiện tại
  today: Date = new Date();
  // Ngày giới hạn hiển thị dữ liệu cho dashboard
  rangDate: any = [
    new Date(this.today.getTime() - 7 * 24 * 60 * 60 * 1000),
    this.today,
  ];
  // Dữ liệu dashboard
  dashboardData: any = {};
  chartData: any = {};
  // Danh sách tên hàng hóa hỏng
  listProductName: any = [];
  // Dữ liệu bar-chart
  barData: any = [];
  // Danh sách tên kho
  listWarehouse: any = [];
  // Dữ liệu bar-chart
  pieData: any = [];
  itemGroupList: any = []

  ngOnInit() {
    this.loading.start();

    // Khởi tạo chart trống 1 lần
    this.initBarChart();
    this.initPieChart();

    // Lấy dữ liệu items
    this.dashboardService.getItem().then(resItem => {
      const data = resItem.data;
      this.itemGroupList = data.map((d: any) => d.itemGroup);
      this.pieData = data.map((d: any) => d.totalStockQuantity);

      const colors = this.getRandomColor(this.itemGroupList.length);
      this.updatePieChart(colors);
    });

    // Lấy dữ liệu chart
    this.loadBarChartData();

    // Lấy dashboard info
    this.dashboardService.getInfo({ startAt: this.rangDate[0], endAt: this.rangDate[1] })
      .then(res => { this.dashboardData = res.data; });

    // Lấy danh sách cảnh báo
    let warningPayload = { pageIndex: 0, pageSize: 10000, filter: {}, common: "" };
    this.dashboardService.getListWarning(warningPayload).then(res => { this.listItems = res.data; });

    this.loading.stop();
  }
  initBarChart() {
    this.listProductName = ["Nhập kho mua hàng", "Nhập kho thành phẩm", "Nhập kho khác", "Xuất kho sản xuất", "Xuất kho khác", "Kiểm kê"];
    this.barChart = new Chart('bar-chart', {
      type: 'bar',
      data: {
        labels: this.listProductName,
        datasets: [{ label: 'Số lượng', data: [0, 0, 0, 0, 0, 0], backgroundColor: 'rgb(109,185,255)' }]
      },
      options: {
        plugins: {
          legend: { display: false },
          title: { display: true, text: this.translateService.instant('Biểu đồ số lượng phiếu'), font: { size: 30, weight: 600 }, padding: { top: 25, bottom: 25 } }
        },
        maintainAspectRatio: false,
        scales: { x: { border: { display: false }, grid: { display: false }, ticks: { autoSkip: false } }, y: { border: { display: false }, grid: { display: false } } }
      }
    });
  }

  loadBarChartData() {
    this.dashboardService.getBill({ startAt: this.rangDate[0], endAt: this.rangDate[1] }).then(res => {
      this.chartData = res.data;
      this.barData = [
        Number(this.chartData.grnPoQuantity),
        Number(this.chartData.grnTpQuantity),
        Number(this.chartData.grnOtherQuantity),
        Number(this.chartData.gdnNvlQuantity),
        Number(this.chartData.gdnOtherQuantity),
        Number(this.chartData.auditQuantity),
      ];

      this.barChart.data.datasets[0].data = this.barData;
      this.barChart.update();
    });
  }

  // Khởi tạo pie chart trống
  initPieChart() {
    this.pieChart = new Chart('pie-chart', {
      type: 'pie',
      data: { labels: [], datasets: [{ data: [], backgroundColor: [], hoverOffset: 4 }] },
      options: { plugins: { legend: { display: true, position: 'right' }, title: { display: true, text: this.translateService.instant('Biểu đồ số lượng nhóm hàng hóa'), font: { size: 30, weight: 400 } } } }
    });
  }

  updatePieChart(colors: string[]) {
    this.pieChart.data.labels = this.itemGroupList;
    this.pieChart.data.datasets[0].data = this.pieData;
    this.pieChart.data.datasets[0].backgroundColor = colors;
    this.pieChart.update();
  }

  getRandomColor(amountColor: number) {
    const letters = '0123456789ABCDEF';
    let listColors = [];
    for (let i = 0; i < amountColor; i++) {
      let color = '#';
      for (let j = 0; j < 6; j++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      listColors.push(color);
    }
    return listColors;
  }

  createChart() {

    this.barChart = new Chart('bar-chart', {
      type: 'bar',
      data: {
        labels: this.listProductName,
        datasets: [
          {
            label: 'Số lượng',
            data: this.barData,
            backgroundColor: ['rgb(109, 185, 255)'],
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: this.translateService.instant('Biểu đồ số lượng phiếu'),
            font: {
              size: 30,
              weight: 600,
            },
            padding: {
              top: 25,
              bottom: 25,
            },
          },
        },
        maintainAspectRatio: false,
        scales: {
          x: {
            border: { display: false },
            grid: { display: false },
            ticks: {
              font: { size: 14, weight: 400 },
              autoSkip: false,
            },
          },
          y: {
            border: { display: false },
            grid: { display: false },
            ticks: {}
          },
        },
      },
    });
    this.barChart.data.datasets[0].data = this.barData;
    this.barChart.update();
  }

  createPieChart(colors: string[]) {
    this.pieChart = new Chart('pie-chart', {
      type: 'pie',
      data: {
        labels: this.itemGroupList,
        datasets: [
          {
            data: this.pieData,
            backgroundColor: colors,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        plugins: {
          legend: { display: true, position: 'right' },
          title: {
            display: true,
            text: this.translateService.instant('Biểu đồ số lượng nhóm hàng hóa'),
            font: { size: 30, weight: 400 }
          }
        }
      }
    });
  }

  convertMoney(number: number) {
    let count = 0;
    while (number > 1) {
      number /= 1000;
      count++;
    }
    if (count <= 2) {
      return (number * 1000).toLocaleString("en-US", { minimumFractionDigits: 2 });
    } else if (count == 3) {
      return (number * 1000).toFixed(2) + " tr";
    } else {
      return (number * 1000).toFixed(2) + " tỷ";
    }
  }

  changeLabelToMultipleLine(label: String, amountWordPerLine: number) {
    let newLabel = [];
    let productName = label.split(' ');

    for (var i = 0; i < productName.length; i += amountWordPerLine) {
      if (i + amountWordPerLine - 1 < productName.length) {
        newLabel.push(
          productName[i] + ' ' + productName[i + 1] + ' ' + productName[i + 2]
        );
      } else {
        let value = '';
        for (var j = 1; j < productName.length - i; j++) {
          if (j == 1) {
            value += productName[i + j];
          } else {
            value += ' ' + productName[i + j];
          }
        }
        newLabel.push(value);
        break;
      }
    }
    return newLabel;
  }

  // Hàm xử lý sự kiện onResize
  id = -1;
  onResize({ width }: NzResizeEvent, i: number): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.itemTableColumns[i].width = width + 'px';
    });
  }

  // Hàm load lại dữ liệu hàng hóa quá hạn
  fetchItemData() {
    this.loading.start();
    this.dashboardService
      .getListItemExpiredDate(this.pageFilter)
      .then((response) => {
        this.listItems = response.data;
        this.listItems.forEach((data: any) => {
          this.totalQuantity += Number(data.remainQuantity);
        });
      })
      .finally(() => {
        this.loading.start();
      });
  }

  // Hàm xử lý filter cho bảng hàng hóa quá hạn
  filterTable() {
    if (this.pageFilter.filter.expiredDate) {
      this.pageFilter.filter.expiredDate2 =
        this.pageFilter.filter.expiredDate.pop();
      this.pageFilter.filter.expiredDate =
        this.pageFilter.filter.expiredDate.pop();
    }

    this.fetchItemData();
  }

  // Hàm xử lý cho sự kiên ấn enter cho filter
  onEnterFilter(event: any) {
    if ((event.keyCode = 13)) {
      this.filterTable();
    }
  }

  // Lấy dữ liệu của dashboard
  getDashboardData() {
    this.loading.start();

    // Lấy dữ liệu tổng quan dashboard
    this.dashboardService.getInfo({
      startAt: this.rangDate[0],
      endAt: this.rangDate[1],
    }).then((response) => {
      this.dashboardData = response.data;
    });

    // Lấy dữ liệu bar chart
    this.dashboardService.getBill({
      startAt: this.rangDate[0],
      endAt: this.rangDate[1],
    }).then((response) => {
      this.chartData = response.data;

      // Gắn label cố định
      this.listProductName = [
        "Nhập kho mua hàng",
        "Nhập kho thành phẩm",
        "Nhập kho khác",
        "Xuất kho sản xuất",
        "Xuất kho khác",
        "Kiểm kê"
      ];

      // Gắn dữ liệu đúng theo JSON
      this.barData = [
        Number(this.chartData.grnPoQuantity),
        Number(this.chartData.grnTpQuantity),
        Number(this.chartData.grnOtherQuantity),
        Number(this.chartData.gdnNvlQuantity),
        Number(this.chartData.gdnOtherQuantity),
        Number(this.chartData.auditQuantity),
      ];

      // **Chỉ cập nhật dữ liệu chart hiện có**
      if (this.barChart) {
        this.barChart.data.datasets[0].data = this.barData;
        this.barChart.update();
      }
    }).finally(() => {
      this.loading.stop();
    });
  }


  // Hàm xử lý sự kiện lọc
  onSort(sortProperty: string, index: number) {
    this.sortProperty = sortProperty;
    this.pageFilter.sortProperty = sortProperty;
    this.itemTableColumns.forEach((e: any) => {
      if (e.keyName != sortProperty) {
        e.isSort = false;
      }
    });
    if (!this.itemTableColumns[index].isSort) {
      this.sortOrder = 'DESC';
      this.itemTableColumns[index].isSort = true;
    } else {
      if (this.sortOrder == 'DESC') {
        this.sortOrder = 'ASC';
      } else {
        this.sortOrder = 'DESC';
      }
    }
    this.pageFilter.sortOrder = this.sortOrder;
    this.fetchItemData();
  }
}
