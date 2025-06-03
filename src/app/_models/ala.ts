import { Colaborador } from "./colaborador";
import { Hospital } from "./Hospital";

export interface Ala{
  id?: string;
  nome: string;
  idResponsavel?:string;
  responsavel?:Colaborador;
  status: boolean;
  hospitais?: Hospital[]
}
