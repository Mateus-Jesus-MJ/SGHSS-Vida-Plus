import { Leito } from "./leito";
import { Paciente } from "./Paciente";

export interface Internamento {
    id?: string;
    idPaciente: string;
    paciente?: Paciente
    idLeito: string;
    leito?: Leito;
    medicoSolicitante: string;
    crmMedico: string;
    status: string;
    UsuarioInclusao?: string;
    momentoInclusao?: string;
    UsuarioEdicao?: string;
    momentoEdicao?: string;
    prescricao?: precricaoInternamento[];
}

export interface precricaoInternamento {
    id?: string;
    processo: string;
    periodo: string;
    idMedico: string;
    medico?: string;
}