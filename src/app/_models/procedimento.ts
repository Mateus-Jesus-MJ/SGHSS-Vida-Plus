export interface Procedimento{
  id?:string;
  nome: string;
  funcionamento: funcionamentoProcedimento[];
  tempoDuracao: number;
  userCriacao?: string;
  momentoCricao?: string;
  userEdicao?: string
  momentoEdicao?: string;
}

export interface funcionamentoProcedimento{
  diaSemana: string;
  numeroDiaSemana: number;
  horarioInicio: string;
  horarioInicioIntervalo: string;
  horarioTerminoIntervalo: string;
  horarioTermino: string;
  numeroAtendimento: string;
}
