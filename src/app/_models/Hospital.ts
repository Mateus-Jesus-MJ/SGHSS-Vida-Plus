import { Ala } from "./ala";
import { Colaborador } from "./colaborador";
import { Endereco } from "./endereco";

export interface Hospital{
  id?:string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  idDiretor?: string;
  diretor?: Colaborador;
  endereco: Endereco;
  email?: string;
  telefone1?: string;
  telefone2?: string;
  imagem?: string;
  alas?: Ala[];
}
