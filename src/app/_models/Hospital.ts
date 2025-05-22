import { Colaborador } from "./colaborador";
import { Endereco } from "./endereco";

export interface Hospital{
  id?:string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  //alterar para colaborador
  idDiretor?: string;
  diretor?: Colaborador;
  endereco: Endereco,
  email?: string,
  telefone1?: string,
  telefone2?: string
  imagem?: string
}
