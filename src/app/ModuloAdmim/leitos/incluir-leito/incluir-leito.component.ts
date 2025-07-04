import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxMaskPipe } from 'ngx-mask';
import { Hospital } from '../../../_models/Hospital';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { HospitalService } from '../../../_services/hospital.service';
import { Ala } from '../../../_models/ala';
import { PaginacaoComponent } from "../../_components/paginacao/paginacao.component";
import { Leito } from '../../../_models/leito';
import { LeitosService } from '../../../_services/leitos.service';

declare var bootstrap: any;

@Component({
  selector: 'app-incluir-leito',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, NgxMaskPipe, PaginacaoComponent],
  templateUrl: './incluir-leito.component.html',
  styleUrl: './incluir-leito.component.scss'
})
export class IncluirLeitoComponent implements OnInit {
  form!: FormGroup;
  hospitalSelecionado?: Hospital;
  hospitais: Hospital[] = [];
  alas: Ala[] = [];
  alaSelecionada?: Ala;
  modalInstanceHospital: any;
  modalInstanceAla: any;


  constructor(
    private loader: NgxUiLoaderService,
    private toastr: ToastrService,
    private hospitalService: HospitalService,
    private leitosService: LeitosService
  ) {
    this.form = new FormGroup({
      codigo: new FormControl('', Validators.required),
      descricao: new FormControl('', Validators.required),
      hospital: new FormControl('', Validators.required),
      ala: new FormControl('', Validators.required),
    });
  }
  ngOnInit(): void {
    this.loader.start();
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

    let modalEl = document.getElementById('modalHospitais');
    this.modalInstanceHospital = new bootstrap.Modal(modalEl);

    modalEl = document.getElementById('modalAlas');
    this.modalInstanceAla = new bootstrap.Modal(modalEl);
  }

  selecionarHospital(hospital: Hospital) {
    this.loader.startBackground();
    this.hospitalSelecionado = hospital;
    this.form.get("hospital")?.setValue(hospital.razaoSocial);
    this.alas = hospital.alas ?? [];
    this.loader.stopBackground();
    this.modalInstanceHospital.hide();
  }

  selecionarAla(ala: Ala){
    this.alaSelecionada = ala;
    this.form.get("ala")?.setValue(ala.nome);
    this.modalInstanceAla.hide();
  }

  submit() {
    if(!this.form.valid){
      this.form.markAllAsTouched();
      return
    }

    this.loader.start();

    const form =  this.form.value;
    
    const leito : Leito = {
      codigo : form.codigo.toUpperCase(),
      descricao : form.descricao.toUpperCase(),
      idHospital: this.hospitalSelecionado!.id!,
      idAla: this.alaSelecionada!.id!,
      status: 'Disponivel',
      equipamentos : []
    }

    this.leitosService.incluir(leito).subscribe({
       next: (res) => {
        this.toastr.success(res);
        this.form.reset();
        this.hospitalSelecionado = undefined;
        this.alas = [];
        this.alaSelecionada = undefined;
        this.loader.stop();
      },
      error: (error) => {
        this.toastr.error(error);
        this.loader.stop();
      }
    })
  }
}

