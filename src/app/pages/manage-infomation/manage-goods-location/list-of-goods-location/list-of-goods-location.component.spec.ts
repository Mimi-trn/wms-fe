import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOfGoodsLocationComponent } from './list-of-goods-location.component';

describe('ListOfGoodsLocationComponent', () => {
  let component: ListOfGoodsLocationComponent;
  let fixture: ComponentFixture<ListOfGoodsLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListOfGoodsLocationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListOfGoodsLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
