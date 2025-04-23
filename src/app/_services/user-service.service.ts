import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Login } from '../_models/Login';
import { User } from '../_models/User';
import { BaseService } from './base.service';
import { catchError, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserServiceService extends BaseService {
  private api = environment.apiPrincipal;
  private http = inject(HttpClient);

  novouser(usuario :User){
    return this.http.post(`${this.api}/users`, usuario);
  }
}
