/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PoCommonService } from './po-common.service';

describe('Service: PoCommon', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PoCommonService]
    });
  });

  it('should ...', inject([PoCommonService], (service: PoCommonService) => {
    expect(service).toBeTruthy();
  }));
});
