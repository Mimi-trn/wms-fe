import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandleIqcFailComponent } from './handle-iqc-fail.component';

describe('HandleIqcFailComponent', () => {
  let component: HandleIqcFailComponent;
  let fixture: ComponentFixture<HandleIqcFailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HandleIqcFailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HandleIqcFailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
