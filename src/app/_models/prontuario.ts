import { Consulta } from "./consulta";
import { User } from "./User";

export interface Prontuario {
     id?: string;
     consultas : Consulta[];
}
