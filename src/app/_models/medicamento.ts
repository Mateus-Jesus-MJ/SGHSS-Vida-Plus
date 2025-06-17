export interface Medicamento {
  id?: string;
  ean: string;
  nomeComercial: string;
  nomeGenerico: string;
  formaFarmaceutica: string;
  dosagem: string;
  viaAdministracao: string;
  apresentacao: string;
  fabricante: string;
  status: 'Ativo' | 'Inativo';
  registroAnvisa: string;
  controlado: boolean;
  tarja: 'Isento' | 'Tarja Vermelha' | 'Tarja Preta';
  observacoes?: string;
}
