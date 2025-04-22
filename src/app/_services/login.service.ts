import { inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { User } from '../_models/User';
import { Login } from '../_models/Login';
import { map, Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService extends BaseService {
  private api = environment.apiPrincipal;
  private httpClient = inject(HttpClient);
  private authService = inject(AuthService)

  login(login: Login): Observable<User | null> {
    return this.httpClient
      .get<User[]>(`${this.api}users?usuario=${login.usuario}&senha=${login.senha}&tipoUsuario=${login.tipoUsuario}`)
      .pipe(
        map((users: User[]) => users.length > 0 ? users[0] : null),
        tap((user) => {
          if (user) {
            // Armazenar os dados no sessionStorage
            sessionStorage.setItem("usuario", user.usuario);
            sessionStorage.setItem("nome", user.nome);
            sessionStorage.setItem("tipoUsuario", user.tipoUsuario);
          }
        })
      );
  }
}
