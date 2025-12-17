import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupFocusOutComponent } from './popup-focus-out.component';

describe('PopupFocusOutComponent', () => {
  let component: PopupFocusOutComponent;
  let fixture: ComponentFixture<PopupFocusOutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupFocusOutComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupFocusOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
