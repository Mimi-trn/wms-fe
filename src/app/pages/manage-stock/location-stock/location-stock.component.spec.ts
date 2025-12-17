import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationStockComponent } from './location-stock.component';

describe('LocationStockComponent', () => {
  let component: LocationStockComponent;
  let fixture: ComponentFixture<LocationStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LocationStockComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocationStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
