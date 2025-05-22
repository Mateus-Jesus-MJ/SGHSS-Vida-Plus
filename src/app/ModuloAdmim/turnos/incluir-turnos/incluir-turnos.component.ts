import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { eachDayOfInterval, startOfMonth, endOfMonth, format } from 'date-fns';


@Component({
  selector: 'app-incluir-turnos',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './incluir-turnos.component.html',
  styleUrl: './incluir-turnos.component.scss'
})
export class IncluirTurnosComponent {
form: FormGroup;
  dias: Date[] = [];
  meses = [
    { nome: 'Janeiro', valor: 0 },
    { nome: 'Fevereiro', valor: 1 },
    { nome: 'Março', valor: 2 },
    { nome: 'Abril', valor: 3 },
    { nome: 'Maio', valor: 4 },
    { nome: 'Junho', valor: 5 },
    { nome: 'Julho', valor: 6 },
    { nome: 'Agosto', valor: 7 },
    { nome: 'Setembro', valor: 8 },
    { nome: 'Outubro', valor: 9 },
    { nome: 'Novembro', valor: 10 },
    { nome: 'Dezembro', valor: 11 },
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      mes: [new Date().getMonth()],
      ano: [new Date().getFullYear()],

      turnos: this.fb.array([])
    });
  }

  get turnos(): FormArray {
    return this.form.get('turnos') as FormArray;
  }

  gerarTabela(): void {
    const mes = this.form.value.mes;
    const ano = this.form.value.ano;
    this.dias = eachDayOfInterval({
      start: startOfMonth(new Date(ano, mes)),
      end: endOfMonth(new Date(ano, mes))
    });

    this.turnos.clear();
    for (const dia of this.dias) {
      this.turnos.push(this.fb.group({
        data: [format(dia, 'yyyy-MM-dd')],
        inicio: [''],
        inicioIntervalo: [''],
        terminoIntervalo: [''],
        termino: ['']
      }));
    }
  }

  salvar(): void {
    console.log(this.form.value);
  }
}
