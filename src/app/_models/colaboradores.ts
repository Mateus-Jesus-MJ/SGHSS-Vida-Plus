import { Cargo} from "./cargo";
import { contato } from "./contato";
import { Endereco } from "./endereco";
import { User } from "./User";

export interface Colaboradores {
  id?: string;
  nome: string;
  dataNascimento: string;
  cpf: string;
  identidade: string;
  endereco: Endereco;
  contato: contato;
  cargo: Cargo;
  usuarioId?: string;
  usuario?: User
}
