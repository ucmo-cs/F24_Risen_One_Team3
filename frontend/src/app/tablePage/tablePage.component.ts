import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {provideNativeDateAdapter} from '@angular/material/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, Observable } from 'rxjs';



interface previousRequest {
  value: string;
  viewValue: string;
}


@Component({
  selector: 'app-form',
  providers: [provideNativeDateAdapter()],
  templateUrl: './tablePage.component.html',
  styleUrl: './tablePage.component.css'
})


export class tablePageComponent {
  private apiUrl = "https://rahwhq94d7.execute-api.us-east-2.amazonaws.com/dev/login";  // api endpoint (change to yours)
  
  constructor(private http: HttpClient, private router: Router) {}
  ngOnInit() {
    this.changeHeaderText("Monthly Timesheet");
    this.generateDefaultTable();
    this.fillDropDowns();
  }
  fillDropDowns(){
    /*
    private apiUrl = "https://rahwhq94d7.execute-api.us-east-2.amazonaws.com/dev/Project";  // api endpoint (change to yours)
    constructor(private http: HttpClient, private router: Router) {}
    */

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
  }
  changeDate() {
    console.log("Date Changed");
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