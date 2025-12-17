import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarningConfigurationComponent } from './warning-configuration.component';

describe('WarningConfigurationComponent', () => {
  let component: WarningConfigurationComponent;
  let fixture: ComponentFixture<WarningConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarningConfigurationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WarningConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
