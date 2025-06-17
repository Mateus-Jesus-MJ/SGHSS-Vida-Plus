import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { Medicamento } from '../../_models/medicamento';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AuthService } from '../../_services/auth.service';
import { MedicamentosService } from '../../_services/medicamentos.service';
import { filter } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginacaoComponent } from "../_components/paginacao/paginacao.component";

@Component({
  selector: 'app-medicamentos',
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule, PaginacaoComponent],
  templateUrl: './medicamentos.component.html',
  styleUrl: './medicamentos.component.scss'
})
export class MedicamentosComponent implements OnInit {
  rotaFilhaAtiva = false;
  dados: Medicamento[] = [];
  userPodeIncluir = false;
  userPodeEditar = false;
  userPodeExcluir = false;
  dadosFiltrados: any[] = [];
  dadosPaginados: Medicamento[] = [];
  textoFiltro: string = '';
  paginaAtual = 1;
  itensPorPagina = 25;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private loaderSercice: NgxUiLoaderService,
    private authService: AuthService,
    private medicamentosService: MedicamentosService
  ) { }

  ngOnInit(): void {
    this.loaderSercice.start();
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.verificarRotaFilhaAtiva();
        if (!this.rotaFilhaAtiva) {
          this.buscarmedicamentos();
          this.userPermissoes();
        }
      });
    this.verificarRotaFilhaAtiva();

    if (!this.rotaFilhaAtiva) {
      this.buscarmedicamentos();
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

  buscarmedicamentos() {
    this.loaderSercice.start();
    this.medicamentosService.buscarTodos().subscribe({
      next: (dados: Medicamento[]) => {
        this.dados = dados;
        this.dadosFiltrados = dados;
        this.paginarDados();
      },
      error: () => {
        this.toastr.error("Erro inesperado ao buscar medicamentos! Tente novamente mais tarde", "", { "progressBar": true })
        this.loaderSercice.stop();
      }
    })
  }

  paginarDados() {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    this.dadosPaginados = this.dadosFiltrados.slice(inicio, fim);

    this.loaderSercice.stop();
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

    this.dadosFiltrados = this.dados.filter((dado) =>
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

  visualizar(id:string){

  }

  editar(id:string){

  }

  excluir(medicamento:Medicamento){

  }

}
