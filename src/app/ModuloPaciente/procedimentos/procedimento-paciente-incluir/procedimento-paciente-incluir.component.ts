import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProcedimentoService } from '../../../_services/procedimento.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { Procedimento } from '../../../_models/procedimento';
import { CommonModule } from '@angular/common';
import { PacienteService } from '../../../_services/paciente.service';
import { ProcedimentoProntuario } from '../../../_models/Paciente';

declare var bootstrap: any

@Component({
  selector: 'app-procedimento-paciente-incluir',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './procedimento-paciente-incluir.component.html',
  styleUrl: './procedimento-paciente-incluir.component.scss'
})
export class ProcedimentoPacienteIncluirComponent implements OnInit {
  form!: FormGroup;
  procedimentos: Procedimento[] = [];
  procedimentoSelecionado?: Procedimento;
  titleModal = "o procedimento";
  modalInstanceProcedimentos: any;


  constructor(
    private loader: NgxUiLoaderService,
    private toastr: ToastrService,
    private procedimentosService: ProcedimentoService,
    private pacienteService: PacienteService
  ) {
    this.form = new FormGroup({
      procedimento: new FormControl('', Validators.required),
      data: new FormControl('', Validators.required),
      horario: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
    this.loader.start();
    this.procedimentosService.buscarProcedimentos().subscribe({
      next: (procedimentos: Procedimento[]) => {
        this.procedimentos = procedimentos;
        this.loader.stop();
      },
      error: () => {
        this.toastr.error("Erro ao buscar procedimentos, se o problema persistir procure o administrador do sistema", "", { progressBar: true });
        this.loader.stop();
      }
    })

    const modalEl = document.getElementById('modalProcedimentos');
    this.modalInstanceProcedimentos = new bootstrap.Modal(modalEl);
  }

  selecioparProcedimento(procedimento: Procedimento) {
    this.procedimentoSelecionado = procedimento;
    this.form.get("procedimento")?.setValue(procedimento.nome)
    this.modalInstanceProcedimentos.hide();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return
    }
    this.loader.start();

    const formData = this.form.value;

    const procedimento: ProcedimentoProntuario = {
      data: formData.data + ' ' + formData.horario,
      procedimento: this.procedimentoSelecionado!,
      status: 'MARCADO',
    }

    this.pacienteService.novoProcedimentoPaciente(procedimento).subscribe({
      next: (res) => {
        this.toastr.success(res);
        this.form.reset();
        this.procedimentoSelecionado = undefined;
        this.loader.stop();
      },
      error: (error) => {
        this.toastr.error(error);
        this.loader.stop();
      }
    })
  }
}
