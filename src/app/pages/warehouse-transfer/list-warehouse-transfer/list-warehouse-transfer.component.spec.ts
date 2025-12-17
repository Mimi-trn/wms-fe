import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListWarehouseTransferComponent } from './list-warehouse-transfer.component';

describe('ListWarehouseTransferComponent', () => {
  let component: ListWarehouseTransferComponent;
  let fixture: ComponentFixture<ListWarehouseTransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListWarehouseTransferComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListWarehouseTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
