import { Cargo, Especialidade } from "./cargo";
import { Contato } from "./contato";
import { Endereco } from "./endereco";
import { User } from "./User";

export interface Colaborador {
  id?: string;
  imagem?: string
  nome: string;
  dataNascimento: string;
  cpf: string;
  identidade?: string;
  escolaridade: string;
  endereco: Endereco;
  contato: Contato;
  cargoId: string;
  cargo?: Cargo;
  crm?: string;
  salario: string;
  usuarioId?: string;
  usuario?: User,
  dataInicio: string;
  dataDemissao?: string;
  historicoCargos?: Cargo[];
  historicoAvaliacao?: AvaliacaoColaborador[];
  treinamentos?: TreinamentoColaborador[];
  formacoes?: FormacaoColaborador[];
  cursos?: CursoColaborador[];
  especialidades?: Especialidade[];
}

export interface AvaliacaoColaborador {
  data: string;
  avaliador: string;
  observacao: string;
  criterios: AvaliacaoColaboradorCriterio[];
}

export interface AvaliacaoColaboradorCriterio {
  criterio: string;
  nota: number;
  observacao: string;
}

export interface TreinamentoColaborador {
  titulo: string;
  data?: string;
  cargaHoraria?: string;
  instrutor?: string;
  instituicaoEnsino?: string;
}

export interface FormacaoColaborador {
  nivelEscolaridade: string;
  formacao: string;
  anoConclusao?: string;
  instituicaoEnsino?: string;
}

export interface CursoColaborador {
  titulo: string;
  data?: string;
  cargaHoraria?: string;
  instituicaoEnsino?: string;
}
