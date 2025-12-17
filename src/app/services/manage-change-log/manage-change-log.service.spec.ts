import { TestBed } from '@angular/core/testing';

import { ManageChangeLogService } from './manage-change-log.service';

describe('ManageChangeLogService', () => {
  let service: ManageChangeLogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageChangeLogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
