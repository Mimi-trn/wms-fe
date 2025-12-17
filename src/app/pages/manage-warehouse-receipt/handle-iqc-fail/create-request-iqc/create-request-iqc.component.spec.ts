import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRequestIqcComponent } from './create-request-iqc.component';

describe('CreateRequestIqcComponent', () => {
  let component: CreateRequestIqcComponent;
  let fixture: ComponentFixture<CreateRequestIqcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateRequestIqcComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateRequestIqcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
