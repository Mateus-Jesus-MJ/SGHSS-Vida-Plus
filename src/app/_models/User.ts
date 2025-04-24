export interface User {
  id?: string;
  nome: string;
  usuario: string;
  email: string;
  senha: string;
  tipoUsuario: string;
  cargo?: string;
}
