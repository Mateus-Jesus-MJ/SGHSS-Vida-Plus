import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxMaskPipe } from 'ngx-mask';
import { Ala } from '../../../_models/ala';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AlasService } from '../../../_services/alas.service';
import { catchError, forkJoin, of, tap } from 'rxjs';
import { Hospital } from '../../../_models/Hospital';
import { Colaborador } from '../../../_models/colaborador';
import { HospitalService } from '../../../_services/hospital.service';
import { ColaboradorService } from '../../../_services/colaborador.service';

declare var bootstrap: any;

@Component({
  selector: 'app-editar-ala',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxMaskPipe, RouterModule],
  templateUrl: './editar-ala.component.html',
  styleUrl: './editar-ala.component.scss'
})
export class EditarAlaComponent implements OnInit {
  form!: FormGroup;
  ala!: Ala;
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
    private alaService: AlasService,
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

    this.routeAcitive.paramMap.subscribe(params => {
      const id = params.get('id');

      if (id == null || id == "") {
        this.toastr.error("Ala não encontrada", "", { progressBar: true });
        this.router.navigateByUrl("admin/alas");
        this.loader.stop();
        return
      }

      forkJoin({
        hospitais: this.buscarHospitais(),
        colaboradores: this.buscarColabodores(),
        ala: this.buscarAla(id)
      }).subscribe({
        next: ({ hospitais, colaboradores, ala }) => {
          this.colaboradores = colaboradores;
          this.hospitais = hospitais;
          this.ala = ala;
          this.populateForm(ala);
          this.loader.stop();
        },
        error: () => {
          this.toastr.error("Erro ao buscar os dados inicais", "", { progressBar: true });
          this.loader.stop();
        }
      })
      const modalEl = document.getElementById('modalColaboradores');
      this.modalColaboradoresInstance = new bootstrap.Modal(modalEl);
    })
  }


  buscarAla(id: string) {
    return this.alaService.buscarAlaPorId(id).pipe(
      catchError(err => {
        this.toastr.error("Erro inesperado ao buscar ala!");
        return of();
      })
    );
  }

  populateForm(ala: Ala) {
    this.form.patchValue({
      nome: ala.nome,
      responsavel: ala.responsavel?.nome
    });

    this.hospitaisSelecionados = ala.hospitais!
    this.responsavel = ala.responsavel;
    this.marcarHospitaisDaAlaNoFormulario(this.hospitaisSelecionados);
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

  marcarHospitaisDaAlaNoFormulario(hospitaisSelecionados : Hospital[]): void {
  const hospitaisForm = this.form.get("hospitais") as FormGroup;

  if (!hospitaisSelecionados || hospitaisSelecionados.length === 0) return;

  const hospitaisDaAla = new Set(hospitaisSelecionados.map(h => h.id));

  for (const hospital of this.hospitais) {
    const marcado = hospitaisDaAla.has(hospital.id);

    if (!hospitaisForm.contains(hospital.id!)) {
      hospitaisForm.addControl(hospital.id!, new FormControl(marcado));
    } else {
      hospitaisForm.get(hospital.id!)?.setValue(marcado);
    }

    const hospitalNaAla = hospitaisSelecionados.find(h => h.id === hospital.id);
  }
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

    this.marcarHospitaisDaAlaNoFormulario(this.hospitaisSelecionados);
  }

  abrirModalColaboradores(origem: 'input' | 'tabela', hospitalId?: string) {
    this.modalContext = { origem, hospitalId };
    this.modalColaboradoresInstance.show();
  }

  selecionarColaborador(colaborador: any) {
    if (this.modalContext?.origem === 'input') {
      this.form.get('responsavel')?.setValue(colaborador.nome);
    } else if (this.modalContext?.origem === 'tabela' && this.modalContext.hospitalId) {
      this.atualizarResponsavelHospital(this.modalContext.hospitalId, colaborador.nome);
    }
    this.modalColaboradoresInstance.hide();
  }

  atualizarResponsavelHospital(hospitalId: string, nomeResponsavel: string) {
    const hospital = this.hospitaisSelecionados.find(h => h.id === hospitalId);
    if (hospital) {
      hospital.idDiretor = nomeResponsavel;
      this.form.get("responsavel" + hospital!.id!)?.setValue(nomeResponsavel);
    }
  }


  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return
    }

    this.loader.start();

    this.ala.nome = this.form.get("nome")?.value.toUpperCase();
    this.ala.idResponsavel = this.responsavel?.id;
    this.ala.hospitais = this.hospitaisSelecionados;

    this.alaService.editarAla(this.ala).subscribe({
       next: (res) => {
        this.toastr.success(res);
        this.populateForm(this.ala);
        this.loader.stop();
      },
      error: (error) => {
        this.toastr.error(error);
        this.loader.stop();
      }
    });
  }
}
