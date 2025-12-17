import { async } from '@angular/core/testing';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { WarehouseDiagramService } from 'src/app/services/warehouse-diagram/warehouse-diagram.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-map-location-product',
  templateUrl: './map-location-product.component.html',
  styleUrls: ['./map-location-product.component.css'],
})
export class MapLocationProductComponent implements OnChanges {
  constructor(
    private warehouseDiagramService: WarehouseDiagramService,
    private loader: NgxUiLoaderService,
    private toast: ToastrService
  ) {}
  @Input() locationCode: any;
  @Input() isVisible: boolean = false;
  @Output() isVisibleChange: EventEmitter<boolean> = new EventEmitter();

  handleCancel() {
    this.isVisible = false;
    this.isVisibleChange.emit(false);
  }

  // ngOnInit() {
  //   this.getMappedProduct({
  //     page: this.pageNumber,
  //     size: this.pageSize,
  //   });
  // }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible']) {
      if (this.isVisible) {
        this.getMappedProduct({
          page: this.pageNumber,
          size: this.pageSize,
        });
        this.getProduct();
        this.listNewMapped = [];
      }
    }
  }

  noDataFound: boolean = false;
  common: string = '';
  orderSort: string = 'DESC';
  propertySort: string | null = 'createdAt';
  total: number = 0;
  pageNumber: number = 1;
  pageSize: number = 10;
  searchData: any = {};
  allChecked: boolean = false;
  indeterminate: boolean = true;

  listMapped: any[] = [];
  currentMapped: any = {};
  visibleConfirmDelete: boolean = false;
  isVisibleImportFile: boolean = false;
  listNewMapped: any[] = [];
  listProduct: any[] = [];
  filteredListProduct: any[] = [];

  columns: any[] = [
    {
      keyTitle: 'STT',
      width: '10%',
      keyName: 'stt',
      check: true,
    },
    {
      keyTitle: 'Mã sản phẩm',
      width: '30%',
      keyName: 'itemCode',
      check: true,
    },
    {
      keyTitle: 'Tên sản phẩm',
      width: '30%',
      keyName: 'itemName',
      check: true,
    },
    {
      keyTitle: 'Ghi chú',
      width: '30%',
      keyName: 'note',
      check: true,
    },
  ];

  id = -1;
  onResize({ width }: NzResizeEvent, i: number) {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.columns[i].width = width + 'px';
    });
  }

  count = 0;
  customSortFunction(event: any, sortColumn: string) {
    this.count = this.count + 1;
    if (this.count % 3 == 1) {
      this.orderSort = 'DESC';
      this.propertySort = null;
    } else if (this.count % 3 == 2) {
      this.propertySort = null;
      this.orderSort = 'ASC';
    } else {
      this.orderSort = 'DESC';
      this.propertySort = 'createdAt';
    }
    this.propertySort = sortColumn;
    this.getMappedProduct({
      page: this.pageNumber,
      size: this.pageSize,
    });
  }

  clearInput(keyName: string) {
    this.searchData[keyName] = '';
    this.getMappedProduct({
      page: this.pageNumber,
      size: this.pageSize,
    });
  }

  async search($event: any) {
    if ($event.keyCode == 13) {
      this.getMappedProduct({
        page: this.pageNumber,
        size: this.pageSize,
      });
      this.noDataFound = this.total > 0 ? false : true;
    }
  }

  async getMappedProduct(page: { page: number; size: number }) {
    console.log('getMappedProduct', this.locationCode);
    const data = {
      pageNumber: page.page - 1,
      pageSize: page.size,
      filter: {
        id: this.searchData.id || '',
        itemCode: this.searchData.itemCode || '',
        itemName: this.searchData.itemName || '',
        note: this.searchData.note || '',
      },
      sortOrder: this.orderSort,
      sortProperty: this.propertySort,
    };
    this.loader.start();
    let res = await this.warehouseDiagramService.getMappedProduct(
      data,
      this.locationCode
    );
    if (res?.result?.ok) {
      this.listMapped = res.data;
      this.total = res.dataCount;
      this.noDataFound = this.total > 0 ? false : true;
    } else {
      if (res?.result?.message) this.toast.error(res.result.message);
      else this.toast.error('Có lỗi xảy ra, vui lòng thử lại sau');
    }
    this.loader.stop();
  }

  handleDelete(item: any) {
    this.currentMapped = item;
    this.visibleConfirmDelete = true;
  }

  async deleteMappedProduct() {
    this.loader.start();
    let res = await this.warehouseDiagramService.deleteMappedProduct(
      this.currentMapped.id
    );
    if (res?.result?.ok) {
      this.getMappedProduct({
        page: this.pageNumber,
        size: this.pageSize,
      });
      this.toast.success('Xóa thành công');
    } else {
      if (res?.result?.message) this.toast.error(res.result.message);
      else this.toast.error('Có lỗi xảy ra, vui lòng thử lại sau');
    }
    this.loader.stop();
  }

  hidePopupDelete(event: any) {
    this.visibleConfirmDelete = event;
  }

  handleAddNew() {
    this.listNewMapped.push({
      itemCode: '',
      itemName: '',
      note: '',
    });
  }
  handleDeleteNew(item: any) {
    this.listNewMapped = this.listNewMapped.filter((x) => x != item);
  }

  async getProduct() {
    let data = {
      pageNumber: 0,
      pageSize: 0,
      common: '',
      filter: {
        productCode: '',
        proName: '',
        techName: '',
        unit: '',
      },
      sortOrder: 'DESC',
      sortProperty: 'updatedAt',
    };
    let resp = await this.warehouseDiagramService.getItemsNVL(data);
    this.listProduct = resp.data;
    this.filteredListProduct = this.listProduct;
    if (resp.result.responseCode == '00') {
    } else {
      // this.toast.error('Có lỗi xảy ra, vui lòng thử lại sau');
      console.log('errorgetProduct', resp?.result?.responseMessage);
    }
  }

  async addMappedProduct(data: any) {
    this.loader.start();
    let res = await this.warehouseDiagramService.addMappedProduct(
      this.locationCode,
      data.productCode
    );
    if (res?.result?.ok) {
      this.getMappedProduct({
        page: this.pageNumber,
        size: this.pageSize,
      });
      this.handleDeleteNew(data);
      this.toast.success('Thêm thành công');
    } else {
      if (res?.result?.message != '') this.toast.error(res.result.message);
      else this.toast.error('Có lỗi xảy ra, vui lòng thử lại sau');
    }
    this.loader.stop();
  }

  onSearchProduct(searchValue: string): void {
    this.filteredListProduct = this.listProduct.filter((option) =>
      option.toLowerCase().includes(searchValue.toLowerCase())
    );
  }

  onHandleOpenImportFile() {
    this.isVisibleImportFile = true;
  }

  downloadTemplateFile() {
    let link = document.createElement('a');
    link.download = 'Template_MapLocationProduct.xlsx';
    link.href =
      '../../../../../assets/templateFile/Template_MapLocationProduct.xlsx';
    link.click();
  }

  async onHandleImportFile(files: File[]) {
    if (files.length !== 1) throw new Error('Cannot use multiple files');
    const reader: FileReader = new FileReader();
    reader.onload = async (e: any) => {
      this.loader.start();
      const binaryData = e.target.result;
      const workbook: XLSX.WorkBook = XLSX.read(binaryData, {
        type: 'binary',
      });
      const sheetName: string = workbook.SheetNames[0];
      const sheetData: XLSX.WorkSheet = workbook.Sheets[sheetName];
      const data: any[][] = XLSX.utils.sheet_to_json(sheetData, {
        header: 1,
        raw: true,
      });
      const dataError: any[] = [];

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || !row[0]) {
          continue;
        }
        const elementFind =
          this.listProduct.find((item) => item.productCode === row[0].trim()) ||
          false;
        if (elementFind) {
          let res = await this.warehouseDiagramService.addMappedProduct(
            this.locationCode,
            row[0]
          );
          if (res?.result?.ok) {
            continue;
          } else {
            dataError.push(row[0]);
            continue;
          }
        } else {
          dataError.push(row[0]);
        }
      }
      if (dataError.length > 0) {
        this.toast.error(`Có ${dataError.length} mã sản phẩm không hợp lệ`);
      } else {
        this.toast.success('Import thành công');
      }
      this.getMappedProduct({
        page: this.pageNumber,
        size: this.pageSize,
      });
      this.loader.stop();
    };

    reader.readAsBinaryString(files[0]);
  }
}
