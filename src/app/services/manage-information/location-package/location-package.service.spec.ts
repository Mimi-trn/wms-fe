/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { LocationPackageService } from './location-package.service';

describe('Service: LocationPackage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LocationPackageService]
    });
  });

  it('should ...', inject([LocationPackageService], (service: LocationPackageService) => {
    expect(service).toBeTruthy();
  }));
});
