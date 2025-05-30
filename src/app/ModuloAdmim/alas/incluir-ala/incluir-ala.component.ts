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
import { Colaborador } from '../../../_models/colaborador';
import { catchError, forkJoin, of, tap } from 'rxjs';
import { Ala } from '../../../_models/ala';
import { AlasService } from '../../../_services/alas.service';

declare var bootstrap: any; // se não tiver typings do bootstrap

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
  colaboradores: Colaborador[] = [];
  responsavel?: Colaborador;
  modalContext: { origem: 'input' | 'tabela', hospitalId?: string } | null = null;
  modalColaboradoresInstance: any;

  constructor(private routeAcitive: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private loader: NgxUiLoaderService,
    private hospitalService: HospitalService,
    private colaboradorService: ColaboradorService,
    private alasService: AlasService
  ) {
    this.form = new FormGroup({
      nome: new FormControl('', Validators.required),
      responsavel: new FormControl('', Validators.required),
      hospitais: new FormGroup({}),
    });
  }

  ngOnInit(): void {
    this.loader.start();

    forkJoin({
      hospitais: this.buscarHospitais(),
      colaboradores: this.buscarColabodores()
    }).subscribe({
      next: ({ hospitais, colaboradores }) => {
        this.colaboradores = colaboradores;
        this.hospitais = hospitais;
        this.loader.stop();
      },
      error: () => {
        this.toastr.error("Erro ao buscar dados iniciais");
        this.loader.stop();
      }
    });

    const modalEl = document.getElementById('modalColaboradores');
    this.modalColaboradoresInstance = new bootstrap.Modal(modalEl);
  }

  buscarColabodores() {
    return this.colaboradorService.buscarColaboradoresComCargo().pipe(
      catchError(err => {
        this.toastr.error("Erro inesperado ao buscar colaboradores!");
        return of([]);
      })
    );
  }

  buscarHospitais() {
    return this.hospitalService.buscarHospitais().pipe(
      catchError(err => {
        this.toastr.error("Erro ao buscar hospitais");
        return of([]);
      }),
      tap((hospitais: Hospital[]) => {
        const hospitaisForm = this.form.get("hospitais") as FormGroup;

        Object.keys(hospitaisForm.controls).forEach(key => {
          hospitaisForm.removeControl(key);
        });

        for (const hospital of hospitais) {
          hospitaisForm.addControl(
            hospital.id!,
            new FormControl(false)
          );
          hospitaisForm.addControl(
            'responsavel' + hospital.id!,
            new FormControl('')
          );
        }
        this.hospitais = hospitais;
      })
    );
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

  removerHospital(hospital: Hospital) {
    this.loader.start();
    this.hospitaisSelecionados = this.hospitaisSelecionados.filter(e => e.cnpj !== hospital.cnpj && e.id !== hospital.id);
    this.loader.stop();
  }

   abrirModalColaboradores(origem: 'input' | 'tabela', hospitalId?: string) {
    this.modalContext = { origem, hospitalId };
    this.modalColaboradoresInstance.show();
  }

 selecionarColaborador(colaborador: any) {
    if(this.modalContext?.origem === 'input') {
      this.form.get('responsavel')?.setValue(colaborador.nome);
    } else if(this.modalContext?.origem === 'tabela' && this.modalContext.hospitalId) {
      this.atualizarResponsavelHospital(this.modalContext.hospitalId, colaborador.nome);
    }
    this.modalColaboradoresInstance.hide();
  }

  atualizarResponsavelHospital(hospitalId: string, nomeResponsavel: string) {
    const hospital = this.hospitaisSelecionados.find(h => h.id === hospitalId);
    if (hospital) {
      hospital.idDiretor = nomeResponsavel;
      this.form.get("responsavel"+ hospital!.id!)?.setValue(nomeResponsavel);
    }
  }


  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return
    }

    this.loader.start();

    const ala: Ala = {
      nome: this.form.get("nome")?.value.toUpperCase(),
      idResponsavel: this.responsavel?.id,
      status: true,
      hospitais: this.hospitaisSelecionados
    }

    this.alasService.novaAla(ala).subscribe({
      next: (res) => {
        this.toastr.success(res);
        this.form.reset();
        this.hospitaisSelecionados = [];
        this.loader.stop();
      },
      error: (error) => {
        this.toastr.error(error);
        this.loader.stop();
      }
    });


    this.loader.stop();
  }
}
