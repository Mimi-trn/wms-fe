import { TestBed } from '@angular/core/testing';

import { RequestIqcService } from './request-iqc.service';

describe('RequestIqcService', () => {
  let service: RequestIqcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequestIqcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
