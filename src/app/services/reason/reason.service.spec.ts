/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ReasonService } from './reason.service';

describe('Service: Reason', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReasonService]
    });
  });

  it('should ...', inject([ReasonService], (service: ReasonService) => {
    expect(service).toBeTruthy();
  }));
});
