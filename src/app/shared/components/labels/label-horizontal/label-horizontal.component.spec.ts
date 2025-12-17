import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelHorizontalComponent } from './label-horizontal.component';

describe('LabelHorizontalComponent', () => {
  let component: LabelHorizontalComponent;
  let fixture: ComponentFixture<LabelHorizontalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabelHorizontalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabelHorizontalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
