import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { Turno } from '../../_models/Turno';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TurnosService } from '../../_services/turnos.service';
import { PaginacaoComponent } from "../_components/paginacao/paginacao.component";
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../_services/auth.service';

@Component({
  selector: 'app-turnos',
  imports: [RouterModule, CommonModule, PaginacaoComponent, FormsModule],
  templateUrl: './turnos.component.html',
  styleUrl: './turnos.component.scss'
})
export class TurnosComponent implements OnInit {
  rotaFilhaAtiva = false;
  turnos: Turno[] = [];
  dadosFiltrados: any[] = [];
  turnosPaginados: Turno[] = []; // página atual
  paginaAtual = 1;
  itensPorPagina = 25;
  textoFiltro: string = '';
  userPodeIncluir = false;
  userPodeExcluir = false;


  constructor(private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private loaderSercice: NgxUiLoaderService,
    private turnosService: TurnosService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loaderSercice.start();
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.verificarRotaFilhaAtiva();
        if (!this.rotaFilhaAtiva) {
          this.buscarTurnos();
          this.userPermissoes();
        }
      });
    this.verificarRotaFilhaAtiva();

    if (!this.rotaFilhaAtiva) {
      this.buscarTurnos();
      this.userPermissoes();
    }
  }

  private verificarRotaFilhaAtiva(): void {
    this.rotaFilhaAtiva = this.route.children.length > 0;
  }

  userPermissoes() {
    this.userPodeIncluir = this.temPermissao('turnos', 'incluir');
    this.userPodeExcluir = this.temPermissao('turnos', 'excluir');
  }

  temPermissao(funcionalidade: string, permissao: string): boolean {
    const user = this.authService.getUsuario();

    const admin = user?.autorizacoes?.some(aut =>
      aut.funcionalidade === 'admin' &&
      aut.acesso?.toLowerCase().includes('admin')
    );

    if (admin) return true

    return !!user?.autorizacoes?.some(aut =>
      aut.funcionalidade === funcionalidade &&
      aut.acesso?.toLowerCase().split(',').includes(permissao.toLowerCase())
    );
  }

  buscarTurnos() {
    this.loaderSercice.start();
    this.turnosService.buscarTurnos().subscribe({
      next: (turnos: Turno[]) => {
        this.turnos = turnos;
        this.dadosFiltrados = turnos;
        this.paginarTurnos();
        this.loaderSercice.stop();
      },
      error: () => {
        this.toastr.error("Erro inesperado ao buscar Turnos! /n Tente novamente mais tarde.", "", { progressBar: true });
        this.loaderSercice.stop();
      }
    })
  }

  paginarTurnos() {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    this.turnosPaginados = this.dadosFiltrados.slice(inicio, fim);
  }

  onPaginaAlterada(novaPagina: number) {
    this.paginaAtual = novaPagina;
    this.paginarTurnos();
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

    this.dadosFiltrados = this.turnos.filter((dado) =>
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

    this.paginarTurnos();
  }

  formatarData(dataIso: string): string {
    const [ano, mes, dia] = dataIso.split('-');
    return `${dia}/${mes}/${ano}`;
  }


  calcularCargaHoraria(turno: Turno): string {
    const minutosTrabalhados = this.calcularMinutos(turno.horarioInicio, turno.horarioTermino);
    const minutosIntervalo = this.calcularMinutos(turno.horarioInicioIntervalo, turno.horarioTerminoIntervalo);

    const minutosTotais = minutosTrabalhados - minutosIntervalo;
    const horas = Math.floor(minutosTotais / 60);
    const minutos = minutosTotais % 60;

    return `${this.padZero(horas)}:${this.padZero(minutos)}`;
  }

  calcularMinutos(inicio: string, fim: string): number {

    if (inicio == "" || fim == "") return 0

    const [h1, m1] = inicio.split(":").map(Number);
    const [h2, m2] = fim.split(":").map(Number);
    return (h2 * 60 + m2) - (h1 * 60 + m1);
  }

  padZero(n: number): string {
    return n < 10 ? '0' + n : '' + n;
  }

  visualizar(turno: Turno) {

  }

  copiar(turno: Turno) {

    this.loaderSercice.start();

    this.turnosService.buscarTurnoMesPorTurnoParametro(turno).subscribe({
      next: (turnos: Turno[]) => {
        this.router.navigate(['admin/turnos/incluir'], {
          state: {
            turnosSemana: turnos
          }
        });
      },
      error: () => {
        this.toastr.error("Erro inesperado ao buscar Turnos! /n Tente novamente mais tarde.", "", { progressBar: true });
        this.loaderSercice.stop();
      }
    })
  }



  excluir(turno: Turno) {
    this.loaderSercice.start();

    this.turnosService.buscarTurnoMesPorTurnoParametro(turno).subscribe({
      next: (turnos: Turno[]) => {
        this.router.navigate(['admin/turnos/excluir'], {
          state: {
            turnosSemana: turnos
          }
        });
      },
      error: () => {
        this.toastr.error("Erro inesperado ao buscar Turnos! /n Tente novamente mais tarde.", "", { progressBar: true });
        this.loaderSercice.stop();
      }
    })
  }
}

