import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {provideNativeDateAdapter} from '@angular/material/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, Observable, delay } from 'rxjs';
import { jsPDF } from 'jspdf';
import { MatSnackBar } from '@angular/material/snack-bar';
import { isAHoliday } from '@18f/us-federal-holidays';


interface Project {
  value: string;
  viewValue: string;
}

//interface for the data collected when getting the projects
interface ApiResponse {
  statusCode: number;
  body: string[]; //Should be an array of projectNames
}

//nesting doll interfaces for the data you get about a singular project
interface EmployeeRecord {
  [key: string]: number; // Represents Day1, Day2, etc. (May change to just 1, 2)
}

interface Employees {
  Employees: {
      [name: string]: EmployeeRecord; // Keyed by employee names (e.g., Bob, Joe)
  };
}

interface MonthlyData {
  [month: string]: Employees; // Keyed by month (e.g., October, November)
}

interface YearlyData {
  [year: string]: MonthlyData; // Keyed by year (e.g., 2024)
}

//Api response for when you are sending a projectName to the backend and getting that projects info
interface ApiResponse2 {
  statusCode: number; // The status code of the response
  body: YearlyData;   // The main data body
}


@Component({
  selector: 'app-form',
  providers: [provideNativeDateAdapter()],
  templateUrl: './tablePage.component.html',
  styleUrl: './tablePage.component.css'
})


export class tablePageComponent {
  
  private apiUrl2 = "https://rahwhq94d7.execute-api.us-east-2.amazonaws.com/dev/Project";  // api endpoint (change to yours)
  private apiUrl3 = "https://rahwhq94d7.execute-api.us-east-2.amazonaws.com/dev/ProjectUpdate";  // api endpoint (change to yours)

  projects: any[] = [];
  employeeData: YearlyData = {};
  month: string = "";
  year = 0;
  employee: String = "";
  isEditing: boolean = false;

  private originalEmployeeData: YearlyData = {};///
  
  constructor(private http: HttpClient, private router: Router, private snackBar: MatSnackBar) {}
  
  //Stuff to do when page pulled up
  ngOnInit() {
    this.changeHeaderText("Monthly Timesheet"); 
    this.generateDefaultTable();
    this.getProjects();
  }

  //function that gets all the projectNames via the get lambda function
  getProjects(){
    this.http.get<ApiResponse>(this.apiUrl2).subscribe(
      response => {
          console.log(response); //Note many console logs are for test purposes and can be removed 
          //but won't until project is complete and are marked by a //test
          const projectNames = response.body; //Gets just the array of projectNames and ignores the status code
          this.projects = projectNames; // puts the array into a premade global array for further use
          console.log(this.projects); //test
          this.fillProjects(); 
      },
      error => {
          console.error("Error fetching data:", error);
      }
    );
  }

  //Function for filling the project select dropdown with the projectNames
  fillProjects() {
    const selectElement = document.getElementById("projectSelect") as HTMLSelectElement; //getting the select dropdown
    this.projects.forEach((project) => { //for loop for making an option for each projectName
      const newOption = document.createElement("option");
      newOption.value = project;
      newOption.text = project;
      selectElement.add(newOption);
    });
  }

  //Function to change the header to match the current page
  changeHeaderText(newText: string) {
    const headerElement = document.getElementById("primeHeader"); //getting the header
    if (headerElement) {
      headerElement.textContent = newText; //setting the header to the new text
    } else {
      console.error("Element with ID 'primeHeader' not found.");
    }
  }

  //Function to go back to the login page
  signIn() {
    this.router.navigate(['/login']);
  }

  //Function to generate a Default table (Also acts as a template for later use when making the real table)
  generateDefaultTable() {
  //get the current month and year
  const year: number = new Date().getFullYear();
  const month: number = new Date().getMonth();
  //get the number of days for the month and figure out which are weekdays
  const numDays: number = new Date(year, month, 0).getDate();
  const isWeekday = (date: Date) => date.getDay()
  const weekdays: number[] = [];
  for (let g = 1; g <= numDays; g++) {
    const currentDate = new Date(year, month, g);
    if (isWeekday(currentDate) != 0 && isWeekday(currentDate) != 6 && !isAHoliday(currentDate)){
      weekdays.push(g);
    }
  }
  const tbl: HTMLElement | null = document.getElementById("timeTable");
  if (!tbl) return;
  // Select the current tbody
  const oldTbody = tbl.querySelector('tbody');
    
  // Remove the current tbody
  if (oldTbody) {
    tbl.removeChild(oldTbody);
  }

  const projectDateText = document.getElementById("projectDate") as HTMLSelectElement;
  projectDateText.textContent = "Month and Year";
  const tblBody: HTMLTableSectionElement = document.createElement("tbody");
  
  // creating all cells
  for (let i = 0; i <= 1; i++) {
    // creates a table row
    const row: HTMLTableRowElement = document.createElement("tr");
    for (let j = 0; j <= weekdays.length + 1; j++) {
      // creates the table cell and fills it based on position
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

  //function that starts when the project select is changed.
  //Sends the selected project (via projectName) to the backend and gets that projects info
  changeProject() {
    console.log("Project Changed"); //test
    this.generateDefaultTable();
    //Gets the selected project's name
    const currentElement = document.getElementById("projectSelect") as HTMLSelectElement;
    const ProjectName = currentElement.options[currentElement.selectedIndex].text;
    console.log(ProjectName); //test
    //Makes the package that we are sending to the backend
    const body = {
      ProjectName: ProjectName
    };
    this.http.post<ApiResponse2>(this.apiUrl2, body).pipe( //post method to send the data
      map(response => {
        console.log('API Response:', response); //test
        this.employeeData = response.body; //Puts the collected data into a global variable for later
        this.originalEmployeeData = JSON.parse(JSON.stringify(response.body)); // Deep copy to preserve original data
        console.log(this.employeeData); //test
        this.fillDate();
        //return response; // Return the response for further use if needed
      })
    ).subscribe({
      next: (response) => {
        // Handle successful response here
        console.log('Successfully sent:', response);
      },
      error: (error) => {
        // Handle error here
        console.error('Error occurred:', error);
      }
    });
  }

  //Function that takes the project's info and makes it into date options for the other select
  fillDate(){
    console.log("fillDate called"); //test
    const selectElement = document.getElementById("monthSelect") as HTMLSelectElement; //getting the select
    
    // Clear previous options before populating
    selectElement.innerHTML = '';

    // Create and add a default option
    const defaultOption = document.createElement("option");
    defaultOption.value = ""; 
    defaultOption.disabled = true; 
    defaultOption.selected = true; 
    defaultOption.text = "Select the Month"; 
    selectElement.add(defaultOption); 

    //nested for loops to get the year and date from employeeData and make options from it
    for (const year in this.employeeData) {
      console.log(year); //test
      for (const month in this.employeeData[year]) {
        console.log(month); //test
        const newOption = document.createElement("option");
        newOption.value = month + " " + year;
        newOption.text = month + " " + year;
        selectElement.add(newOption);
      }
    }
  }

  //Function that occurs in the select dropdown is changed
  //Currently just changes the projectDate header to the selected date
  changeDate() {
    console.log("Date Changed"); //test
    //Gets the selected date
    const currentElement = document.getElementById("monthSelect") as HTMLSelectElement;
    const str = currentElement.options[currentElement.selectedIndex].text;
    //Sets the header to the selected date in the right format
    if (str != null) {
      const parts = str.split(" "); 
      this.month = parts[0]; 
      this.year = parseInt(parts[1]);
      const projectDateText = document.getElementById("projectDate") as HTMLSelectElement;
      projectDateText.textContent = this.month + " " + this.year;
      this.createTrueTable();
    } else {
      console.log("No date select option found.")
    }
  }

  createTrueTable() {
    const months: string[] = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthInt = months.indexOf(this.month);
    const numDays: number = new Date(this.year, monthInt + 1, 0).getDate();
    const isWeekday = (date: Date) => date.getDay();
    const weekdays: number[] = [];

    for (let g = 1; g <= numDays; g++) {
      const currentDate = new Date(this.year, monthInt, g);
      if (isWeekday(currentDate) != 0 && isWeekday(currentDate) != 6 && !isAHoliday(currentDate)) {
        weekdays.push(g);
      }
    }

    const tbl: HTMLElement | null = document.getElementById("timeTable");
    if (!tbl) return;

    // Select the current tbody
    const oldTbody = tbl.querySelector('tbody');
    // Remove the current tbody
    if (oldTbody) {
      tbl.removeChild(oldTbody);
    }

    const names = Object.keys(this.employeeData[this.year][this.month]["Employees"]);

    const tblBody: HTMLTableSectionElement = document.createElement("tbody");
    let grandCount = 0;

    // creating all cells
    for (let i = 0; i <= names.length + 1; i++) {
      const row: HTMLTableRowElement = document.createElement("tr");
      for (let j = 0; j <= weekdays.length + 1; j++) {
        const cell: HTMLTableCellElement = document.createElement("td");
        let cellContent;
        cell.style.border = "1px solid black";
        cell.style.background = "white";
        cell.style.color = "black";
        cell.style.textOverflow = "ellipsis";
        cell.style.overflow = "hidden";
        cell.style.whiteSpace = "normal";

        if (i === 0) { // Header row
          cell.style.background = "black";
          cell.style.color = "white";
          if (j === 0) {
            cellContent = document.createTextNode(`Names`);
          } else if (j <= weekdays.length) {
            cellContent = document.createTextNode(`${weekdays[j - 1]}`);
          } else {
            cellContent = document.createTextNode(`Total`);
          }
        } else if (i !== (names.length + 1)) { // Employee rows
          if (j === 0) {
              cellContent = document.createTextNode(`${names[i - 1]}`);
          } else if (j <= weekdays.length) {
            const dayKey = weekdays[j - 1].toString();
            const hoursWorked = this.employeeData[this.year][this.month]["Employees"][names[i - 1]][dayKey] || 0;
            if (this.isEditing) {
              // Create input element if in edit mode
              const input = document.createElement("input");
              input.type = "number";
              input.value = hoursWorked.toString();
              input.style.width = "50px"; 
              input.style.padding = "2px";
              input.style.fontSize = "14px";
              input.min = "0";
              input.onchange = () => {
                // Update the employee data on change
                this.employeeData[this.year][this.month]["Employees"][names[i - 1]][dayKey] = Number(input.value);
              };
              cell.appendChild(input);
            } else {
              // Display hours worked as text
              cellContent = document.createTextNode(hoursWorked.toString());
            }
          } else { // Total for the employee
            const totalHours = Object.values(this.employeeData[this.year][this.month]["Employees"][names[i - 1]]).reduce((a, b) => a + (b || 0), 0);
            if (this.isEditing) {
              cellContent = document.createTextNode(`--`); // Placeholder during editing
            } else {
              cellContent = document.createTextNode(totalHours.toString());
            }
            grandCount += totalHours;
          }
        } else { // Grand total row
          if (j === 0) {
            cellContent = document.createTextNode(`Grand Total`);
          } else if (j <= weekdays.length) {
            cellContent = document.createTextNode(` `);
          } else {
            cellContent = document.createTextNode(`${grandCount}`);
          }
        }
        if (cellContent) {
          cell.appendChild(cellContent);
        }
        row.appendChild(cell);
      }
      tblBody.appendChild(row);
    }
    tbl.appendChild(tblBody);
  }
  //Functions for the buttons (currently just made to check that thte buttons work)
  export() {
    console.log("Export Button working"); //test
    const content = document.getElementById("page");
    const box = document.getElementById("box");
    if (content && box) {
      content.classList.add('pdf-export');
      box.classList.remove('box');
      const pdf = new jsPDF('l', 'mm', [500, 297]);
      // Use the html method to convert the HTML to PDF
      pdf.html(content, {
        callback: function (doc) {
          doc.save('exported-file.pdf');
          content.classList.remove('pdf-export');
          box.classList.add('box');
        },
        x: 10, 
        y: 10,
        width: 480, 
        windowWidth: 500
      });
    }
  }

  edit() {
    this.isEditing = !this.isEditing;
    this.createTrueTable();
  }

  // Method to update the original timesheet data with the edited values
  private updateTimesheetData(newData: YearlyData): YearlyData {
    const updatedData = JSON.parse(JSON.stringify(this.originalEmployeeData)); 
    for (const year in newData) {
      for (const month in newData[year]) {
        for (const employee in newData[year][month].Employees) {
          if (!updatedData[year]) {
            updatedData[year] = { [month]: { Employees: {} } };
          }
          if (!updatedData[year][month]) {
            updatedData[year][month] = { Employees: {} };
          }
          updatedData[year][month].Employees[employee] = { ...updatedData[year][month].Employees[employee], ...newData[year][month].Employees[employee] };
        }
      }
    }
    return updatedData;
  }


  save() {
    console.log("save Button working"); //test
    if (this.isEditing){
      this.edit();
    }

    const updatedEmployeeData = this.updateTimesheetData(this.employeeData);

    const body = {
      ProjectName: this.getSelectedProjectName(), // Get the currently selected project name
      TimesheetData: updatedEmployeeData // Use the updated data here
    };
    
    console.log(body);

    this.http.post<ApiResponse>(this.apiUrl3, body).subscribe({
      next: (response) => {
        console.log('Data successfully saved:', response);
        this.openSnackBar('Data successfully saved.', 'Close');
      },
      error: (error) => {
        console.error('Error occurred while saving data:', error);
        this.openSnackBar('Something went wrong please try again.', 'Close');
      }
    });
  }

  private getSelectedProjectName(): string {
    const currentElement = document.getElementById("projectSelect") as HTMLSelectElement;
    return currentElement.options[currentElement.selectedIndex].text;
  }

  private openSnackBar(message: string, action: string) { // this displays the error message that pops up when invalid username/password
    this.snackBar.open(message, action, {
      duration: 3000,
    });
  }
}