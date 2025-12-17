/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { VenderListComponent } from './vender-list.component';

describe('VenderListComponent', () => {
    let component: VenderListComponent;
    let fixture: ComponentFixture<VenderListComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [VenderListComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(VenderListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
