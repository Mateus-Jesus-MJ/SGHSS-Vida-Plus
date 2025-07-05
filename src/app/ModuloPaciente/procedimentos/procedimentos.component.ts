import { Component, OnInit } from '@angular/core';
import { Procedimento } from '../../_models/procedimento';
import { Paciente, ProcedimentoProntuario } from '../../_models/Paciente';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConsultasService } from '../../_services/consultas.service';
import { PacienteService } from '../../_services/paciente.service';
import { CommonModule, DatePipe } from '@angular/common';
import { filter } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginacaoComponent } from "../../ModuloAdmim/_components/paginacao/paginacao.component";

@Component({
  selector: 'app-procedimentos',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, PaginacaoComponent],
  templateUrl: './procedimentos.component.html',
  styleUrl: './procedimentos.component.scss'
})
export class ProcedimentosPacienteComponent implements OnInit {
  todosDados: ProcedimentoProntuario[] = [];
  rotaFilhaAtiva = false;
  dadosFiltrados: any[] = [];
  dadosPaginados: ProcedimentoProntuario[] = [];
  textoFiltro: string = '';
  paginaAtual = 1;
  itensPorPagina = 25;
  paciente!: Paciente;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private loaderSercice: NgxUiLoaderService,
    private pacienteService: PacienteService,
  ) { }

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.verificarRotaFilhaAtiva();
        if (!this.rotaFilhaAtiva) {
          this.loaderSercice.start();
          this.pacienteService.buscarPacienteLogado().subscribe({
            next: (paciente: Paciente) => {
              this.paciente = paciente
              if (paciente.prontuario?.procedimentos) {
                this.listarProcedimentos(paciente.prontuario?.procedimentos!);
              }
            },
            error: (error) => {
              this.toastr.error(error);
              this.loaderSercice.stop();
            }
          })
        }
      });
    this.verificarRotaFilhaAtiva();

    if (!this.rotaFilhaAtiva) {
      this.loaderSercice.start();
      this.pacienteService.buscarPacienteLogado().subscribe({
        next: (paciente: Paciente) => {
          this.paciente = paciente
          if (paciente.prontuario?.procedimentos) {
            this.listarProcedimentos(paciente.prontuario?.procedimentos!);
          }
        },
        error: (error) => {
          this.toastr.error(error);
          this.loaderSercice.stop();
        }
      })
    }
  }

  private verificarRotaFilhaAtiva(): void {
    this.rotaFilhaAtiva = this.route.children.length > 0;
  }

  listarProcedimentos(procedimentos: ProcedimentoProntuario[]) {
    this.todosDados = procedimentos;
    this.aplicarFiltro();
    this.loaderSercice.stop();
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

}
