import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AuthService } from '../../_services/auth.service';
import { filter } from 'rxjs';
import { IntenamentoService } from '../../_services/intenamento.service';
import { Internamento } from '../../_models/internamento';
import { PaginacaoComponent } from "../_components/paginacao/paginacao.component";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-internamentos',
  imports: [RouterModule, CommonModule, PaginacaoComponent, ReactiveFormsModule, FormsModule],
  templateUrl: './internamentos.component.html',
  styleUrl: './internamentos.component.scss'
})
export class InternamentosComponent implements OnInit {
  rotaFilhaAtiva = false;
  userPodeIncluir = false;
  userPodeEditar = false;
  userPodeExcluir = false;
  dados: Internamento[] = [];
  dadosFiltrados: any[] = [];
  dadosPaginados: any[] = [];
  textoFiltro: string = '';
  paginaAtual = 1;
  itensPorPagina = 10;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private ngxUiLoaderService: NgxUiLoaderService,
    private authService: AuthService,
    private internamentoService: IntenamentoService
  ) { }

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.verificarRotaFilhaAtiva();
        if (!this.rotaFilhaAtiva) {
          this.buscarInternamentos();
          this.userPermissoes();
        }
      });
    this.verificarRotaFilhaAtiva();

    if (!this.rotaFilhaAtiva) {
      this.buscarInternamentos();
      this.userPermissoes();
    }


  }

  private verificarRotaFilhaAtiva(): void {
    this.rotaFilhaAtiva = this.route.children.length > 0;
  }

  userPermissoes() {
    this.userPodeIncluir = this.temPermissao('hospitais', 'incluir');
    this.userPodeEditar = this.temPermissao('hospitais', 'editar');
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

  buscarInternamentos() {
    this.ngxUiLoaderService.start();
    this.internamentoService.buscarIntenamentos().subscribe({
      next: (internamentos: Internamento[]) => {
        this.dados = internamentos;
        this.filtrarLista();
        this.ngxUiLoaderService.stop();
      },
      error: () => {
        this.toastr.error("Erro ao consulta internamentos. Tente novamente mais tarde!", "", { progressBar: true });
        this.ngxUiLoaderService.stop();
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
  
      this.dadosFiltrados = this.dados.filter((dado: Internamento) => {
        const camposParaFiltrar = [
          dado.leito!.hospital?.razaoSocial || '',
          dado.leito!.ala?.nome || '',
          dado.leito?.codigo || '',
          dado.paciente?.nome || '',
          dado.paciente?.cpf || '',
          dado.status || '',
          dado.medicoSolicitante || '',
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
