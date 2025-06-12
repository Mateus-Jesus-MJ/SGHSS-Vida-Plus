export interface Procedimento{
  id?:string;
  nome: string;
  funcionamento: funcionamentoProcedimento[];
  tempoDuracao: number;
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
