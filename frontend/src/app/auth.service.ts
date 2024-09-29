import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = "";  // api endpoint (change to yours)
  
  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<boolean> {
    const body = {
        body: JSON.stringify({ username, password })
    };

    return this.http.post<{ statusCode: number, body: string }>(this.apiUrl, body).pipe(
        map(response => {
            console.log('API Response:', JSON.stringify(response)); // print response for testing api

            const parsedBody = JSON.parse(response.body); //converts input to json format
            if (parsedBody.message === 'Login successful') { // checks message sent from lamba against requirment
                return true;
            } else {
                throw new Error('Login failed');  // Not correct username/pass, throws error
            }
        }),
        catchError(error => {  // catches error thrown from above
            console.error('Login error:', error);  // testing statement
            return new Observable<boolean>(observer => {
                observer.next(false); // sets to false
                observer.complete();
            });
        })
    );
}

  logout() {
    localStorage.removeItem('token'); // Remove any token or user data
    this.router.navigate(['/login']); // 
  }
}