import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Hospital } from '../../../_models/Hospital';
import { Ala } from '../../../_models/ala';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { HospitalService } from '../../../_services/hospital.service';
import { LeitosService } from '../../../_services/leitos.service';
import { Leito } from '../../../_models/leito';
import { CommonModule } from '@angular/common';
import { NgxMaskPipe } from 'ngx-mask';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';


declare var bootstrap: any;

@Component({
  selector: 'app-editar-leito',
  imports: [CommonModule, NgxMaskPipe, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './editar-leito.component.html',
  styleUrl: './editar-leito.component.scss'
})
export class EditarLeitoComponent implements OnInit {
  form!: FormGroup;
  leito!: Leito;
  hospitalSelecionado?: Hospital;
  hospitais: Hospital[] = [];
  alas: Ala[] = [];
  alaSelecionada?: Ala;
  modalInstanceHospital: any;
  modalInstanceAla: any;


  constructor(
    private loader: NgxUiLoaderService,
    private toastr: ToastrService,
    private router: Router,
    private routeAcitive: ActivatedRoute,
    private hospitalService: HospitalService,
    private leitosService: LeitosService
  ) {
    this.form = new FormGroup({
      codigo: new FormControl('', Validators.required),
      descricao: new FormControl('', Validators.required),
      hospital: new FormControl('', Validators.required),
      ala: new FormControl('', Validators.required),
      status: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {

    this.loader.start();
    this.routeAcitive.paramMap.subscribe(params => {
      const id = params.get('id')!;

      if (id == null || id == "") {
        this.toastr.error("Hospital não encontrado");
        this.router.navigateByUrl('admin/hospitais');
        this.loader.stop();
        return
      }

      this.leitosService.buscarPorId(id).subscribe(
        (leito) => {
          if (leito) {
            this.leito = leito;
            this.populateForm(leito);
          }
        }
      );
    });


    const modalHospitais = document.getElementById('modalHospitais');
    if (modalHospitais) {
      this.modalInstanceHospital = new bootstrap.Modal(modalHospitais);
    }

    const modalAlas = document.getElementById('modalAlas');
    if (modalAlas) {
      this.modalInstanceAla = new bootstrap.Modal(modalAlas);
    }

  }

  private populateForm(leito: Leito): void {
    this.form.patchValue({
      codigo: leito.codigo,
      descricao: leito.descricao,
      hospital: leito.hospital!.razaoSocial ?? '',
      ala: leito.ala!.nome ?? '',
      status: leito.status
    });

    this.alaSelecionada = leito.ala;
    this.hospitalSelecionado = leito.hospital;

    this.buscarHospitais();
  }

  buscarHospitais() {
    this.hospitalService.buscarHospitais().subscribe({
      next: (hospitais: Hospital[]) => {
        this.hospitais = hospitais;
        this.loader.stop();
      },
      error: () => {
        this.toastr.error("Erro ao buscar Hospitais, reccarregue a tela e tente novamente", "", { progressBar: true });
        this.loader.stop();
      }
    });
  }

  selecionarHospital(hospital: Hospital) {
    this.loader.startBackground();
    this.hospitalSelecionado = hospital;
    this.form.get("hospital")?.setValue(hospital.razaoSocial);
    this.alas = hospital.alas ?? [];
    this.loader.stopBackground();
    this.modalInstanceHospital.hide();
  }

  selecionarAla(ala: Ala) {
    this.alaSelecionada = ala;
    this.form.get("ala")?.setValue(ala.nome);
    this.modalInstanceAla.hide();
  }

  submit() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return
    }

    this.loader.start();
    const form = this.form.value;

    const leito: Leito = {
      id: this.leito.id,
      codigo: form.codigo.toUpperCase(),
      descricao: form.descricao.toUpperCase(),
      idHospital: this.hospitalSelecionado!.id!,
      idAla: this.alaSelecionada!.id!,
      status: 'Disponivel',
      equipamentos: [],
      usuarioCriacao : this.leito.usuarioCriacao,
      momentoCriacao : this.leito.momentoCriacao
    }

    this.leitosService.editar(leito).subscribe({
      next: (res) => {
        this.toastr.success(res);
        this.loader.stop();
      },
      error: (error) => {
        this.toastr.error(error);
        this.loader.stop();
      }
    })
  }
}


