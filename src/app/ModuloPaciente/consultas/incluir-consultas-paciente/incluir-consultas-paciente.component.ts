import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ColaboradorService } from '../../../_services/colaborador.service';
import { ToastrService } from 'ngx-toastr';
import { Especialidade } from '../../../_models/cargo';
import { Colaborador } from '../../../_models/colaborador';
import { TurnosService } from '../../../_services/turnos.service';
import { Turno } from '../../../_models/Turno';
import { ConsultasService } from '../../../_services/consultas.service';
import { Paciente } from '../../../_models/Paciente';
import { PacienteService } from '../../../_services/paciente.service';
import { NgxMaskPipe } from 'ngx-mask';
import { Consulta } from '../../../_models/consulta';

@Component({
  selector: 'app-incluir-consultas-paciente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, NgxMaskPipe],
  templateUrl: './incluir-consultas-paciente.component.html',
  styleUrls: ['./incluir-consultas-paciente.component.scss']
})
export class IncluirConsultasPacienteComponent implements OnInit {
  form!: FormGroup;
  step = 1;
  submitted = false;
  progress = 0;
  especialidades: Especialidade[] = [];
  especialidadeSelecionada?: Especialidade;
  medicos: Colaborador[] = [];
  medicoSelecionado?: Colaborador;
  datas: Turno[] = [];
  dataSelecionada?: Turno;
  horarios: string[] = [];
  horarioSelecionado?: string;
  paciente!: Paciente;

  constructor(
    private loader: NgxUiLoaderService,
    private toastr: ToastrService,
    private colaboradorService: ColaboradorService,
    private turnosService: TurnosService,
    private consultasService: ConsultasService,
    private pacienteService: PacienteService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = new FormGroup({
      especialidade: new FormControl('', Validators.required),
      medico: new FormControl('', Validators.required),
      data: new FormControl('', Validators.required),
    })
  }

  ngOnInit(): void {
    this.loader.start();
    this.updateProgress();
    this.colaboradorService.BuscarEspecialidadesPorCargoMedico().subscribe({
      next: (especialidades: Especialidade[]) => {
        this.especialidades = especialidades;
        this.loader.stop();
        this.pacienteService.buscarPacienteLogado().subscribe({
          next: (paciente: Paciente) => {
            this.paciente = paciente
          },
          error: (error) => {
            this.toastr.error(error);
          }
        })
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

    switch (this.step) {
      case 1:
        if (this.especialidadeSelecionada == null) return
        this.buscarmedicos(this.especialidadeSelecionada.especialidade);
        break;

      case 2:
        if (this.medicoSelecionado == null) return
        this.buscarTurnosMedico();
        break;

      case 3:
        if (this.dataSelecionada == null) return;
        this.buscarHorariosConsulta();
        break;

      case 4:
        if (this.horarioSelecionado == null) return;
        break;
    }

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

  selecionarEspecialidade(especialidade: Especialidade) {
    this.especialidadeSelecionada = especialidade;
    this.next();
  }

  buscarmedicos(especialidade: string) {
    this.loader.start();
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

  selecionarMedico(medico: Colaborador) {
    this.medicoSelecionado = medico;
    this.next();
  }

  buscarTurnosMedico() {
    this.loader.start();
    this.turnosService.buscarTurnoPorColaboradorEMenorData(this.medicoSelecionado?.id!, new Date()).subscribe({
      next: (turnos: Turno[]) => {
        this.datas = turnos.filter(t => (t.areaDeAtuacao.toUpperCase() == "TELECONSULTA"));
        this.loader.stop();
      },
      error: () => {
        this.toastr.error("Erro ao buscar datas!");
        this.loader.stop();
      }
    })
  }

  selecionarData(data: Turno) {
    this.dataSelecionada = data;
    this.next();
  }

  buscarHorariosConsulta() {
    this.loader.start();
    this.consultasService.buscarHorariosDisponiveisMedicoData(this.medicoSelecionado?.id!, this.dataSelecionada!).subscribe({
      next: (datas: string[]) => {
        this.horarios = datas;
        this.loader.stop();
      },
      error: () => {
        this.toastr.error("Erro ao buscar horarios!");
        this.loader.stop();
      }
    });
  }

  calcularRotacao(horario: string): number {
    const [horaStr, minutoStr] = horario.split(':');
    const hora = parseInt(horaStr, 10) % 12; // para manter no ciclo de 12h
    const minuto = parseInt(minutoStr, 10);

    // 30 graus por hora + 0.5 grau por minuto
    return (hora * 30) + (minuto * 0.5);
  }


  selecionarHorario(horario: string) {
    this.horarioSelecionado = horario;
    this.next();
  }

  calcularIdade(dataNascimento: string | Date): string {
    const nascimento = new Date(dataNascimento);
    const hoje = new Date();

    let idade = hoje.getFullYear() - nascimento.getFullYear();

    const mesAtual = hoje.getMonth();
    const diaAtual = hoje.getDate();
    const mesNascimento = nascimento.getMonth();
    const diaNascimento = nascimento.getDate();

    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && diaAtual < diaNascimento)) {
      idade--;
    }

    let idadeFormatada;
    if (idade > 1) {
      idadeFormatada = idade + " Anos";
    } else {
      idadeFormatada = idade + " Ano";
    }

    return idadeFormatada;
  }

  submit() {
    if (this.especialidadeSelecionada == null ||
      this.medicoSelecionado == null ||
      this.dataSelecionada == null ||
      this.horarioSelecionado == null
    ){
      this.toastr.error("Erro ao inserir nova consulta. Motivo: Nem todos os campos foram preenchidos, volte para o inicio e tente novamente!","",{progressBar: true});
      return
    }

    this.loader.start();

    const consulta : Consulta = {
      data : this.dataSelecionada.data,
      hora: this.horarioSelecionado,
      idPaciente: this.paciente.id!,
      paciente: this.paciente,
      medico: this.medicoSelecionado,
      idMedico: this.medicoSelecionado.id!,
      idHospital: '8bSz5V9xeWXfjhsvHMCt',
      status: "MARCADO"
    }

    this.consultasService.novaConsulta(consulta).subscribe({
       next: (res: any) => {
        this.router.navigateByUrl('/paciente/consultas');
        this.toastr.success(res);
        this.loader.stop();
      },
      error: (err: any) => {
        this.toastr.error(err);
        this.loader.stop();
      }
    })

  }
}
