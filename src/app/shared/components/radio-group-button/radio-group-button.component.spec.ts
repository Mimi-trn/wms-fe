import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadioGroupButtonComponent } from './radio-group-button.component';

describe('RadioGroupButtonComponent', () => {
  let component: RadioGroupButtonComponent;
  let fixture: ComponentFixture<RadioGroupButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RadioGroupButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadioGroupButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
