import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { eachDayOfInterval, startOfMonth, endOfMonth, format, addMinutes, isSameDay } from 'date-fns';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Colaborador } from '../../../_models/colaborador';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { environment } from '../../../../environments/environment.development';
import { ColaboradorService } from '../../../_services/colaborador.service';
import { ToastrService } from 'ngx-toastr';
import { Turno } from '../../../_models/Turno';
import { TurnosService } from '../../../_services/turnos.service';
import { ptBR } from 'date-fns/locale';
import { Router } from '@angular/router';


@Component({
  selector: 'app-incluir-turnos',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxMaskPipe, NgxMaskDirective],
  templateUrl: './incluir-turnos.component.html',
  styleUrl: './incluir-turnos.component.scss'
})
export class IncluirTurnosComponent implements OnInit {
  form: FormGroup;
  turnoEscala: FormGroup;
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
      ),
    });

    this.turnoEscala = this.fb.group({
      dataInicial: '',
      cargaHoraria: '',
      horasDesanso: '',
      inicio: '',
      termino: '',
      areaDeAtuacao: '',
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

  aplicarEscala() {
    this.loader.start();
    const turnosArray = this.turnos;
    const turnoEscala = this.turnoEscala;

    const dataInicialStr = turnoEscala.get('dataInicial')?.value;
    const horaInicialStr = turnoEscala.get('inicio')?.value;
    const cargaHorariaStr = turnoEscala.get('cargaHoraria')?.value;
    const descansoStr = turnoEscala.get('horasDesanso')?.value;
    const areaDeAtuacao = turnoEscala.get('areaDeAtuacao')?.value;

    if (!dataInicialStr || !horaInicialStr || !cargaHorariaStr || !descansoStr) return;

    const parseTimeStr = (str: string) => {
      const [h, m] = str.split(':').map(Number);
      return h * 60 + m;
    };

    const cargaTotalMin = parseTimeStr(cargaHorariaStr);
    const descansoMin = parseTimeStr(descansoStr) - 1;
    const ano = Number(this.form.get("ano")!.value);
    const mes = Number(this.form.get("mes")!.value) + 1; // de 1 a 12
    const dia = Number(dataInicialStr);              // número do dia
    const [hora, minuto] = horaInicialStr.split(':').map(Number); // "08:00" → [8, 0]


    let inicio = new Date(ano, mes - 1, dia, hora, minuto); // mês - 1 porque começa do zero
    console.log(inicio);

    const turnosDias = turnosArray.controls.map(c => c.get('data')?.value);


    let i = 0;

    while (i < turnosDias.length) {
      let restanteMin = cargaTotalMin;
      let atual = new Date(inicio);

      while (restanteMin > 0 && i < turnosDias.length) {
        const turnoDia = turnosArray.at(i);
        const dataAtual = new Date(turnosDias[i] + 'T00:00');

        let inicioTurno = isSameDay(atual, dataAtual) ? new Date(atual) : new Date(dataAtual);

        const maxFimDoDia = new Date(dataAtual);
        maxFimDoDia.setHours(23, 59, 0, 0);

        const minutosDisponiveis = Math.max(0, Math.floor((+maxFimDoDia - +inicioTurno) / 60000));
        let minutosParaHoje = Math.min(restanteMin, minutosDisponiveis);

        const fimTurno = addMinutes(inicioTurno, minutosParaHoje);

        turnoDia.patchValue({
          inicio: format(inicioTurno, 'HH:mm'),
          termino: format(fimTurno, 'HH:mm'),
          areaDeAtuacao: areaDeAtuacao
        });

        restanteMin -= minutosParaHoje;
        // atual = addMinutes(fimTurno, 1);
        atual = minutosParaHoje === minutosDisponiveis
          ? addMinutes(fimTurno, 1) // ultrapassou o dia — avança 1 minuto
          : new Date(fimTurno);

        // Só avança para o próximo dia se usou toda a capacidade do dia
        if (minutosParaHoje === minutosDisponiveis) {
          i++;
        }
      }

      // Aplicar descanso
      inicio = addMinutes(atual, descansoMin);

      const proximoDiaIndex = turnosDias
        .slice(i)
        .findIndex(d => new Date(d + 'T00:00') >= new Date(inicio.toDateString()));
      if (proximoDiaIndex === -1) break;

      i += proximoDiaIndex;
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
