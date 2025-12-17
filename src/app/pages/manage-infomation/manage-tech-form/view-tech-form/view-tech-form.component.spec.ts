import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTechFormComponent } from './view-tech-form.component';

describe('ViewTechFormComponent', () => {
  let component: ViewTechFormComponent;
  let fixture: ComponentFixture<ViewTechFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewTechFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewTechFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
