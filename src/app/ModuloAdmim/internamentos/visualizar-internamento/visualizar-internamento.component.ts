import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonModule, Location } from '@angular/common';
import { Internamento, precricaoInternamento } from '../../../_models/internamento';
import { IntenamentoService } from '../../../_services/intenamento.service';
import { NgxMaskPipe } from 'ngx-mask';
import { AuthService } from '../../../_services/auth.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { showAlert } from '../../../_util.ts/sweetalert-util';
import { Leito } from '../../../_models/leito';
import { LeitosService } from '../../../_services/leitos.service';
import { PaginacaoComponent } from "../../_components/paginacao/paginacao.component";

declare var bootstrap: any;

@Component({
  selector: 'app-visualizar-internamento',
  imports: [CommonModule, NgxMaskPipe, ReactiveFormsModule, FormsModule, PaginacaoComponent],
  templateUrl: './visualizar-internamento.component.html',
  styleUrl: './visualizar-internamento.component.scss'
})
export class VisualizarInternamentoComponent implements OnInit {
  form!: FormGroup;
  internamento!: Internamento;
  leitos: Leito[] = []
  leitosFiltrados: Leito[] = [];
  leitosPaginados: Leito[] = [];
  paginaAtualLeitos = 1;
  leitosPorPagina = 10;
  textoFiltroLeito = '';  
  modalInstanceLeitos: any;
  userPodeEditar = false;
  userPodeMedicar = false;
  userPodePrescrever = false;


  constructor(
    private toastr: ToastrService,
    private loader: NgxUiLoaderService,
    private router: Router,
    private routeAcitive: ActivatedRoute,
    private location: Location,
    private internamentoService: IntenamentoService,
    private authService: AuthService,
    private leitoService: LeitosService
  ) {
    this.form = new FormGroup({
      medicamentoAdicionar: new FormControl('', Validators.required),
      medicamentoQuantidade: new FormControl('', Validators.required),
      medicamentoPeriodo: new FormControl('', Validators.required),
    })
  }
  ngOnInit(): void {
    this.loader.start();
    this.routeAcitive.paramMap.subscribe(params => {
      const id = params.get('id')!;

      if (id == null || id == "") {
        this.toastr.error("Intenamento não encontrado");
        this.location.back();
        this.loader.stop();
        return
      }
      this.userPermissoes();
      this.buscarInternamento(id);
    });
  }

  userPermissoes() {
    this.userPodeEditar = this.temPermissao('internamentos', 'editar');
    this.userPodeMedicar = this.temPermissao('internamentos', 'medicacao');
    this.userPodePrescrever = this.temPermissao('internamentos', 'prescricao');

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

  buscarInternamento(id: string) {
    this.internamentoService.buscarPorId(id).subscribe({
      next: (internamento: Internamento | null) => {
        if (internamento) {
          this.internamento = internamento;
          this.loader.stop();
        } else {
          this.toastr.error("Intenamento não encontrado");
          this.loader.stop();
        }
      }, error: () => {
        this.toastr.error("Intenamento não encontrado");
        this.loader.stop();
      }
    })
  }
  voltar() {
    this.location.back();
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

  adicionarPrescricao() {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loader.startBackground();

    const user = this.authService.getUsuario();

    if (!this.internamento.prescricao) {
      this.internamento.prescricao = [];
    }

    const prescricao: precricaoInternamento = {
      processo: this.form.get("medicamentoAdicionar")?.value.toUpperCase(),
      periodo: this.form.get("medicamentoPeriodo")?.value.toUpperCase(),
      quantidade: this.form.get("medicamentoQuantidade")?.value.toUpperCase(),
      medico: user?.id,
      momentoInclusao: new Date().toString()
    }

    this.internamento.prescricao.push(prescricao);

    this.form.reset();

    this.loader.stopBackground();
  }

  removerPrescricao(prescricao: precricaoInternamento) {
    this.loader.startBackground();

    this.internamento.prescricao = this.internamento.prescricao?.filter(e =>
      e.processo.toUpperCase() != prescricao.processo.toUpperCase() &&
      e.quantidade.toUpperCase() != prescricao.quantidade.toUpperCase() &&
      e.periodo.toUpperCase() != prescricao.periodo.toUpperCase()
    );

    this.loader.stopBackground();

  }


  buscarLeitos() {
    this.loader.start();
    const modalEl = document.getElementById('modalLeitos');
    this.modalInstanceLeitos = new bootstrap.Modal(modalEl);
    this.leitoService.buscarLeitos().subscribe({
      next: (leitos: Leito[]) => {
        this.leitos = leitos;
        this.filtrarLeitos();
        this.modalInstanceLeitos.show();
        this.loader.stop();
      }
      , error: () => {
        this.toastr.error("Erro ao buscar leitos, tente novamente mais tarde!", "", { progressBar: true });
        this.loader.stop();
      }
    })
  }

  paginarLeitos() {
    const inicio = (this.paginaAtualLeitos - 1) * this.leitosPorPagina;
    const fim = inicio + this.leitosPorPagina;
    this.leitosPaginados = this.leitosFiltrados.slice(inicio, fim);
  }

  filtrarLeitos() {
    this.paginaAtualLeitos = 1;
    this.aplicarFiltroLeitos();
  }

  aplicarFiltroLeitos() {

    const texto = this.textoFiltroLeito.toLowerCase();

    this.leitosFiltrados = this.leitos.filter((dado) =>
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


    this.leitosFiltrados = this.leitosFiltrados.filter(e => e.status.toUpperCase() == "DISPONÍVEL");

    this.paginarLeitos();
  }

  onPaginaAlteradaLeito(novaPagina: number) {
    this.paginaAtualLeitos = novaPagina;
    this.paginarLeitos();
  }

  selecionarLeito(leito: Leito) {
    this.internamento.leito = leito;
    this.internamento.idLeito = leito.id!;
    this.modalInstanceLeitos.hide();
  }

  formatarData(dataIso: string): string {
    const [ano, mes, dia] = dataIso.split('-');
    return `${dia}/${mes}/${ano}`;
  }





  submit() {
    showAlert('Tem certeza?', `Deseja mesmo alterar o prontuario de internamento do paciente ${this.internamento.paciente?.nome}?`, 'question', 'danger')
      .then((result) => {
        if (result.isConfirmed) {
          this.loader.start();

          this.internamentoService.atualizar(this.internamento).subscribe({
            next: (res: any) => {
              this.toastr.success(res);
              this.loader.stop();
            },
            error: (err: any) => {
              this.toastr.error(err);
              this.loader.stop();
            }
          });
        }
      });
  }
}
