import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseTransferDetailComponent } from './warehouse-transfer-detail.component';

describe('WarehouseTransferDetailComponent', () => {
  let component: WarehouseTransferDetailComponent;
  let fixture: ComponentFixture<WarehouseTransferDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarehouseTransferDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WarehouseTransferDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
