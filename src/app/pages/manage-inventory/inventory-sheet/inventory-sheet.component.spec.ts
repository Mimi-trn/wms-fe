import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventorySheetComponent } from './inventory-sheet.component';

describe('InventorySheetComponent', () => {
  let component: InventorySheetComponent;
  let fixture: ComponentFixture<InventorySheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InventorySheetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventorySheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
