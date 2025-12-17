import { TestBed } from '@angular/core/testing';

import { TechFormService } from './tech-form.service';

describe('TechFormService', () => {
  let service: TechFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TechFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
