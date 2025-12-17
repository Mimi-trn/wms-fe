import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranferPackageComponent } from './tranfer-package.component';

describe('TranferPackageComponent', () => {
  let component: TranferPackageComponent;
  let fixture: ComponentFixture<TranferPackageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TranferPackageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TranferPackageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
