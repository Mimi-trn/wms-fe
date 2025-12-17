import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupUploadFileComponent } from './popup-upload-file.component';

describe('PopupUploadFileComponent', () => {
  let component: PopupUploadFileComponent;
  let fixture: ComponentFixture<PopupUploadFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupUploadFileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupUploadFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
