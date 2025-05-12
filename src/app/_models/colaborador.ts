import { Cargo} from "./cargo";
import { Contato } from "./contato";
import { Endereco } from "./endereco";
import { User } from "./User";

export interface Colaborador {
  id?: string;
  imagem?: string
  nome: string;
  dataNascimento: string;
  cpf: string;
  identidade?: string;
  endereco: Endereco;
  contato: Contato;
  cargoId: string;
  cargo?: Cargo;
  salario: string;
  usuarioId?: string;
  usuario?: User,
}
