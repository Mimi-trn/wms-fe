import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarcodeItemComponent } from './BarcodeItemComponent';

describe('BarcodeItemComponent', () => {
  let component: BarcodeItemComponent;
  let fixture: ComponentFixture<BarcodeItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BarcodeItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarcodeItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
