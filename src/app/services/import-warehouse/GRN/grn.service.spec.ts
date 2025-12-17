/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { GrnService } from './grn.service';

describe('Service: Grn', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GrnService]
    });
  });

  it('should ...', inject([GrnService], (service: GrnService) => {
    expect(service).toBeTruthy();
  }));
});
