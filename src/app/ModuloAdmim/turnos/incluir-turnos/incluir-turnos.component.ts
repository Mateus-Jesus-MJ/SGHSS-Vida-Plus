import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { eachDayOfInterval, startOfMonth, endOfMonth, format } from 'date-fns';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Colaborador } from '../../../_models/colaborador';
import { NgxMaskPipe } from 'ngx-mask';
import { environment } from '../../../../environments/environment.development';
import { ColaboradorService } from '../../../_services/colaborador.service';
import { ToastrService } from 'ngx-toastr';
import { Turno } from '../../../_models/Turno';
import { TurnosService } from '../../../_services/turnos.service';
import { ptBR } from 'date-fns/locale';
import { Router } from '@angular/router';


@Component({
  selector: 'app-incluir-turnos',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxMaskPipe],
  templateUrl: './incluir-turnos.component.html',
  styleUrl: './incluir-turnos.component.scss'
})
export class IncluirTurnosComponent implements OnInit {
  form: FormGroup;
  dias: Date[] = [];
  colaboradores: Colaborador[] = [];
  colaborador?: Colaborador;
  turnosIncluir: Turno[] = [];
  meses = environment.meses;
  turnosSemanaRecebidos?: any[];
  diasDaSemana = [
    { nome: 'Domingo' }, { nome: 'Segunda' }, { nome: 'Terça' },
    { nome: 'Quarta' }, { nome: 'Quinta' }, { nome: 'Sexta' }, { nome: 'Sábado' }
  ];



  constructor(private fb: FormBuilder,
    private loader: NgxUiLoaderService,
    private colaboradorService: ColaboradorService,
    private turnosService: TurnosService,
    private router: Router,
    private toastr: ToastrService,
  ) {
    this.form = this.fb.group({
      colaborador: new FormControl('', [Validators.required]),
      cargo: new FormControl('', [Validators.required]),
      mes: [new Date().getMonth()],
      ano: [new Date().getFullYear()],

      turnos: this.fb.array([]),
      semanaForm: this.fb.array(
        this.diasDaSemana.map(() =>
          this.fb.group({
            inicio: [''],
            inicioIntervalo: [''],
            terminoIntervalo: [''],
            termino: [''],
            areaDeAtuacao: ['']
          })
        )
      )
    });
    const navigation = this.router.getCurrentNavigation();
    this.turnosSemanaRecebidos = navigation?.extras.state?.['turnosSemana'];
  }


  ngOnInit(): void {
    this.loader.start();
    this.buscarColaboradores()
    this.gerarTabela();

    if (this.turnosSemanaRecebidos?.length) {
      this.aplicarTurnoPadrao(this.turnosSemanaRecebidos);
    }
  }

  aplicarTurnoPadrao(turnosSemana: any[]): void {
  const turnosFormArray = this.form.get('turnos') as FormArray;

  turnosSemana.forEach((turno) => {
    const index = turnosFormArray.controls.findIndex(ctrl => ctrl.get('data')?.value === turno.data);

    if (index !== -1) {
      const grupo = turnosFormArray.at(index);
      grupo.patchValue({
        inicio: turno.horarioInicio,
        inicioIntervalo: turno.horarioInicioIntervalo,
        terminoIntervalo: turno.horarioTerminoIntervalo,
        termino: turno.horarioTermino,
        areaDeAtuacao: turno.areaDeAtuacao
      });
    } else {
      console.warn(`Data ${turno.data} não encontrada no FormArray de turnos`);
    }
  });
}


  buscarColaboradores() {
    this.colaboradorService.buscarColaboradoresComCargo().subscribe({
      next: (colaboradores: Colaborador[]) => {
        this.colaboradores = colaboradores;
      },
      error: () => {
        this.toastr.error("Erro inesperado ao buscar colaboradores! Tente novamente mais tarde", "", { "progressBar": true })
      }
    });


  }

  get turnos(): FormArray {
    return this.form.get('turnos') as FormArray;
  }

  aplicarTurno(): void {
    this.loader.start();
    this.turnos.clear();

    const semanaFormArray = this.form.get('semanaForm') as FormArray;

    // console.log(semanaFormArray);
    for (const dia of this.dias) {
      const index = dia.getDay() - 1;
      const turnoPadraoGroup = semanaFormArray.at(index) as FormGroup;

      console.log(dia);
      console.log(index);
      console.log(turnoPadraoGroup);

      this.turnos.push(this.fb.group({
        data: [format(dia, 'yyyy-MM-dd')],
        inicio: [turnoPadraoGroup.get('inicio')?.value],
        inicioIntervalo: [turnoPadraoGroup.get('inicioIntervalo')?.value],
        terminoIntervalo: [turnoPadraoGroup.get('terminoIntervalo')?.value],
        termino: [turnoPadraoGroup.get('termino')?.value],
        areaDeAtuacao: [turnoPadraoGroup.get('areaDeAtuacao')?.value]
      }));
    }
    this.loader.stop();
  }

  gerarTabela(): void {
    this.loader.start();
    const mes = this.form.value.mes;
    const ano = this.form.value.ano;
    this.dias = eachDayOfInterval({
      start: startOfMonth(new Date(ano, mes)),
      end: endOfMonth(new Date(ano, mes))
    });

    this.turnos.clear();
    for (const dia of this.dias) {
      this.turnos.push(this.fb.group({
        data: [format(dia, 'yyyy-MM-dd')],
        inicio: [''],
        inicioIntervalo: [''],
        terminoIntervalo: [''],
        termino: [''],
        areaDeAtuacao: ['']
      }));
    }
    this.loader.stop();
  }
  getDiaSemana(data: string): string {
    const date = new Date(data);
    return format(date, 'EEEE', { locale: ptBR });
  }


  selecionarColaborador(colaborador: Colaborador) {
    this.colaborador = colaborador;
    this.form.get("colaborador")?.setValue(colaborador.nome);
    this.form.get("cargo")?.setValue(colaborador.cargo!.cargo);
  }

  submit(): void {
    this.loader.start();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.loader.stop();
      return;
    }

    let isTurno = false;
    this.turnos.controls.forEach((grupo, index) => {
      const turno = grupo.value;

      if ((turno.inicio && turno.inicio.trim() !== '') && (turno.termino && turno.termino.trim() !== '') && turno.areaDeAtuacao != "") {
        const turnoIncluir: Turno = {
          idColaborador: this.colaborador!.id!,
          idHospital: 'Hospital1',
          data: turno.data,
          horarioInicio: turno.inicio,
          horarioInicioIntervalo: turno.inicioIntervalo,
          horarioTerminoIntervalo: turno.terminoIntervalo,
          horarioTermino: turno.termino,
          numeroAtendimento: '',
          areaDeAtuacao: turno.areaDeAtuacao
        };

        this.turnosIncluir.push(turnoIncluir);
        isTurno = true;
      }
    });

    if (!isTurno) {
      this.toastr.error("Erro ao incluir turno. Motivo: É preciso preencher os horários de pelo menos um dia.")
      this.loader.stop();
      return;
    }


    this.turnosService.incluir(this.turnosIncluir).subscribe({
      next: (res: any) => {
        this.toastr.success(res);
        this.loader.stop();
      },
      error: (err: any) => {
        this.toastr.error(err);
        this.loader.stop();
      }
    });
  }
}
