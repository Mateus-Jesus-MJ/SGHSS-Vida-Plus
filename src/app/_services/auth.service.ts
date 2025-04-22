import { Injectable } from '@angular/core';
import { User } from '../_models/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  // Armazenar o usuário autenticado em sessionStorage
  authenticate(user: User): void {
    sessionStorage.setItem('usuario', user.usuario);
    sessionStorage.setItem('nome', user.nome);
    sessionStorage.setItem('tipoUsuario', user.tipoUsuario);
  }

  // Limpar os dados do usuário (logout)
  clear(): void {
    sessionStorage.removeItem('usuario');
    sessionStorage.removeItem('nome');
    sessionStorage.removeItem('tipoUsuario');
  }

  // Verificar se o usuário está autenticado
  isAuthenticated(): boolean {
    return Boolean(sessionStorage.getItem('usuario') && sessionStorage.getItem('nome'));
  }

  // Obter o usuário armazenado no sessionStorage
  getUser(): User | null {
    const usuario = sessionStorage.getItem('usuario');
    const nome = sessionStorage.getItem('nome');
    const tipoUsuario = sessionStorage.getItem('tipoUsuario');

    if (usuario && nome && tipoUsuario) {
      return { usuario, nome, tipoUsuario } as User;
    }
    return null;
  }
}
