import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ProcedimentoService } from '../../../_services/procedimento.service';
import { Procedimento } from '../../../_models/procedimento';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-inlcuir-procedimentos',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './inlcuir-procedimentos.component.html',
  styleUrl: './inlcuir-procedimentos.component.scss'
})
export class InlcuirProcedimentosComponent {
  form!: FormGroup

  constructor(
    private loader: NgxUiLoaderService,
    private toastr: ToastrService,
    private procedimentoService: ProcedimentoService,
  ) {
    this.form = new FormGroup({
      nome: new FormControl('', [Validators.required]),
      tempoDuracao: new FormControl('', [Validators.required]),
      funcionamento: new FormArray(this.criarDiasDaSemana())
    });
  }

  criarDiasDaSemana(): FormGroup[] {
    const dias = [
      { nome: 'Domingo', numero: 0 },
      { nome: 'Segunda-feira', numero: 1 },
      { nome: 'Terça-feira', numero: 2 },
      { nome: 'Quarta-feira', numero: 3 },
      { nome: 'Quinta-feira', numero: 4 },
      { nome: 'Sexta-feira', numero: 5 },
      { nome: 'Sábado', numero: 6 }
    ];

    return dias.map(dia =>
      new FormGroup({
        diaDaSemana: new FormControl(dia.nome, Validators.required),
        numeroDiaDaSemana: new FormControl(dia.numero, Validators.required),
        inicio: new FormControl(''),
        inicioIntervalo: new FormControl(''),
        terminoIntervalo: new FormControl(''),
        termino: new FormControl('')
      })
    );
  }

  get funcionamento(): FormArray {
    return this.form.get('funcionamento') as FormArray;
  }


  submit() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return
    }

    this.loader.start();

    const formData = this.form.value;

    const procedimento: Procedimento = {
      nome: formData.nome.toUpperCase(),
      tempoDuracao: formData.tempoDuracao,
      funcionamento: formData.funcionamento
        .filter((dia: any) => {
          if (!dia.inicio || !dia.termino || dia.inicio >= dia.termino) return false;

          if (dia.inicioIntervalo && dia.terminoIntervalo) {
            return dia.inicioIntervalo <= dia.terminoIntervalo;
          }

          return true;
        })
        .map((dia: any) => ({
          diaSemana: dia.diaDaSemana,
          numeroDiaSemana: dia.numeroDiaDaSemana,
          horarioInicio: dia.inicio,
          horarioInicioIntervalo: dia.inicioIntervalo,
          horarioTerminoIntervalo: dia.terminoIntervalo,
          horarioTermino: dia.termino,
          numeroAtendimento: ''
        }))
    };

    this.procedimentoService.novoProcedimento(procedimento).subscribe({
      next: (res: any) => {
        this.form.reset();
        this.toastr.success(res);
        this.loader.stop();
      },
      error: (err: any) => {
        this.toastr.error(err.message);
        this.loader.stop();
      }
    });
  }

}
