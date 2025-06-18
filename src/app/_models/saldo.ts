import { Hospital } from "./Hospital";
import { Medicamento } from "./medicamento";

export interface Saldo {
  id?: string;
  hospitalId: string;
  hospital?:Hospital;
  medicamentoId: string;
  medicamento?: Medicamento;
  quantidade: number;
  momentoAtualizacao?: string;
  usuarioAtualizacao?: string;
}
