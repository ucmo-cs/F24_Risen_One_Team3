import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {provideNativeDateAdapter} from '@angular/material/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, Observable } from 'rxjs';


interface Project {
  value: string;
  viewValue: string;
}

interface ApiResponse {
  statusCode: number;
  body: string[]; // Assuming body is an array of strings
}


@Component({
  selector: 'app-form',
  providers: [provideNativeDateAdapter()],
  templateUrl: './tablePage.component.html',
  styleUrl: './tablePage.component.css'
})


export class tablePageComponent {
  
  private apiUrl2 = "https://rahwhq94d7.execute-api.us-east-2.amazonaws.com/dev/Project";  // api endpoint (change to yours)
  projects: any[] = [];
  
  constructor(private http: HttpClient, private router: Router) {}
  ngOnInit() {
    this.changeHeaderText("Monthly Timesheet");
    this.generateDefaultTable();
    this.fillDropDowns();
  }
  fillDropDowns(){
    this.http.get<ApiResponse>(this.apiUrl2).subscribe(
      response => {
          console.log(response);
          const projectNames = response.body; // Adjust based on actual structure
          
          // Assuming you have a property to store dropdown options
          this.projects = projectNames; 
          console.log(this.projects);
          this.populateSelect();
      },
      error => {
          console.error("Error fetching data:", error);
      }
    );
  }
  populateSelect() {
    const selectElement = document.getElementById("projectSelect") as HTMLSelectElement; // Type assertion
    this.projects.forEach((project) => {
      const newOption = document.createElement("option");
      newOption.value = project;
      newOption.text = project;
      selectElement.add(newOption);
    });
  }
  changeHeaderText(newText: string) {
    const headerElement = document.getElementById("primeHeader");
    if (headerElement) {
      headerElement.textContent = newText;
    } else {
      console.error("Element with ID 'primeHeader' not found.");
    }
  }
  signIn() {
    this.router.navigate(['/login']);
  }
  //Function to generate a Default table
  generateDefaultTable() {
  //get the current month and year
  const year: number = new Date().getFullYear();
  const month: number = new Date().getMonth();
  //get the number of days for the month and figure out which are weekdays
  const numDays: number = new Date(year, month, 0).getDate();
  const isWeekday = (date: Date) => date.getDay()
  const weekdays: number[] = [];
  for (let g = 1; g <= numDays; g++) {
    if (isWeekday(new Date(year, month, g)) != 0 && isWeekday(new Date(year, month, g)) != 6){
      weekdays.push(g);
    }
  }
  const tbl: HTMLElement | null = document.getElementById("timeTable");
  if (!tbl) return;
  const tblBody: HTMLTableSectionElement = document.createElement("tbody");
  
  // creating all cells
  for (let i = 0; i <= 1; i++) {
    // creates a table row
    const row: HTMLTableRowElement = document.createElement("tr");
    for (let j = 0; j <= weekdays.length + 1; j++) {
      // Create a <td> element and a text node, make the text
      // node the contents of the <td>, and put the <td> at
      // the end of the table row
      const cell: HTMLTableCellElement = document.createElement("td");
      let cellText;
      if (i === 0) {
        if (j === 0) {
          cellText = document.createTextNode(`Names`);
        } else if (j <= weekdays.length) {
          cellText = document.createTextNode(`${weekdays[j - 1]}`);
        } else {
          cellText = document.createTextNode(`Total`);
        }
      } else {
        if (j === 0) {
          cellText = document.createTextNode(`Grand Total`);
        } else if (j <= weekdays.length) {
          cellText = document.createTextNode(`  `);
        } else {
          cellText = document.createTextNode(`  `);
        }
      }
      //const cellText = document.createTextNode(`cell in row ${i}, column ${j}`);
      if (cellText) {
          cell.appendChild(cellText);
      }
      row.appendChild(cell);
    }
  
    // add the row to the end of the table body
    tblBody.appendChild(row);
  }
  
  // put the <tbody> in the <table>
  tbl.appendChild(tblBody);
  }
  changeProject() {
    console.log("Project Changed");
    const currentElement = document.getElementById("projectSelect") as HTMLSelectElement;
    const currentValue = currentElement.value;
    const currentText = currentElement.options[currentElement.selectedIndex].text;
    console.log(currentText);
    console.log(currentValue);
  }
  changeDate() {
    console.log("Date Changed");
    const currentElement = document.getElementById("monthSelect") as HTMLSelectElement;
    const str = currentElement.options[currentElement.selectedIndex].text;
    if (str != null) {
      const parts = str.split(" "); // Split the string by space
      const month = parts[0]; // First part is the month
      const year = parseInt(parts[1]);
      const projectDateText = document.getElementById("projectDate") as HTMLSelectElement;
      projectDateText.textContent = month + " " + year;
    } else {
      console.log("No date sselect option found.")
    }
  }
  export() {
    console.log("Export Button working");
  }
  edit() {
    console.log("Edit Button working");
  }
  save() {
    console.log("save Button working");
  }
}