import { ComponentFixture, TestBed } from '@angular/core/testing';

import { tablePageComponent } from './tablePage.component';

describe('tablePageComponent', () => {
  let component: tablePageComponent;
  let fixture: ComponentFixture<tablePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [tablePageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(tablePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
