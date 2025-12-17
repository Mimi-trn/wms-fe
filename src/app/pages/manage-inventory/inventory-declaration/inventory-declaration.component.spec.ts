import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryDeclarationComponent } from './inventory-declaration.component';

describe('InventoryDeclarationComponent', () => {
  let component: InventoryDeclarationComponent;
  let fixture: ComponentFixture<InventoryDeclarationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InventoryDeclarationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryDeclarationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
