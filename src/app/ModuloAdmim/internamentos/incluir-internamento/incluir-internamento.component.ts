import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Paciente } from '../../../_models/Paciente';
import { Leito } from '../../../_models/leito';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { LeitosService } from '../../../_services/leitos.service';
import { PacienteService } from '../../../_services/paciente.service';
import { PaginacaoComponent } from "../../_components/paginacao/paginacao.component";
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { Internamento } from '../../../_models/internamento';
import { IntenamentoService } from '../../../_services/intenamento.service';

declare var bootstrap: any;

@Component({
  selector: 'app-incluir-internamento',
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule, PaginacaoComponent, NgxMaskPipe, NgxMaskDirective],
  templateUrl: './incluir-internamento.component.html',
  styleUrl: './incluir-internamento.component.scss'
})
export class IncluirInternamentoComponent implements OnInit {
  form!: FormGroup
  pacientes: Paciente[] = [];
  pacientesFiltrados: Paciente[] = [];
  pacientesPaginados: Paciente[] = [];
  paginaAtualPacientes = 1;
  pacientesPorPagina = 10;
  textoFiltroPaciente = '';
  pacienteSelecionado?: Paciente;
  modalInstancePacientes: any;
  leitos: Leito[] = []
  leitosFiltrados: Leito[] = [];
  leitosPaginados: Leito[] = [];
  paginaAtualLeitos = 1;
  leitosPorPagina = 10;
  textoFiltroLeito = '';
  leitoSelecionado?: Leito;
  modalInstanceLeitos: any;


  constructor(private loader: NgxUiLoaderService,
    private toastr: ToastrService,
    private leitoService: LeitosService,
    private pacienteService: PacienteService,
    private internamentoService: IntenamentoService
  ) {
    this.form = new FormGroup({
      hospital: new FormControl('', Validators.required),
      ala: new FormControl('', Validators.required),
      leito: new FormControl('', Validators.required),
      paciente: new FormControl('', Validators.required),
      cpf: new FormControl('', Validators.required),
      dataNascimento: new FormControl('', Validators.required),
      medicoSolicitante: new FormControl('', Validators.required),
      crmMedico: new FormControl('', Validators.required)
    });
  }

  ngOnInit(): void {
    this.loader.start();
    this.buscarLeitos();

    let modalEl = document.getElementById('modalPacientes');
    this.modalInstancePacientes = new bootstrap.Modal(modalEl);
    modalEl = document.getElementById('modalLeitos');
    this.modalInstanceLeitos = new bootstrap.Modal(modalEl);
  }

  buscarLeitos() {
    this.leitoService.buscarLeitos().subscribe({
      next: (leitos: Leito[]) => {
        this.leitos = leitos;
        this.filtrarLeitos();
        this.buscarPacientes();
      }
      , error: () => {
        this.toastr.error("Erro ao buscar leitos, tente novamente mais tarde!", "", { progressBar: true });
        this.loader.stop();
      }
    })
  }

  buscarPacientes() {
    const filtros = {}
    this.pacienteService.buscarPacientesPorCriterios(filtros).subscribe({
      next: (pacientes: Paciente[]) => {
        this.pacientes = pacientes
        this.filtrarPacientes();
        this.loader.stop();
      }
      , error: () => {
        this.toastr.error("Erro ao buscar pacientes, tente novamente mais tarde!", "", { progressBar: true });
        this.loader.stop();
      }
    })
  }

  paginarPacientes() {
    const inicio = (this.paginaAtualPacientes - 1) * this.pacientesPorPagina;
    const fim = inicio + this.pacientesPorPagina;
    this.pacientesPaginados = this.pacientesFiltrados.slice(inicio, fim);
  }

  filtrarPacientes() {
    this.paginaAtualPacientes = 1;
    this.aplicarFiltroPacientes();
  }

  aplicarFiltroPacientes() {

    const texto = this.textoFiltroPaciente.toLowerCase();

    this.pacientesFiltrados = this.pacientes.filter((dado) =>
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

    this.paginarPacientes();
  }

  formatarData(dataIso: string): string {
    const [ano, mes, dia] = dataIso.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  onPaginaAlterada(novaPagina: number) {
    this.paginaAtualPacientes = novaPagina;
    this.paginarPacientes();
  }

  selecionarPaciente(paciente: Paciente) {
    this.pacienteSelecionado = paciente;
    this.form.get("paciente")?.setValue(paciente.nome);
    this.form.get("cpf")?.setValue(paciente.cpf);
    this.form.get("dataNascimento")?.setValue(paciente.dataNascimento);
    this.modalInstancePacientes.hide();
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

  selecionarLeito(leito:Leito){
    this.leitoSelecionado = leito;
    this.form.patchValue({
      leito: leito.codigo,
      hospital: leito.hospital?.razaoSocial,
      ala: leito.ala?.nome
    });

    this.modalInstanceLeitos.hide();
  }


  submit() {

    if(this.form.invalid){
      this.form.markAllAsTouched();
      return;
    }

    this.loader.start();

    const formData = this.form.value;

    const internamento : Internamento = {
      idPaciente: this.pacienteSelecionado!.id!,
      idLeito: this.leitoSelecionado!.id!,
      medicoSolicitante : formData.medicoSolicitante,
      crmMedico: formData.crmMedico,
      status: "INTERNADO",
      prescricao : []
    }

    this.internamentoService.incluir(internamento).subscribe({
      next: (res) => {
        this.toastr.success(res);
        this.form.reset();
        this.pacienteSelecionado = undefined;
        this.leitoSelecionado = undefined;
        this.loader.stop();
      },
      error: (error) => {
        this.toastr.error(error);
        this.loader.stop();
      }
    })

  }

}
