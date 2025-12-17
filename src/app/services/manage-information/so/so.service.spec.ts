import { TestBed } from '@angular/core/testing';

import { SoService } from './so.service';

describe('SoService', () => {
  let service: SoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
