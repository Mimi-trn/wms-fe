import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDetailImportRequestComponent } from './view-detail-import-request.component';

describe('ViewDetailImportRequestComponent', () => {
  let component: ViewDetailImportRequestComponent;
  let fixture: ComponentFixture<ViewDetailImportRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewDetailImportRequestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewDetailImportRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
