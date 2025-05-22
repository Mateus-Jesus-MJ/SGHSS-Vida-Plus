import { Colaborador } from "./colaborador";
import { Hospital } from "./Hospital";

export interface Turno{
  id?: string;
  idColaborador: string;
  colaborador?: Colaborador;
  idHospital: string;
  hospital?: Hospital;
  data: string;
  horarioInicio: string;
  horarioInicioIntervalo: string;
  horarioTerminoIntervalo: string;
  horarioTermino: string;
  numeroAtendimento: string;
}
