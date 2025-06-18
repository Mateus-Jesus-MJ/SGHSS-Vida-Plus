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
  status: 'ATIVO' | 'INATIVO';
  registroAnvisa: string;
  controlado: boolean;
  tarja: 'ISENTO' | 'TARJA VERMELHA' | 'TARJA PRETA';
  observacoes?: string;
  usuarioCriacao? : string;
  momentoCriacao?: string;
  usuarioEdicao? : string;
  momentoEdicao?: string;
  imagem? :string;
}
