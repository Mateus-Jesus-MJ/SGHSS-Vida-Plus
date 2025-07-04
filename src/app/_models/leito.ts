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
    usuarioCriacao?: string;
    momentoCriacao?: string;
    usuarioEdicao?: string;
    momentoEdicao?: string;

}

export interface EquipamentosLeito{
    nome: string;
    descricao?: string;
}