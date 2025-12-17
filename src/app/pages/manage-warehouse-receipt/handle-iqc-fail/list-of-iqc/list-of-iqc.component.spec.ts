import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOfIqcComponent } from './list-of-iqc.component';

describe('ListOfIqcComponent', () => {
  let component: ListOfIqcComponent;
  let fixture: ComponentFixture<ListOfIqcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListOfIqcComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListOfIqcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
