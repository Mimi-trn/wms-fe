import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateWarehouseTransferComponent } from './create-warehouse-transfer.component';

describe('CreateWarehouseTransferComponent', () => {
  let component: CreateWarehouseTransferComponent;
  let fixture: ComponentFixture<CreateWarehouseTransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateWarehouseTransferComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateWarehouseTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
