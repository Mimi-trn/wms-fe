import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseDiagramComponent } from './warehouse-diagram.component';

describe('WarehouseDiagramComponent', () => {
  let component: WarehouseDiagramComponent;
  let fixture: ComponentFixture<WarehouseDiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarehouseDiagramComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WarehouseDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
