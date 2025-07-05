import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { Saldo } from '../../_models/saldo';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AuthService } from '../../_services/auth.service';
import { MedicamentosService } from '../../_services/medicamentos.service';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SaldoService } from '../../_services/saldo.service';
import { PaginacaoComponent } from "../_components/paginacao/paginacao.component";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-estoque',
  imports: [RouterModule, CommonModule, PaginacaoComponent, ReactiveFormsModule, FormsModule],
  templateUrl: './estoque.component.html',
  styleUrl: './estoque.component.scss'
})
export class EstoqueComponent implements OnInit {
  rotaFilhaAtiva = false;
  dados: Saldo[] = [];
  userPodeIncluir = false;
  userPodeEditar = false;
  userPodeExcluir = false;
  dadosFiltrados: any[] = [];
  dadosPaginados: Saldo[] = [];
  textoFiltro: string = '';
  paginaAtual = 1;
  itensPorPagina = 10;


  constructor(private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private loaderSercice: NgxUiLoaderService,
    private authService: AuthService,
    private saldoService: SaldoService
  ) { }

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.verificarRotaFilhaAtiva();
        if (!this.rotaFilhaAtiva) {
          this.buscarSaldo();
          this.userPermissoes();
        }
      });
    this.verificarRotaFilhaAtiva();

    if (!this.rotaFilhaAtiva) {
      this.buscarSaldo();
      this.userPermissoes();
    }
  }

  private verificarRotaFilhaAtiva(): void {
    this.rotaFilhaAtiva = this.route.children.length > 0;
  }

  userPermissoes() {
    this.userPodeIncluir = this.temPermissao('medicamentos', 'incluir');
    this.userPodeEditar = this.temPermissao('medicamentos', 'editar');
    this.userPodeExcluir = this.temPermissao('medicamentos', 'excluir');
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

  buscarSaldo() {
    if (this.rotaFilhaAtiva) return

    this.loaderSercice.start();

    this.saldoService.buscarSaldosComInfoCompleta().subscribe({
      next: (saldo: Saldo[]) => {
        this.dados = saldo;
        this.dadosFiltrados = saldo;
        this.paginarDados();
        this.loaderSercice.stop();
      },
      error: () => {
        this.toastr.error("Erro inesperado ao buscar saldo! Tente novamente mais tarde", "", { "progressBar": true })
        this.loaderSercice.stop();
      }
    })
  }

  paginarDados() {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;


    this.dadosFiltrados.sort((a, b) => {
      const eanA = a.medicamento?.ean ?? '';
      const eanB = b.medicamento?.ean ?? '';
      return eanA.localeCompare(eanB); // Se quiser ordem numérica real: return +eanA - +eanB;
    });

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

    this.dadosFiltrados = this.dados.filter((dado: Saldo) => {
      const camposParaFiltrar = [
        dado.hospital?.razaoSocial || '',
        dado.medicamento?.nomeGenerico || '',
        dado.medicamento?.nomeComercial || '',
        String(dado.quantidade),
        dado.momentoAtualizacao ? this.formatarData(dado.momentoAtualizacao) : '',
        dado.usuarioAtualizacao || '',
      ];

      return camposParaFiltrar.some((campo) =>
        campo.toLowerCase().includes(texto)
      );
    });

    this.paginarDados();
  }

  formatarData(dataIso: string): string {
    const [ano, mes, dia] = dataIso.split('-');
    return `${dia}/${mes}/${ano}`;
  }
}

