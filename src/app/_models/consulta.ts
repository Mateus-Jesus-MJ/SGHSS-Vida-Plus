import { Colaborador } from "./colaborador";
import { Hospital } from "./Hospital";
import { Paciente } from "./Paciente";
import { Procedimento } from "./procedimento";

export interface Consulta {
  id?: string;
  data: string;
  hora: string;
  link?: string;
  idPaciente: string;
  paciente?: Paciente;
  idMedico: string;
  medico?: Colaborador;
  idHospital: string;
  hospital?: Hospital
  status: string;
  receita?: medicamentosReceita[];
  solicitacoes?: SolicitacaoProcedimento[];
  diagnostico?: string;
}

export interface medicamentosReceita {
  id?: string;
  medicamento: string;
  quantidade: string;
  periodo: string;
}

export interface SolicitacaoProcedimento {
  id?: string;
  procedimento: Partial<Procedimento>;
}
