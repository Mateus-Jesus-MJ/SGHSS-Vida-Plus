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
}
