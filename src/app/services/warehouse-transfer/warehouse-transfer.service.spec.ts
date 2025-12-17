import { TestBed } from '@angular/core/testing';

import { WarehouseTransferService } from './warehouse-transfer.service';

describe('WarehouseTransferService', () => {
  let service: WarehouseTransferService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WarehouseTransferService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
