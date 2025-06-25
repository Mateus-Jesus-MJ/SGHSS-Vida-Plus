import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MedicamentosService } from '../../../_services/medicamentos.service';
import { Medicamento } from '../../../_models/medicamento';
import { PaginacaoComponent } from "../../_components/paginacao/paginacao.component";
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { RecebimentoMedicamento } from '../../../_models/recebimento';
import { Hospital } from '../../../_models/Hospital';
import { HospitalService } from '../../../_services/hospital.service';
import { catchError, forkJoin, of, tap } from 'rxjs';
import { SaldoService } from '../../../_services/saldo.service';

declare var bootstrap: any;

@Component({
  selector: 'app-recebimento-estoque',
  imports: [ReactiveFormsModule, CommonModule, RouterModule, PaginacaoComponent, FormsModule, NgxMaskDirective, NgxMaskPipe],
  templateUrl: './recebimento-estoque.component.html',
  styleUrl: './recebimento-estoque.component.scss'
})
export class RecebimentoEstoqueComponent implements OnInit {
  form!: FormGroup
  medicamentos: Medicamento[] = [];
  medicamentosFiltrados: Medicamento[] = [];
  medicamentoSelecionado?: Medicamento;
  MedicamentosPaginados: Medicamento[] = [];
  textoFiltroMedicamentos: string = '';
  paginaAtual = 1;
  medicamentosPorPagina = 5;
  modalMedicamentosInstance: any;
  modalHospitalInstance: any;
  recebimento?: RecebimentoMedicamento;
  hospitais: Hospital[] = [];
  hospitalSelecionado?: Hospital;


  constructor(private loader: NgxUiLoaderService,
    private toastr: ToastrService,
    private router: Router,
    private medicamentoService: MedicamentosService,
    private hospitalService: HospitalService,
    private saldoService: SaldoService
  ) {
    this.form = new FormGroup({
      hospital: new FormControl(null, Validators.required),
      medicamento: new FormControl(null, Validators.required),
      lote: new FormControl('', Validators.required),
      quantidade: new FormControl(null, [Validators.required, Validators.min(1)]),
      dataValidade: new FormControl('', Validators.required),
      dataRecebimento: new FormControl(new Date().toISOString().substring(0, 10), Validators.required),
      fornecedor: new FormControl('', Validators.required),
      cnpj: new FormControl('', [Validators.required, Validators.minLength(14), Validators.maxLength(14)]),
      notaFiscal: new FormControl(''),
      observacoes: new FormControl('')
    });


  }

  ngOnInit(): void {
    this.loader.start();

    forkJoin({
      hospitais: this.hospitalService.buscarHospitais().pipe(
        catchError(err => {
          this.toastr.error("Erro ao buscar hospitais");
          return of([]);
        })
      ),
      medicamentos: this.medicamentoService.buscarTodos().pipe(
        catchError(err => {
          this.toastr.error("Erro inesperado ao buscar medicamentos!");
          return of([]);
        })
      )
    }).subscribe({
      next: ({ hospitais, medicamentos }) => {
        this.hospitais = hospitais;
        this.medicamentos = medicamentos;

        this.configurarFormHospitais(hospitais); // método separado
        this.filtrarLista();

        this.loader.stop();
      },
      error: () => {
        this.toastr.error("Erro ao buscar dados iniciais");
        this.loader.stop();
      }
    });

    let modalEl = document.getElementById('modalMedicamentos');
    this.modalMedicamentosInstance = new bootstrap.Modal(modalEl);

    modalEl = document.getElementById('modalHospitais');
    this.modalHospitalInstance = new bootstrap.Modal(modalEl);
  }

  private configurarFormHospitais(hospitais: Hospital[]) {
    const hospitaisForm = this.form.get("hospitais") as FormGroup;
    if (!hospitaisForm) return;

    Object.keys(hospitaisForm.controls).forEach(key => {
      hospitaisForm.removeControl(key);
    });

    for (const hospital of hospitais) {
      hospitaisForm.addControl(
        hospital.id!,
        new FormControl(false)
      );
    }
  }

  paginarDados() {
    const inicio = (this.paginaAtual - 1) * this.medicamentosPorPagina;
    const fim = inicio + this.medicamentosPorPagina;
    this.MedicamentosPaginados = this.medicamentosFiltrados.slice(inicio, fim);

    this.loader.stop();
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
    const texto = this.textoFiltroMedicamentos.toLowerCase();

    this.medicamentosFiltrados = this.medicamentos.filter((dado) =>
      Object.entries(dado).some(([chave, valor]) => {
        let valorStr = '';

        if (typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor)) {
          valorStr = this.formatarData(valor);
        } else if (valor != null && typeof valor === 'object') {
          if ('nome' in valor && typeof valor['nome'] === 'string') {
            valorStr = valor['nome'];
          }
        } else if (valor != null) {
          valorStr = String(valor);
        }

        return valorStr.toLowerCase().includes(texto);
      })
    );

    this.medicamentosFiltrados = this.medicamentosFiltrados.filter(m => m.status == "ATIVO");

    this.paginarDados();
  }

  formatarData(dataIso: string): string {
    const [ano, mes, dia] = dataIso.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  selecionarMedicamento(medicamento: Medicamento) {
    this.medicamentoSelecionado = medicamento;
    this.form.get("medicamento")?.setValue(medicamento.nomeComercial);
    this.modalMedicamentosInstance.hide();
  }

  selecionarHospital(hospital: Hospital) {
    this.hospitalSelecionado = hospital;
    this.form.get("hospital")?.setValue(hospital.razaoSocial);
    this.modalHospitalInstance.hide();
  }

  submit() {
    // if (this.form.invalid) {
    //   this.form.markAsTouched();
    //   return;
    // }

    this.loader.start();

    const formData = this.form.value

    const recebimento: RecebimentoMedicamento = {
      hospitalId: this.hospitalSelecionado!.id!,
      medicamentoId: this.medicamentoSelecionado!.id!,
      lote: formData.lote,
      quantidade: formData.quantidade,
      dataValidade: formData.dataValidade,
      dataRecebimento: formData.dataRecebimento,
      fornecedor: formData.fornecedor,
      cnpj: formData.cnpj,
      notaFiscal: formData.notaFiscal,
      observacoes: formData.observacoes,
    }


    this.saldoService.receberMedicamento(recebimento).subscribe({
      next: (res) => {
        this.toastr.success(res);
        this.form.reset();
        this.loader.stop();
      },
      error: (error) => {
        this.toastr.error(error);
        this.loader.stop();
      }
    })

    this.loader.stop();
  }
}
