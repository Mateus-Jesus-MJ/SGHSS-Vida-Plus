import { Consulta } from "./consulta";
import { Internamento } from "./internamento";
import { Procedimento } from "./procedimento";
import { User } from "./User";

export interface Paciente {
     id?: string;
     nome: string;
     dataNascimento: string;
     cpf: string;
     identidade: string;
     enderecoCep: string;
     enderecoLogradouro: string;
     enderecoNumero: string;
     enderecoComplemento: string;
     enderecoBairro: string;
     enderecoUF: string;
     enderecoMunicipio: string;
     email: string;
     telefone1: string;
     telefone2: string;
     usuario?: User
     prontuario?: Pronturario;
}

export interface Pronturario {
     id?: string;
     consultas: Consulta[];
     procedimentos: ProcedimentoProntuario[];
     internacoes?: Internamento[];
}

export interface ProcedimentoProntuario {
     procedimento: Procedimento;
     data: string;
     status: string;
     resultado?: string;
     usuarioMarcacao?: string;
     momentoMarcacao?: string;
     usuarioRealizacao?: string;
     momentoRealizacao?: string;
}