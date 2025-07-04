import { Ala } from "./ala";
import { Hospital } from "./Hospital";

export interface Leito{
    id?: string;
    codigo: string;
    descricao: string;
    idAla: string;
    ala?: Ala;
    idHospital: string;
    hospital?: Hospital;
    status: string;
    equipamentos: EquipamentosLeito[];    
}

export interface EquipamentosLeito{
    nome: string;
    descricao?: string;
}