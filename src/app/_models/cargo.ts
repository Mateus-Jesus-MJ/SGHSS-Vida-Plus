export interface Cargo{
    id?: string;
    cargo: string;
    descricaoDeFuncao: string;
    salarioBase: string;
    escolaridade: string;
    requisitosDoCargo?: RequisitosDoCargo[];
    especialidade?:Especialidade[];
}

export interface RequisitosDoCargo{
  requisito: string
}

export interface Especialidade{
  especialidade: string;
  cargoId?: string;
}
