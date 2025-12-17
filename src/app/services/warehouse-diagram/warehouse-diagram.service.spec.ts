import { TestBed } from '@angular/core/testing';

import { WarehouseDiagramService } from './warehouse-diagram.service';

describe('WarehouseDiagramService', () => {
  let service: WarehouseDiagramService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WarehouseDiagramService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
