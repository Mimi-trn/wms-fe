import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoChangeLogComponent } from './info-change-log.component';

describe('InfoChangeLogComponent', () => {
  let component: InfoChangeLogComponent;
  let fixture: ComponentFixture<InfoChangeLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfoChangeLogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoChangeLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
