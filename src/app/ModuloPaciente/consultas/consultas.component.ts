import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { Consulta } from '../../_models/consulta';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ColaboradorService } from '../../_services/colaborador.service';
import { AuthService } from '../../_services/auth.service';
import { Cons, filter } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginacaoComponent } from "../../ModuloAdmim/_components/paginacao/paginacao.component";
import { ConsultasService } from '../../_services/consultas.service';
import { PacienteService } from '../../_services/paciente.service';
import { Paciente } from '../../_models/Paciente';
import { NgxMaskPipe } from 'ngx-mask';
import { showAlert } from '../../_util.ts/sweetalert-util';

declare var bootstrap: any;

@Component({
  selector: 'app-consultas',
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule, PaginacaoComponent, NgxMaskPipe],
  templateUrl: './consultas.component.html',
  styleUrl: './consultas.component.scss',
  providers: [DatePipe]
})
export class ConsultasComponent implements OnInit {
  todosDados: Consulta[] = [];
  rotaFilhaAtiva = false;
  dadosFiltrados: any[] = [];
  dadosPaginados: Consulta[] = [];
  textoFiltro: string = '';
  paginaAtual = 1;
  itensPorPagina = 25;
  paciente!: Paciente;
  consultaSelecionada?: Consulta;
  modalColaboradoresInstance: any;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private loaderSercice: NgxUiLoaderService,
    private consultasService: ConsultasService,
    private pacienteService: PacienteService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.loaderSercice.start();
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.verificarRotaFilhaAtiva();
        if (!this.rotaFilhaAtiva) {
          this.pacienteService.buscarPacienteLogado().subscribe({
            next: (paciente: Paciente) => {
              this.paciente = paciente
              this.buscarConsultas(paciente);
            },
            error: (error) => {
              this.toastr.error(error);
            }
          })
        }
      });
    this.verificarRotaFilhaAtiva();

    if (!this.rotaFilhaAtiva) {
      this.pacienteService.buscarPacienteLogado().subscribe({
        next: (paciente: Paciente) => {
          this.paciente = paciente
          this.buscarConsultas(paciente);
        },
        error: (error) => {
          this.toastr.error(error);
        }
      })
    }

    const modalEl = document.getElementById('modalVisualizar');
    this.modalColaboradoresInstance = new bootstrap.Modal(modalEl);
  }

  private verificarRotaFilhaAtiva(): void {
    this.rotaFilhaAtiva = this.route.children.length > 0;
  }

  paginarDados() {

    this.dadosFiltrados.sort((b, a) => {
      const dataHoraA = new Date(`${a.data}T${a.hora}`);
      const dataHoraB = new Date(`${b.data}T${b.hora}`);
      return dataHoraA.getTime() - dataHoraB.getTime();
    });

    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    this.dadosPaginados = this.dadosFiltrados.slice(inicio, fim);
  }

  onPaginaAlterada(novaPagina: number) {
    this.paginaAtual = novaPagina;
    this.paginarDados();
  }

  ngOnChanges() {
    this.aplicarFiltro();
  }

  filtrarLista() {
    this.paginaAtual = 1;
    this.aplicarFiltro();
  }

  aplicarFiltro() {
    const texto = this.textoFiltro.toLowerCase();

    this.dadosFiltrados = this.todosDados.filter((dado) =>
      Object.entries(dado).some(([chave, valor]) => {
        let valorStr = '';

        if (typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor)) {
          // Detecta data ISO e formata para dd/MM/yyyy
          valorStr = this.formatarData(valor);
        } else if (valor != null && typeof valor === 'object') {
          // Se for objeto, verificar campos específicos como colaborador.nome
          if ('nome' in valor && typeof valor['nome'] === 'string') {
            valorStr = valor['nome'];
          }
        } else if (valor != null) {
          valorStr = String(valor);
        }

        return valorStr.toLowerCase().includes(texto);
      })
    );

    this.paginarDados();
  }

  formatarData(dataIso: string): string {
    const [ano, mes, dia] = dataIso.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  buscarConsultas(paciente: Paciente) {
    this.consultasService.buscarConsultaPorPaciente(paciente).subscribe({
      next: (consultas: Consulta[]) => {
        this.todosDados = consultas;
        this.dadosFiltrados = consultas;
        this.paginarDados();
        this.loaderSercice.stop();
      },
      error: () => {
        this.toastr.error("Erro inesperado ao buscar consultas do paciente! Tente novamente mais tarde", "", { "progressBar": true })
        this.loaderSercice.stop();
      }
    });
  }

  podeEntrar(consulta: Consulta): boolean {
    if (!consulta?.data || !consulta?.hora) return false;

    const agora = new Date();
    const [hora, minuto] = consulta.hora.split(':').map(Number);

    const dataConsulta = new Date(consulta.data + "T" + consulta.hora);
    dataConsulta.setHours(hora, minuto, 0, 0);

    const diffMs = dataConsulta.getTime() - agora.getTime();
    const diffMin = diffMs / 60000;

    return diffMin <= 1 && diffMin >= 0;
  }

  visualizar(consulta: Consulta) {
    this.loaderSercice.start();
    this.consultaSelecionada = consulta;
    this.modalColaboradoresInstance.show();
    this.loaderSercice.stop();
  }

  calcularIdade(dataNascimento: string | Date): string {
    const nascimento = new Date(dataNascimento);
    const hoje = new Date();

    let idade = hoje.getFullYear() - nascimento.getFullYear();

    const mesAtual = hoje.getMonth();
    const diaAtual = hoje.getDate();
    const mesNascimento = nascimento.getMonth();
    const diaNascimento = nascimento.getDate();

    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && diaAtual < diaNascimento)) {
      idade--;
    }

    let idadeFormatada;
    if (idade > 1) {
      idadeFormatada = idade + " Anos";
    } else {
      idadeFormatada = idade + " Ano";
    }

    return idadeFormatada;
  }

  desmarcar(consulta: Consulta) {

    if (!this.podeEntrar(consulta) && consulta.status != "MARCADO") {
      this.toastr.error("Você não pode desmarcar essa consulta.", "", { progressBar: true });
      return;
    }

    const dataFormatada = this.datePipe.transform(consulta.data, 'dd/MM/yyyy');
    showAlert('Tem certeza?', `Deseja desmarcar a consulta com o doutor ${consulta.medico?.nome} agendada para o dia ${dataFormatada} às ${consulta.hora}?`)
      .then((result) => {
        if (result.isConfirmed) {
          this.loaderSercice.start();
          this.consultasService.excluirConsulta(consulta!).subscribe({
            next: (res: any) => {
              this.buscarConsultas(this.paciente);
              this.toastr.success(res);
            },
            error: (err: any) => {
              this.toastr.error(err);
              this.loaderSercice.stop();
            }
          });
        }
      });
  }
}
