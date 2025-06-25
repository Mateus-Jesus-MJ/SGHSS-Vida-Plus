import { Hospital } from "./Hospital";
import { Medicamento } from "./medicamento";
import { RecebimentoMedicamento } from "./recebimento";

export interface Saldo {
  id?: string;
  hospitalId: string;
  hospital?:Hospital;
  medicamentoId: string;
  medicamento?: Medicamento;
  quantidade: number;
  momentoAtualizacao?: string;
  usuarioAtualizacao?: string;
  recebimentos: RecebimentoMedicamento[]
}
