import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventorySituationComponent } from './inventory-situation.component';

describe('InventorySituationComponent', () => {
  let component: InventorySituationComponent;
  let fixture: ComponentFixture<InventorySituationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InventorySituationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventorySituationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
