import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {provideNativeDateAdapter} from '@angular/material/core';



interface previousRequest {
  value: string;
  viewValue: string;
}


@Component({
  selector: 'app-form',
  providers: [provideNativeDateAdapter()],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})


export class HomeComponent {
  constructor (private router: Router ) {}
  /* Sign In navigation Function */
  ngOnInit() {
    this.changeHeaderText("Risen One Consulting Employee Portal");
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
  //Test
}