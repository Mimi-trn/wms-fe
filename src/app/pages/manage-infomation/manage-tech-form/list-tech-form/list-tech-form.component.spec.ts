import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTechFormComponent } from './list-tech-form.component';

describe('ListTechFormComponent', () => {
  let component: ListTechFormComponent;
  let fixture: ComponentFixture<ListTechFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListTechFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListTechFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
