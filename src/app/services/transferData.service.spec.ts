/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TransferDataService } from './transferData.service';

describe('Service: TransferData', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TransferDataService],
    });
  });

  it('should ...', inject(
    [TransferDataService],
    (service: TransferDataService) => {
      expect(service).toBeTruthy();
    }
  ));
});
