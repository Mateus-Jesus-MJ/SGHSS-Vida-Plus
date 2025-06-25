export interface RecebimentoMedicamento {
  id?: string;
  hospitalId: string;
  medicamentoId: string;
  lote: string;
  quantidade: number;
  dataValidade: string;
  dataRecebimento: string;
  fornecedor: string;
  cnpj: string;
  notaFiscal?: string;
  observacoes?: string;
  usuarioRecebimento?: string;
  momentoRecebimento?: string;
}
