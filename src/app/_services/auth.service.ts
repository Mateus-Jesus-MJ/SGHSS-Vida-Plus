import { Injectable } from '@angular/core';
import { User } from '../_models/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() {}


  isAuthenticated(): boolean {
    const nome = sessionStorage.getItem('nome');
    const usuario = sessionStorage.getItem('usuario');
    const tipoUsuario = sessionStorage.getItem('tipoUsuario');
    return !!nome && !!tipoUsuario && !!usuario;
  }

  // Armazena os dados no login
  login(user: User): void {
    sessionStorage.setItem('usuario',user.usuario);
    sessionStorage.setItem('tipoUsuario', user.tipoUsuario);
    sessionStorage.setItem('nome', user.nome);
  }

  // Faz logout
  logout(): void {
    sessionStorage.clear();
  }

  // Retorna o tipo do usuário
  getTipoUsuario(): string | null {
    return sessionStorage.getItem('tipoUsuario');
  }

  // Retorna o nome de usuário
  getUsuario(): string | null {
    return sessionStorage.getItem('usuario');
  }

  getNome() : string | null{
    return sessionStorage.getItem('nome');
  }
}
