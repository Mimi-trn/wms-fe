import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddWarehouseTransferComponent } from './add-warehouse-transfer.component';

describe('AddWarehouseTransferComponent', () => {
  let component: AddWarehouseTransferComponent;
  let fixture: ComponentFixture<AddWarehouseTransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddWarehouseTransferComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddWarehouseTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
