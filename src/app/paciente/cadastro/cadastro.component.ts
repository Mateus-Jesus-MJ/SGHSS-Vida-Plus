import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cadastro',
  imports: [RouterModule],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.scss'
})
export class CadastroComponent {
  cadastroForm!: FormGroup;


submit(){

}

navigate(rota: string){

}

}
