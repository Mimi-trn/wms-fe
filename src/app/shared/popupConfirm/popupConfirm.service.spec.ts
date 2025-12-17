/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PopupConfirmService } from './popupConfirm.service';

describe('Service: PopupConfirm', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PopupConfirmService]
    });
  });

  it('should ...', inject([PopupConfirmService], (service: PopupConfirmService) => {
    expect(service).toBeTruthy();
  }));
});
