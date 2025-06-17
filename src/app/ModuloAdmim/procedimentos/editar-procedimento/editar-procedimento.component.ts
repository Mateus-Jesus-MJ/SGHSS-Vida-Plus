import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ProcedimentoService } from '../../../_services/procedimento.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Procedimento } from '../../../_models/procedimento';

@Component({
  selector: 'app-editar-procedimento',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './editar-procedimento.component.html',
  styleUrl: './editar-procedimento.component.scss'
})
export class EditarProcedimentoComponent implements OnInit {
  form!: FormGroup
  procedimento?: Procedimento | null;

  constructor(
    private loader: NgxUiLoaderService,
    private toastr: ToastrService,
    private procedimentoService: ProcedimentoService,
    private router: Router,
    private routeAcitive: ActivatedRoute
  ) {
    this.form = new FormGroup({
      nome: new FormControl('', [Validators.required]),
      tempoDuracao: new FormControl('', [Validators.required]),
      funcionamento: new FormArray([])
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

      this.buscarProcedimento(id);

    })
  }

  get funcionamento(): FormArray {
    return this.form.get('funcionamento') as FormArray;
  }

  buscarProcedimento(id: string) {
    this.procedimentoService.buscarProcedimentoPorId(id).subscribe(
      (procedimento) => {
        if (procedimento) {
          this.procedimento = procedimento;
          this.populateForm(procedimento);
        } else {
          this.toastr.error("Procedimento não encontrado. Verifique o id informado e tente novamente\n se o problema persistir procure o administrador do sistema", "", { "progressBar": true });
        }
      }
    )
  }

  private populateForm(procedimento: Procedimento): void {
    this.form.patchValue({
      nome: procedimento.nome,
      tempoDuracao: procedimento.tempoDuracao
    });

    const funcionamentoArray = this.form.get('funcionamento') as FormArray;
    funcionamentoArray.clear();

    procedimento.funcionamento.forEach((dia) => {
      funcionamentoArray.push(new FormGroup({
        diaDaSemana: new FormControl(dia.diaSemana, Validators.required),
        numeroDiaDaSemana: new FormControl(dia.numeroDiaSemana, Validators.required),
        inicio: new FormControl(dia.horarioInicio),
        inicioIntervalo: new FormControl(dia.horarioInicioIntervalo),
        terminoIntervalo: new FormControl(dia.horarioTerminoIntervalo),
        termino: new FormControl(dia.horarioTermino),
        numeroAtendimento: new FormControl(dia.numeroAtendimento)
      }));
    });

    this.loader.stop();
  }

  submit() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return
    }

    this.loader.start();

    const formData = this.form.value;

    const procedimento: Procedimento = {
      id: this.procedimento?.id,
      nome: formData.nome.toUpperCase(),
      tempoDuracao: formData.tempoDuracao,
      funcionamento: formData.funcionamento
        .filter((dia: any) => {
          // precisa ter horário de trabalho definido
          if (!dia.inicio || !dia.termino || dia.inicio >= dia.termino) return false;

          // se houver intervalo, ele deve ser coerente
          if (dia.inicioIntervalo && dia.terminoIntervalo) {
            return dia.inicioIntervalo <= dia.terminoIntervalo;
          }

          // se não há intervalo, tudo certo
          return true;
        })
        .map((dia: any) => ({
          diaSemana: dia.diaDaSemana,
          numeroDiaSemana: dia.numeroDiaDaSemana,
          horarioInicio: dia.inicio,
          horarioInicioIntervalo: dia.inicioIntervalo,
          horarioTerminoIntervalo: dia.terminoIntervalo,
          horarioTermino: dia.termino,
          numeroAtendimento: ''
        }))
    };

    this.procedimentoService.editarProcedimento(procedimento).subscribe({
      next: (res: any) => {
        this.toastr.success(res);
        this.buscarProcedimento(procedimento.id!);
        this.loader.stop();
      },
      error: (err: any) => {
        this.toastr.error(err);
        this.loader.stop();
      }
    });
  }
}
