import { Component, OnInit } from '@angular/core';
import { Leito } from '../../_models/leito';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AuthService } from '../../_services/auth.service';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { LeitosService } from '../../_services/leitos.service';

@Component({
  selector: 'app-leitos',
  imports: [RouterModule, CommonModule],
  templateUrl: './leitos.component.html',
  styleUrl: './leitos.component.scss'
})
export class LeitosComponent implements OnInit {
  rotaFilhaAtiva = false;
  leitos: Leito[] = [];
  userPodeIncluir = false;
  userPodeEditar = false;
  dadosFiltrados: any[] = [];
  dadosPaginados: Leito[] = [];
  paginaAtual = 1;
  itensPorPagina = 25;



  constructor(private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private loaderSercice: NgxUiLoaderService,
    private authService: AuthService,
    private leitosService: LeitosService
  ) { }


  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.verificarRotaFilhaAtiva();
        if (!this.rotaFilhaAtiva) {
          this.buscarLeitos();
          this.userPermissoes();
        }
      });
    this.verificarRotaFilhaAtiva();

    if (!this.rotaFilhaAtiva) {
      this.buscarLeitos();
      this.userPermissoes();
    }
  }

  private verificarRotaFilhaAtiva(): void {
    this.rotaFilhaAtiva = this.route.children.length > 0;
  }

  userPermissoes() {
    this.userPodeIncluir = this.temPermissao('colaboradores', 'incluir');
    this.userPodeEditar = this.temPermissao('colaboradores', 'editar');
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

  buscarLeitos() {
    this.loaderSercice.start();
    if (this.rotaFilhaAtiva) return

    this.leitosService.buscarLeitos().subscribe({
      next: (leitos: Leito[]) => {
        this.leitos = leitos;
        this.dadosFiltrados = leitos;
        this.paginarDados();
        this.loaderSercice.stop();
      },
      error: () => {
        this.toastr.error("Erro inesperado ao buscar colaboradores! Tente novamente mais tarde", "", { "progressBar": true })
        this.loaderSercice.stop();
      }
    })
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
    // const texto = this.textoFiltro.toLowerCase();

    // this.dadosFiltrados = this.colaboradores.filter((dado) =>
    //   Object.entries(dado).some(([chave, valor]) => {
    //     let valorStr = '';

    //     if (typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    //       // Detecta data ISO e formata para dd/MM/yyyy
    //       valorStr = this.formatarData(valor);
    //     } else if (valor != null && typeof valor === 'object') {
    //       // Se for objeto, verificar campos específicos como colaborador.nome
    //       if ('nome' in valor && typeof valor['nome'] === 'string') {
    //         valorStr = valor['nome'];
    //       }
    //     } else if (valor != null) {
    //       valorStr = String(valor);
    //     }

    //     return valorStr.toLowerCase().includes(texto);
    //   })
    // );

    this.paginarDados();
  }

  formatarData(dataIso: string): string {
    const [ano, mes, dia] = dataIso.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  visualizar(id: string) {

  }

  editar(id: string) {
    this.router.navigate(['admin/leitos/editar', id]);
  }

}
