import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewHandleIqcFailComponent } from './view-handle-iqc-fail.component';

describe('ViewHandleIqcFailComponent', () => {
  let component: ViewHandleIqcFailComponent;
  let fixture: ComponentFixture<ViewHandleIqcFailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewHandleIqcFailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewHandleIqcFailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
