import { Component, OnInit } from '@angular/core';
import { Cargo, Especialidade, RequisitosDoCargo } from '../../../_models/cargo';
import { showAlert } from '../../../_util.ts/sweetalert-util';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CargosService } from '../../../_services/cargos.service';
import { CommonModule } from '@angular/common';
import { NgxMaskDirective } from 'ngx-mask';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-cargos-editar',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxMaskDirective, RouterModule],
  templateUrl: './cargos-editar.component.html',
  styleUrl: './cargos-editar.component.scss'
})
export class CargosEditarComponent implements OnInit {
  form!: FormGroup;
  cargo!: Cargo;
  especialidade: Especialidade[] = [];
  requisitos: RequisitosDoCargo[] = [];
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

  ngOnInit(): void {
    this.ngxUiLoaderService.start();
    this.routeAcitive.paramMap.subscribe(params => {
      const id = params.get('id')!;

      if (id == null || id == "") {
        this.toastr.error("Cargo não encontrado!");
        this.router.navigateByUrl("admin/cargos");
        this.ngxUiLoaderService.stop();
        return
      }
      this.buscarDadosDoCargo(id);
    });
  }

  buscarDadosDoCargo(id: string) {
    this.cargosService.buscarCargoPorId(id).subscribe(
      (cargo) => {
        if (cargo) {
          this.cargo = cargo;
          this.populateForm(cargo);
        } else {
          this.toastr.error("Cargo não encontrado. Verifique o id informado e tente novamente\n se o problema persistir procure o administrador do sistema", "", { "progressBar": true });
          this.ngxUiLoaderService.stop();
        }
      }
    )
  }

  private populateForm(cargo: Cargo): void {
    this.form.patchValue({
      cargo: cargo.cargo,
      salarioBase: cargo.salarioBase,
      descricaoDeFuncao: cargo.descricaoDeFuncao,
      escolaridade: cargo.escolaridade
    });
    this.especialidade = cargo.especialidade || [];
    this.requisitos = cargo.requisitosDoCargo || [];
    this.ngxUiLoaderService.stop();
  }


  incluirEspecialidade() {
    showAlert('Especialidades do cargo', this.textHtmlIncluirEspecialidade, 'info')
      .then((result) => {
        if (result.isConfirmed && result.value) {
          this.ngxUiLoaderService.startBackground();

          const inputEl = document.getElementById('especialidade') as HTMLInputElement;
          if (inputEl.value != "" && !this.especialidade.some(e => e.especialidade === inputEl.value.toUpperCase())) {

            const nova: Especialidade = { especialidade: inputEl.value.toUpperCase() };
            this.especialidade.push(nova);
          }

          this.ngxUiLoaderService.stopBackground();
        }
      });
  }

  removerEspecialidade(especialidade: string) {
    this.especialidade =
      this.especialidade.filter(e => e.especialidade !== especialidade);
  }

  incluirRequisitos() {
    showAlert('Requisitos do cargo', this.textHtmlIncluirRequisito, 'info')
      .then((result) => {
        if (result.isConfirmed && result.value) {

          this.ngxUiLoaderService.startBackground();

          const inputEl = document.getElementById('requisito') as HTMLInputElement;
          if (inputEl.value.toUpperCase() != "" && !this.requisitos.some(e => e.requisito === inputEl.value.toUpperCase())) {
            const nova: RequisitosDoCargo = { requisito: inputEl.value.toUpperCase() };
            this.requisitos.push(nova);
          }

          this.ngxUiLoaderService.stopBackground();
        }
      });
  }

  removerRequisito(requisito: string) {
    this.requisitos =
      this.requisitos.filter(e => e.requisito !== requisito);
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

    const cargoEditar: Cargo = {
      id: this.cargo.id!,
      cargo: formData.cargo,
      escolaridade: formData.escolaridade,
      descricaoDeFuncao: formData.descricaoDeFuncao,
      salarioBase: formData.salarioBase,
      requisitosDoCargo: this.requisitos,
      especialidade: this.especialidade
    }

    this.cargosService.editarCargo(cargoEditar).subscribe({
      next: (res) => {
        this.toastr.success(res);
        this.buscarDadosDoCargo(this.cargo.id!);
        this.ngxUiLoaderService.stop();
      },
      error: (error) => {
        this.toastr.error(error);
        this.ngxUiLoaderService.stop();
      }
    });
  }
}
