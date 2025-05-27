import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Colaborador } from '../../../_models/colaborador';
import { eachDayOfInterval, endOfMonth, format, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ColaboradorService } from '../../../_services/colaborador.service';
import { TurnosService } from '../../../_services/turnos.service';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment.development';
import { Turno } from '../../../_models/Turno';
import { CommonModule } from '@angular/common';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';

@Component({
  selector: 'app-excluir-turnos',
  imports: [CommonModule, RouterModule, NgxMaskDirective, NgxMaskPipe, FormsModule, ReactiveFormsModule],
  templateUrl: './excluir-turnos.component.html',
  styleUrl: './excluir-turnos.component.scss'
})
export class ExcluirTurnosComponent implements OnInit {
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
    //this.buscarColaboradores()
    this.gerarTabela();

    if (this.turnosSemanaRecebidos?.length) {
      this.aplicarTurnoPadrao(this.turnosSemanaRecebidos);
    } else {
      this.router.navigate(['admin/turnos'])
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

  get turnos(): FormArray {
    return this.form.get('turnos') as FormArray;
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




  submit() {

  }
}
