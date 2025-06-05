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

  constructor(private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private loaderSercice: NgxUiLoaderService,
  ) { }

  ngOnInit(): void {
    this.loaderSercice.start();
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.verificarRotaFilhaAtiva();
        if (!this.rotaFilhaAtiva) {

        }
      });
    this.verificarRotaFilhaAtiva();

    if (!this.rotaFilhaAtiva) {


    }
    this.loaderSercice.stop();
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

}
