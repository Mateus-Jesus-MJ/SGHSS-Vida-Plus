import { Hospital } from "./Hospital";

export interface Ala{
  id?: string;
  nome: string;
  idResponsavel?:string;
  responsavel?:string;
  status: boolean;
  hospitais: Hospital[]
}
