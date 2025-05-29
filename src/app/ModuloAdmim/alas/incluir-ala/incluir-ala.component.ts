import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Hospital } from '../../../_models/Hospital';
import { HospitalService } from '../../../_services/hospital.service';
import { ColaboradorService } from '../../../_services/colaborador.service';

@Component({
  selector: 'app-incluir-ala',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, NgxMaskPipe],
  templateUrl: './incluir-ala.component.html',
  styleUrl: './incluir-ala.component.scss'
})
export class IncluirAlaComponent implements OnInit {
  form!: FormGroup;
  hospitaisSelecionados: Hospital[] = [];
  hospitais: Hospital[] = [];

  constructor(private routeAcitive: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private loader: NgxUiLoaderService,
    private hospitalService: HospitalService,
    private colaboradorService: ColaboradorService

  ) {
    this.form = new FormGroup({
      nome: new FormControl('', Validators.required),
      responsavel: new FormControl('', Validators.required),
      hospitais: new FormGroup({}),
    });
  }

  ngOnInit(): void {
    this.loader.start();

    this.hospitalService.buscarHospitais().subscribe({
      next: (hospitais: Hospital[]) => {
        const hospitaisForm = this.form.get("hospitais") as FormGroup;

        // Remove controles antigos, se houver
        Object.keys(hospitaisForm.controls).forEach(key => {
          hospitaisForm.removeControl(key);
        });

        // Adiciona um controle para cada hospital com a chave sendo o ID
        for (const hospital of hospitais) {
          hospitaisForm.addControl(
            hospital.id!, // chave do controle
            new FormControl(false)  // valor inicial: não selecionado
          );
        }

        // Armazena a lista de hospitais para mostrar no HTML
        this.hospitais = hospitais;

        this.loader.stop();
      },
      error: () => {
        this.toastr.error("Erro ao buscar hospitais");
        this.loader.stop();
      }
    });
  }

  validaResponsavel() {

  }

  get hospitaisForm(): FormGroup {
    return this.form.get('hospitais') as FormGroup;
  }

  selecionarHospitais(): void {
    this.loader.start();
    const selecionados: Hospital[] = this.hospitais.filter(hospital => {
      const control = this.hospitaisForm.get(hospital.id!.toString());
      return control?.value === true;
    });

    this.hospitaisSelecionados = selecionados;
    this.loader.stop();
  }


  submit() {

  }
}
