import { Colaborador } from "./colaborador";
import { Hospital } from "./Hospital";
import { Paciente } from "./Paciente";

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
}

export interface medicamentosReceita{
    id?:string;
    medicamento: string;
    quantidade: string;
    periodo: string;
}
