import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ResourceUtils } from '@smile-cdr/fhirts';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let resourceUtils: ResourceUtils;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [ResourceUtils],
    }).compileComponents();
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    resourceUtils = TestBed.inject(ResourceUtils);
  });

  it('fhirtsWay() should generate table data', () => {
    // setup
    
    const inputPatient = {
      resourceType: 'Patient',
      identifier: []
    } as fhir4.Patient;
    const inputData = {
      resourceType: 'Bundle',
      type: 'searchset',
      entry: [
        {
          resource: inputPatient,
        },
      ],
    } as fhir4.Bundle;
    spyOn(resourceUtils, 'getIdentifiersByProperty').withArgs(inputPatient.identifier!, "system", component.SSN_IDENTIFIER_URL).and.returnValue([{
      value: "12346",
      system:  component.SSN_IDENTIFIER_URL
    }]);
    spyOn(resourceUtils, 'getValuesAtResourcePath').withArgs(inputPatient, 'Patient.name.given').and.returnValue(["John"]);
    spyOn(resourceUtils, 'getExtensionsByUrl')
      .withArgs(inputPatient.extension!, component.BIRTHPLACE_EXTENSION_URL)
      .and.returnValue([
        {
          url: 'some-url',
          valueAddress: {
            city: 'Chicago'
          },
        },
      ]);
    // execute
    component.fhirtsWay(inputData);
    // validate
    expect(resourceUtils.getIdentifiersByProperty).toHaveBeenCalledTimes(1);
    expect(component.fhirtsWayData.length).toBe(1);
    expect(component.fhirtsWayData[0].birthPlace).toEqual("Chicago");
    expect(component.fhirtsWayData[0].ssn).toEqual("12346");
    expect(component.fhirtsWayData[0].givenName).toEqual("John");
    
  });
});
