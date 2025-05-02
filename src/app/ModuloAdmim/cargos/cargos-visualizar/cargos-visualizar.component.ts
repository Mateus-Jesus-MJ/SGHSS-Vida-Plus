import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import { Cargo, Especialidade, RequisitosDoCargo } from '../../../_models/cargo';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CargosService } from '../../../_services/cargos.service';

@Component({
  selector: 'app-cargos-visualizar',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxMaskDirective, RouterModule],
  templateUrl: './cargos-visualizar.component.html',
  styleUrl: './cargos-visualizar.component.scss'
})
export class CargosVisualizarComponent implements OnInit {
  form!: FormGroup;
  cargo!: Cargo;
  especialidade: Especialidade[] = [];
  requisitos: RequisitosDoCargo[] = [];

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

}
