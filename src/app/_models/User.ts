export interface User {
  id?: string;
  nome: string;
  usuario: string;
  email: string;
  senha: string;
  tipoUsuario: string;
  cargo?: string;
  autorizacoes?: Autorizacao[];
}

export interface Autorizacao {
  user?: User;
  userId?: string;
  funcionalidade: string;
  acesso: string;
}
