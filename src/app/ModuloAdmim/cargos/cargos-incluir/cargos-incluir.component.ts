import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { showAlert } from '../../../_util.ts/sweetalert-util';
import { Cargo, Especialidade, RequisitosDoCargo } from '../../../_models/cargo';
import { CargosService } from '../../../_services/cargos.service';
import { environment } from '../../../../environments/environment.development';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cargos-incluir',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxMaskDirective, RouterModule],
  templateUrl: './cargos-incluir.component.html',
  styleUrl: './cargos-incluir.component.scss'
})
export class CargosIncluirComponent {
  form!: FormGroup;
  especialidadesIncluir: Especialidade[] = [];
  requisitosIncluir: RequisitosDoCargo[] = [];
  opcoesEscolaridade = environment.niveisDeEscolaridade;
  textHtmlIncluirEspecialidade = `<div class="form-floating mb-3">
                                    <input type="text" class="form-control text-uppercase" id="especialidade" placeholder="">
                                    <label for="especialidade">Especialidade</label>
                                  </div>`
  textHtmlIncluirRequisito = `<div class="form-floating mb-3">
                                    <input type="text" class="form-control text-uppercase" id="requisito" placeholder="">
                                    <label for="requisito">Requisito</label>
                                  </div>`

  constructor(private routeAcitive: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private ngxUiLoaderService: NgxUiLoaderService,
    private cargosService: CargosService
  ) {
    this.form = new FormGroup({
      cargo: new FormControl('', Validators.required),
      salarioBase: new FormControl('', [Validators.required, Validators.min(1000)]),
      descricaoDeFuncao: new FormControl('', Validators.required),
      escolaridade: new FormControl('', Validators.required)
    });
  }

  incluirEspecialidade() {
    showAlert('Especialidades do cargo', this.textHtmlIncluirEspecialidade, 'info')
      .then((result) => {
        if (result.isConfirmed && result.value) {
          this.ngxUiLoaderService.startBackground();

          const inputEl = document.getElementById('especialidade') as HTMLInputElement;
          if (inputEl.value != "" && !this.especialidadesIncluir.some(e => e.especialidade === inputEl.value.toUpperCase())) {

            const nova: Especialidade = { especialidade: inputEl.value.toUpperCase() };
            this.especialidadesIncluir.push(nova);
          }

          this.ngxUiLoaderService.stopBackground();
        }
      });
  }

  removerEspecialidade(especialidade: string) {
    this.especialidadesIncluir =
      this.especialidadesIncluir.filter(e => e.especialidade !== especialidade);
  }

  incluirRequisitos() {
    showAlert('Requisitos do cargo', this.textHtmlIncluirRequisito, 'info')
      .then((result) => {
        if (result.isConfirmed && result.value) {

          this.ngxUiLoaderService.startBackground();

          const inputEl = document.getElementById('requisito') as HTMLInputElement;
          if (inputEl.value.toUpperCase() != "" && !this.requisitosIncluir.some(e => e.requisito === inputEl.value.toUpperCase())) {
            const nova: RequisitosDoCargo = { requisito: inputEl.value.toUpperCase() };
            this.requisitosIncluir.push(nova);
          }

          this.ngxUiLoaderService.stopBackground();
        }
      });
  }

  removerRequisito(requisito: string) {
    this.requisitosIncluir =
      this.requisitosIncluir.filter(e => e.requisito !== requisito);
  }


  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return
    }

    this.ngxUiLoaderService.start();

    const formData = this.form.value;

    formData.cargo = formData.cargo.toUpperCase();
    formData.descricaoDeFuncao = formData.descricaoDeFuncao.toUpperCase();
    formData.escolaridade = formData.escolaridade.toUpperCase();

    const cargoIncluir: Cargo = {
      cargo: formData.cargo,
      escolaridade: formData.escolaridade,
      descricaoDeFuncao: formData.descricaoDeFuncao,
      salarioBase: formData.salarioBase,
      requisitosDoCargo: this.requisitosIncluir,
      especialidade: this.especialidadesIncluir
    }

    this.cargosService.novoCargo(cargoIncluir).subscribe({
      next: (res) => {
        this.toastr.success(res);
        this.form.reset();
        this.especialidadesIncluir = [];
        this.requisitosIncluir = [];
        this.ngxUiLoaderService.stop();
      },
      error: (error) => {
        this.toastr.error(error);
        this.ngxUiLoaderService.stop();
      }
    });
  }

}
