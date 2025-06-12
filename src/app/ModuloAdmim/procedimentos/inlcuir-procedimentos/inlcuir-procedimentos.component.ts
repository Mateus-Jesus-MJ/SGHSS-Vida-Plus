import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-inlcuir-procedimentos',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './inlcuir-procedimentos.component.html',
  styleUrl: './inlcuir-procedimentos.component.scss'
})
export class InlcuirProcedimentosComponent{
  form!: FormGroup

  constructor(
    private loader: NgxUiLoaderService,
    private toastr : ToastrService,
    // private
  ) {
    this.form = new FormGroup({
      nome: new FormControl('', [Validators.required]),
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
    if(!this.form.valid){
      this.form.markAllAsTouched();
      return
    }

    this.loader.start();
    this.loader.stop();
  }

}
