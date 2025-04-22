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

  buscaLogin(login: Login){
    return this.http.get<User>(`${this.api}users?usuario=${login.usuario}&senha=${login.senha}&tipoUsuario=${login.tipoUsuario}`).pipe(
      catchError(this.ServiceError),
      map((response) => {
        return response
      })
    )
  }
}
