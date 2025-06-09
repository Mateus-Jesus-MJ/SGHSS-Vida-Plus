import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ColaboradorService } from '../../../_services/colaborador.service';
import { ToastrService } from 'ngx-toastr';
import { Especialidade } from '../../../_models/cargo';
import { Colaborador } from '../../../_models/colaborador';
import { Select2Directive } from '../../../_components/select2/select2.directive';

@Component({
  selector: 'app-incluir-consultas-paciente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, Select2Directive],
  templateUrl: './incluir-consultas-paciente.component.html',
  styleUrls: ['./incluir-consultas-paciente.component.scss']
})
export class IncluirConsultasPacienteComponent implements OnInit {
  form!: FormGroup;
  step = 1;
  submitted = false;
  progress = 0;
  especialidades: Especialidade[] = [];
  medicos: Colaborador[] = [];
  datas: string[] = [];



  constructor(
    private loader: NgxUiLoaderService,
    private toastr: ToastrService,
    private colaboradorService: ColaboradorService,
  ) {
    this.form = new FormGroup({
      especialidade: new FormControl('', Validators.required),
    })
  }


  // form = {
  //   especialidade: '',
  //   medico: '',
  //   data: '',
  //   horario: ''
  // };

  ngOnInit(): void {
    this.loader.start();
    this.updateProgress();
    this.colaboradorService.BuscarEspecialidadesPorCargoMedico().subscribe({
      next: (especialidades: Especialidade[]) => {
        this.especialidades = especialidades;
        this.loader.stop();
      },
      error: () => {
        this.toastr.error("Erro ao buscar especialidades");
        this.loader.stop();
      }
    })
  }

  next() {
    this.submitted = true;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;


    this.loader.start();
    switch (this.step) {
      case 1:
        this.buscarmedicos(this.form.get("especialidade")?.value);
        break;
    }
    // if (this.step === 2 && !this.form.medico) return;
    // if (this.step === 3 && !this.form.data) return;
    // if (this.step === 4 && !this.form.horario) return;

    if (this.step < 5) {
      this.step++;
      this.submitted = false;
      this.updateProgress();
    }
  }

  prev() {
    if (this.step > 1) {
      this.step--;
      this.submitted = false;
      this.updateProgress();
    }
  }

  goToStep(target: number) {
    if (target < this.step) {
      this.step = target;
      this.submitted = false;
      this.updateProgress();
    }
  }

  updateProgress() {
    this.progress = ((this.step - 1) / 4) * 100;
  }

  buscarmedicos(especialidade: string) {
    this.colaboradorService.BuscarMedicoPorEspecialidade(especialidade).subscribe({
      next: (medicos: Colaborador[]) => {
        this.medicos = medicos;
        this.loader.stop();
      },
      error: () => {
        this.toastr.error("Erro ao buscar médicos!");
        this.loader.stop();
      }
    })
  }

  submit() {
    this.submitted = true;
    // if (!this.form.horario) return;

    alert('Formulário enviado com sucesso!');
    // Aqui pode enviar para API, limpar formulário, etc.
  }
}
