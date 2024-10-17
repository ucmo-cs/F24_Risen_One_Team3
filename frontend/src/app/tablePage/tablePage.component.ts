import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {provideNativeDateAdapter} from '@angular/material/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, Observable } from 'rxjs';


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
  projects: any[] = [];
  employeeData: YearlyData = {};
  
  constructor(private http: HttpClient, private router: Router) {}
  
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
      const month = parts[0]; 
      const year = parseInt(parts[1]);
      const projectDateText = document.getElementById("projectDate") as HTMLSelectElement;
      projectDateText.textContent = month + " " + year;
    } else {
      console.log("No date select option found.")
    }
  }

  //Functions for the buttons (currently just made to check that thte buttons work)
  export() {
    console.log("Export Button working"); //test
  }
  edit() {
    console.log("Edit Button working"); //test
  }
  save() {
    console.log("save Button working"); //test
  }
}