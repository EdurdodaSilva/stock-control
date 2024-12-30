import { SignUpUserResponse } from './../../models/interfaces/User/SignUpUserResponce';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SignUpUserRequest } from 'src/app/models/interfaces/User/SignUpUserRequest';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { AuthRequest } from './auth/AuthRequest';
import { AuthResponse } from './auth/AuthResponse';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private API_URL = environment.API_URL;

  constructor(private http: HttpClient, private cookie: CookieService) { }

  signUpUser(requestData: SignUpUserRequest): Observable<SignUpUserResponse> {
    return this.http.post<SignUpUserResponse>(`${this.API_URL}/user`, requestData);
  }

  authUser(requestData: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth`, requestData);
  }

  isLoggedIn(): boolean {
    const JWT_TOKEN = this.cookie.get('token');
    return JWT_TOKEN ? true : false;
  }
}
