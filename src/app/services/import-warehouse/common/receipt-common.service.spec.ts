/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ReceiptCommonService } from './receipt-common.service';

describe('Service: ReceiptCommon', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReceiptCommonService]
    });
  });

  it('should ...', inject([ReceiptCommonService], (service: ReceiptCommonService) => {
    expect(service).toBeTruthy();
  }));
});
