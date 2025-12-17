import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseTransferNoteDetailComponent } from './warehouse-transfer-note-detail.component';

describe('WarehouseTransferNoteDetailComponent', () => {
  let component: WarehouseTransferNoteDetailComponent;
  let fixture: ComponentFixture<WarehouseTransferNoteDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarehouseTransferNoteDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WarehouseTransferNoteDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
