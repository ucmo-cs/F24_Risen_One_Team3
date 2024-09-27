import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'], 
})
export class LoginComponent {
  username: string = ''; // Initialize with an empty string
  password: string = ''; // Initialize with an empty string

  constructor(private authService: AuthService, private router: Router, private snackBar: MatSnackBar) {}

  login() {
    this.authService.login(this.username, this.password).subscribe({
      next: (success) => {
        if (success) {
          // Navigate to home component if login is successful
          this.router.navigate(['/home']);
        } else {
          // Handle login failure
          this.openSnackBar('Login failed. Please try again.', 'Close'); // displays pop up 
          console.error('Login failed');
        }
      },
      error: (error) => {
        // Handle login error
        this.openSnackBar('An error occurred. Please try again.', 'Close');
        console.error('Login error:', error);
      },
    });
  }
  

  private openSnackBar(message: string, action: string) { // this displays the error message that pops up when invalid username/password
    this.snackBar.open(message, action, {
      duration: 3000,
    });
  }
}