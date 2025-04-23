import { User } from "./User";

export class Paciente {
  constructor(
    public id?: number ,
    public nome: string = "",
    public dataNascimento: string = "",
    public cpf: string = "",
    public identidade: string = "",
    public enderecoCep: string = "",
    public enderecoLogradouro: string = "",
    public enderecoNumero: string = "",
    public enderecoComplemento: string = "",
    public enderecoBairro: string = "",
    public enderecoUF: string = "",
    public enderecoMunicipio: string = "",
    public email: string = "",
    public telefone1: string = "",
    public telefone2: string = "",
    public usuario?: User
  ) {}
}