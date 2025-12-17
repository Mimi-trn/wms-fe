import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupWithdrawComponent } from './popup-withdraw.component';

describe('PopupWithdrawComponent', () => {
  let component: PopupWithdrawComponent;
  let fixture: ComponentFixture<PopupWithdrawComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupWithdrawComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupWithdrawComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
