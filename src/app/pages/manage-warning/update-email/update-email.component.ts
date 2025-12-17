import { StatisticRoutingModule } from './../../statistic/statistic-routing.module';
import { Input, Output, EventEmitter, Component, OnInit } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonService } from 'src/app/services/export-warehouse/commonService.service';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-update-email',
  templateUrl: './update-email.component.html',
  styleUrls: ['./update-email.component.css'],
})
export class UpdateEmailComponent implements OnInit {
  @Input() idEmail: any = {};
  @Output() cancel: EventEmitter<any> = new EventEmitter();

  constructor(
    private loading: NgxUiLoaderService,
    private messageService: MessageService,
    private commonService: CommonService
  ) {}
  listEmployee: any[] = [];
  listGroup: any[] = [];
  ngOnInit() {
    let arrReceiver: any[] = [];
    let arrCC: any[] = [];
    this.dataInformation = this.idEmail;
    if (this.idEmail.employeeList.length > 0) {
      let arr = this.idEmail.employeeList;
      arr.forEach((element: any) => {
        if (element.type == 1) {
          arrReceiver.push(element);
        }
        if (element.type == 2) {
          arrCC.push(element);
        }
      });
    }
    this.dataInformation.listEmployeeReceiver = arrReceiver;
    this.dataInformation.emailCC = arrCC;
    this.getListEmployee();
  }
  async getListEmployee() {
    this.loading.start();
    let data = {
      pageIndex: 0, //number of page
      pageSize: 0, //number of display elements per page
      filter: {},
    };
    let resp = await this.commonService.getListEmployees(data);
    if (resp.result.responseCode == '00') {
      this.loading.stop();
      this.listEmployee = resp.data;
      this.listGroup = this.groupByTeam(resp.data);
    } else {
      this.loading.stop();
    }
  }

  groupByTeam(employees: any[]): any[] {
    const groupedData: any[] = [];

    employees.forEach((employee) => {
      const existingGroup = groupedData.find(
        (group) => group.teamGroupId === employee.teamGroupId
      );

      if (existingGroup) {
        existingGroup.employee.push(employee);
      } else {
        const newGroup = {
          teamGroup: employee.teamGroup,
          teamGroupId: employee.teamGroupId,
          employee: [employee],
        };

        groupedData.push(newGroup);
      }
    });

    return groupedData;
  }
  onHandleCancel() {
    this.cancel.emit(false);
  }

  changeGroup(event: any) {
    let tempGroup: any[] = [];
    tempGroup = event;
    let tempEmployee: any[] = [];
    tempGroup.forEach((element) => {
      element.employee.forEach((row: any) => {
        tempEmployee.push(row);
      });
    });
    this.dataInformation.listEmployeeReceiver = tempEmployee;
  }

  changeGroupCC(event: any) {
    let tempGroup: any[] = [];
    tempGroup = event;
    let tempEmployee: any[] = [];
    tempGroup.forEach((element) => {
      element.employee.forEach((row: any) => {
        tempEmployee.push(row);
      });
    });
    this.dataInformation.emailCC = tempEmployee;
  }

  changeEmployee(event: any) {}

  compareFn = (o1: any, o2: any): boolean =>
    o1 && o2 ? o1.teamGroupId === o2.teamGroupId : o1 === o2;

  compareFnEmployee = (o1: any, o2: any): boolean =>
    o1 && o2 ? o1.employeeId === o2.employeeId : o1 === o2;

  dataInformation: any = {};

  async update() {
    let mergeArr = [
      ...this.dataInformation.listEmployeeReceiver.map((item: any) => ({
        type: 1,
        employeeId: item.employeeId,
        employeeName: item.employeeName,
        email: item.employeeEmail,
      })),
      ...this.dataInformation.emailCC.map((item: any) => ({
        type: 2,
        employeeId: item.employeeId,
        employeeName: item.employeeName,
        email: item.employeeEmail,
      })),
    ];

    let mergeGr = [
      ...this.dataInformation.groupEmail.map((item: any) => ({
        ...item,
        type: 1,
      })),
      ...this.dataInformation.listGroupCC.map((item: any) => ({
        ...item,
        type: 2,
      })),
    ];

    let data = {
      id: this.idEmail.id,
      emailHeader: this.idEmail.emailHeader,
      emailType: this.idEmail.emailType,
      emailTypeString: this.idEmail.emailTypeString,
      status: this.idEmail.status,
      employeeList: mergeArr,
      teamgroupList: [],
      filterEmail: null,
      filterTeamGroup: null,
    };
    let res = await this.commonService.putEmailConfig(data);
    if (res) {
      this.messageService.success(
        ` Cập nhật cấu hình email thành công`,
        ` Thông báo`
      );
      this.cancel.emit(false);
    }
  }

  listStatus: any[] = [
    {
      label: 'Tắt thông báo',
      value: 1,
    },
    {
      label: 'Bật thông báo',
      value: 2,
    },
  ];

  listEmailType: any[] = [
    {
      label: 'Thêm mới PO',
      value: 1,
    },
    {
      label: 'Thêm mới yêu cầu IQC',
      value: 2,
    },
    {
      label: 'Thêm mới yêu cầu nhập kho',
      value: 3,
    },
    {
      label: 'Thêm mới phiếu nhập kho',
      value: 4,
    },
  ];
}
