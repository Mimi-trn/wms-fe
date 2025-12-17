import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOfWarningComponent } from './list-of-warning.component';

describe('ListOfWarningComponent', () => {
  let component: ListOfWarningComponent;
  let fixture: ComponentFixture<ListOfWarningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListOfWarningComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListOfWarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
