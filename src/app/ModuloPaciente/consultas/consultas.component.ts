import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { Consulta } from '../../_models/consulta';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ColaboradorService } from '../../_services/colaborador.service';
import { AuthService } from '../../_services/auth.service';
import { filter } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginacaoComponent } from "../../ModuloAdmim/_components/paginacao/paginacao.component";
import { ConsultasService } from '../../_services/consultas.service';
import { PacienteService } from '../../_services/paciente.service';
import { Paciente } from '../../_models/Paciente';

@Component({
  selector: 'app-consultas',
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule, PaginacaoComponent],
  templateUrl: './consultas.component.html',
  styleUrl: './consultas.component.scss'
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

  constructor(private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private loaderSercice: NgxUiLoaderService,
    private consultasService: ConsultasService,
    private pacienteService: PacienteService
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
  }

  private verificarRotaFilhaAtiva(): void {
    this.rotaFilhaAtiva = this.route.children.length > 0;
  }

  paginarDados() {
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

  buscarConsultas(paciente : Paciente) {
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

}
