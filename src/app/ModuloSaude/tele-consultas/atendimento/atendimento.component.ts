import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-atendimento',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './atendimento.component.html',
  styleUrl: './atendimento.component.scss'
})
export class AtendimentoComponent {
  form!: FormGroup;


   constructor(){
    this.form = new FormGroup({});
   }

  submit() { }

}
