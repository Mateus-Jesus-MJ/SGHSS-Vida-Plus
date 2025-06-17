import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CargosService } from '../../../_services/cargos.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-incluir-medicamento',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './incluir-medicamento.component.html',
  styleUrl: './incluir-medicamento.component.scss'
})
export class IncluirMedicamentoComponent {
  form!: FormGroup;
  formasFarmaceuticas = ['Comprimido', 'Solução Oral', 'Injetável', 'Pomada'];
  viasAdministracao = ['Oral', 'Intravenosa', 'Tópica', 'Sublingual'];

  constructor(
    private routeAcitive: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private ngxUiLoaderService: NgxUiLoaderService
  ) {
    this.form = new FormGroup({
      ean: new FormControl('', [Validators.required,Validators.pattern(/^\d{13}$/)]),
      nomeComercial: new FormControl('', [Validators.required,Validators.minLength(3)]),
      nomeGenerico: new FormControl('', [Validators.required, Validators.minLength(3) ]),
      formaFarmaceutica: new FormControl('', Validators.required),
      dosagem: new FormControl('', Validators.required),
      viaAdministracao: new FormControl('', Validators.required),
      apresentacao: new FormControl('', Validators.required),
      fabricante: new FormControl('', Validators.required),
      registroAnvisa: new FormControl('', [ Validators.required, Validators.pattern(/^\d{8,}$/)]),
      tarja: new FormControl('ISENTO', Validators.required),
      controlado: new FormControl('NÃO', Validators.required),
      status: new FormControl('ATIVO', Validators.required),
      observacoes: new FormControl('')
    });
  }


  submit() {

  }
}
