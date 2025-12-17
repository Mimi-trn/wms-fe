import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListWarehouseTransferNoteComponent } from './list-warehouse-transfer-note.component';

describe('ListWarehouseTransferNoteComponent', () => {
  let component: ListWarehouseTransferNoteComponent;
  let fixture: ComponentFixture<ListWarehouseTransferNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListWarehouseTransferNoteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListWarehouseTransferNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
