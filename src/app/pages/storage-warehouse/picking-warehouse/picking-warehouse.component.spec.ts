import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PickingWarehouseComponent } from './picking-warehouse.component';

describe('PickingWarehouseComponent', () => {
  let component: PickingWarehouseComponent;
  let fixture: ComponentFixture<PickingWarehouseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PickingWarehouseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PickingWarehouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
