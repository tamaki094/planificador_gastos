import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable , catchError, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiTiendaItalika {

  private http = inject(HttpClient);
  private apiUrl = environment.tiendaItalika.apiUrl;


  constructor() {
    console.log('API Tienda Italika URL:', this.apiUrl);
  }

  login(credentials: any) : Observable<any> {
    const url = `${this.apiUrl}/auth/login`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('Login URL:', url);
    console.log('Login Credentials:', credentials);

    return this.http.post(url,credentials, { headers})
     .pipe(
      catchError((error) => {
        console.error('Login error:', error);
        return throwError(() => new Error('Login failed. Please check your credentials and try again.'));
      })
     );
  }


}
