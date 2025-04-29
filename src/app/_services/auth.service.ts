import { Injectable } from '@angular/core';
import { Autorizacao, User } from '../_models/User';

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
    sessionStorage.setItem('usuario', user.usuario);
    sessionStorage.setItem('tipoUsuario', user.tipoUsuario);
    sessionStorage.setItem('nome', user.nome);
    sessionStorage.setItem('autorizacoes', JSON.stringify(user.autorizacoes));
    sessionStorage.setItem('id', user.id!)
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
  getNomeUsuario(): string | null {
    return sessionStorage.getItem('usuario');
  }

  getNome() : string | null{
    return sessionStorage.getItem('nome');
  }

  getUsuario(): User | null{

    const autorizacoesString = sessionStorage.getItem('autorizacoes');
    const autorizacoes: Autorizacao[] = autorizacoesString ? JSON.parse(autorizacoesString) : [];

    const usuario: User = {
      id: sessionStorage.getItem('id')!,
      nome: sessionStorage.getItem('nome')!,
      usuario: sessionStorage.getItem('usuario')!,
      tipoUsuario: sessionStorage.getItem('tipoUsuario')!,
      senha: '',
      email: '',
      autorizacoes: autorizacoes,
      status: true
    };

    return usuario;
  }
}
