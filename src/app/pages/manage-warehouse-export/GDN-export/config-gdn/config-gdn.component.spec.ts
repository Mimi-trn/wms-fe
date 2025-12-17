import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigGDNComponent } from './config-gdn.component';

describe('ConfigGDNComponent', () => {
  let component: ConfigGDNComponent;
  let fixture: ComponentFixture<ConfigGDNComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigGDNComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigGDNComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
