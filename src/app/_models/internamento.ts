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
    quantidade: string;
    idMedico?: string;
    medico?: string;
    momentoInclusao?: string;
    ultimaRealizacao?: string;
    usuarioUltimaRealizacao?: string;
    momentoRegistro?: string;
    realizacoes? : RealizacaoPrescricao[]
}

export interface RealizacaoPrescricao{
     id?: string;
     ultimaRealizacao?: string;
     usuarioUltimaRealizacao: string;
     momentoRegistro: string;
}