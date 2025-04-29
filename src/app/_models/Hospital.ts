import { Endereco } from "./endereco";

export interface Hospital{
  id?:string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  //alterar para colaborador
  diretor?: string;
  endereco: Endereco,
  email?: string,
  telefone1?: string,
  telefone2?: string
  imagem?: string
}
