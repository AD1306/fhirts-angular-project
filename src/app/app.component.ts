import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import * as patientData from '../assets/data.json';
import { ResourceUtils } from '@smile-cdr/fhirts';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';
import { MatGridListModule } from '@angular/material/grid-list';

export interface PatientTable {
  ssn: string;
  birthPlace: string;
  givenName: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  // providers: [ResourceUtils],
  imports: [RouterOutlet, MatToolbarModule, MatTableModule, MatGridListModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'fhirts-angular-project';
  readonly SSN_IDENTIFIER_URL = 'http://hl7.org/fhir/sid/us-ssn';
  readonly BIRTHPLACE_EXTENSION_URL =
    'http://hl7.org/fhir/StructureDefinition/patient-birthPlace';
  traditionalWayData: PatientTable[];
  fhirtsWayData: PatientTable[];
  displayedColumns: string[] = ['ssn', 'birthPlace', 'givenName'];

  constructor(private resourceUtils: ResourceUtils) {
    this.traditionalWayData = [];
    this.fhirtsWayData = [];
  }

  ngOnInit() {
    this.traditionalWay(patientData as fhir4.Bundle);
    this.fhirtsWay(patientData as fhir4.Bundle);
  }

  traditionalWay(patientData: fhir4.Bundle) {
    for (let index = 0; index < patientData.entry!.length; index++) {
      const patientResource = patientData.entry![index].resource as fhir4.Patient;
      const ssnIdentifier = patientResource!.identifier!.filter(
        (x) => x.system === this.SSN_IDENTIFIER_URL
      );
      let givenNames: string[] = [];
      patientResource.name!.forEach((x) => {
        givenNames.push(...x.given!);
      });
      const patientBirthPlace = patientResource.extension!.filter(
        (x) => x.url === this.BIRTHPLACE_EXTENSION_URL
      );
      this.traditionalWayData.push({
        ssn: ssnIdentifier[0].value!,
        birthPlace: patientBirthPlace[0].valueAddress!.city!,
        givenName: givenNames.join(', '),
      });
    }
  }

  fhirtsWay(patientData: fhir4.Bundle) {
    for (let index = 0; index < patientData.entry!.length; index++) {
      const patientResource = patientData.entry![index].resource! as fhir4.Patient; 
      const ssnIdentifier = this.resourceUtils.getIdentifiersByProperty(
        patientResource.identifier!,
        'system',
        this.SSN_IDENTIFIER_URL
      );
      const givenNames = this.resourceUtils.getValuesAtResourcePath(
        patientResource,
        'Patient.name.given'
      );
      const patientBirthPlace = this.resourceUtils.getExtensionsByUrl(
        patientResource.extension!,
        this.BIRTHPLACE_EXTENSION_URL
      );
      this.fhirtsWayData.push({
        ssn: ssnIdentifier[0].value!,
        birthPlace: patientBirthPlace[0].valueAddress!.city,
        givenName: givenNames.join(', '),
      });
    }
  }
}
