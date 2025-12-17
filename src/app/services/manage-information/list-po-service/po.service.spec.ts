/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PoService } from './po.service';

describe('Service: Po', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PoService]
    });
  });

  it('should ...', inject([PoService], (service: PoService) => {
    expect(service).toBeTruthy();
  }));
});
