import { Endereco } from "./endereco";

export interface Hospital{
  id?:string;
  nome: string;
  //alterar para colaborador
  diretor: string;
  endereco: Endereco
}
