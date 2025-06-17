import { Component, OnInit } from '@angular/core';
import { Procedimento } from '../../_models/procedimento';
import { PaginacaoComponent } from "../_components/paginacao/paginacao.component";
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { filter } from 'rxjs';
import { NgxMaskPipe } from 'ngx-mask';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../_services/auth.service';
import { ProcedimentoService } from '../../_services/procedimento.service';

declare var bootstrap: any;


@Component({
  selector: 'app-procedimentos',
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule, PaginacaoComponent, NgxMaskPipe],
  templateUrl: './procedimentos.component.html',
  styleUrl: './procedimentos.component.scss'
})
export class ProcedimentosComponent implements OnInit {
  todosDados: Procedimento[] = [];
  rotaFilhaAtiva = false;
  dadosFiltrados: any[] = [];
  dadosPaginados: Procedimento[] = [];
  textoFiltro: string = '';
  paginaAtual = 1;
  itensPorPagina = 25;
  modalInstance: any;
  userPodeIncluir = false;
  userPodeEditar = false;
  userPodeExcluir = false;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private loaderSercice: NgxUiLoaderService,
    private authService: AuthService,
    private procedimentoService: ProcedimentoService
  ) { }

  ngOnInit(): void {
    this.loaderSercice.start();
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.verificarRotaFilhaAtiva();
        if (!this.rotaFilhaAtiva) {
          this.buscarProcedimentos();
          this.userPermissoes();
        }
      });
    this.verificarRotaFilhaAtiva();

    if (!this.rotaFilhaAtiva) {
      this.buscarProcedimentos();
      this.userPermissoes();

    }
  }

  private verificarRotaFilhaAtiva(): void {
    this.rotaFilhaAtiva = this.route.children.length > 0;
  }

  userPermissoes() {
    this.userPodeIncluir = this.temPermissao('procedimentos', 'incluir');
    this.userPodeEditar = this.temPermissao('procedimentos', 'editar');
    this.userPodeExcluir = this.temPermissao('procedimentos', 'excluir');
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

  paginarDados() {

    this.dadosFiltrados.sort((b, a) => {
      const dataHoraA = new Date(`${a.data}T${a.hora}`);
      const dataHoraB = new Date(`${b.data}T${b.hora}`);
      return dataHoraA.getTime() - dataHoraB.getTime();
    });

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

  buscarProcedimentos() {
    this.procedimentoService.buscarProcedimentos().subscribe({
      next: (procedimentos: Procedimento[]) => {
        this.todosDados = procedimentos;
        this.dadosFiltrados = procedimentos;
        this.paginarDados();
      }
    })
  }

  visualizar(id: string) {

  }

  editar(id: string) {
    this.router.navigate(['admin/procedimentos/editar', id]);
  }

  excluir(procedimento: Procedimento) {

  }

}
