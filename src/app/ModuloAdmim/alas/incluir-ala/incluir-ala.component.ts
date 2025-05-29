import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Hospital } from '../../../_models/Hospital';

@Component({
  selector: 'app-incluir-ala',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxMaskDirective, RouterModule, NgxMaskPipe],
  templateUrl: './incluir-ala.component.html',
  styleUrl: './incluir-ala.component.scss'
})
export class IncluirAlaComponent {
  form!: FormGroup;
  hospitaisSelecionados : Hospital[] = [];
  hospitais: Hospital[] = [];

  constructor(private routeAcitive: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private loader: NgxUiLoaderService,

  ) {
    this.form = new FormGroup({
      nome: new FormControl('', Validators.required),
      responsavel: new FormControl('', Validators.required),
    });
  }

  validaResponsavel() {

  }


  submit() {

  }
}
