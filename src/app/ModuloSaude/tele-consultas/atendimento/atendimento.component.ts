import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Consulta } from '../../../_models/consulta';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { ConsultasService } from '../../../_services/consultas.service';
import { NgxMaskPipe } from 'ngx-mask';

@Component({
  selector: 'app-atendimento',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxMaskPipe],
  templateUrl: './atendimento.component.html',
  styleUrl: './atendimento.component.scss'
})
export class AtendimentoComponent implements OnInit {
  form!: FormGroup;
  consulta!: Consulta;
  agora = Date();


  constructor(
    private router: Router,
    private routeAcitive: ActivatedRoute,
    private loader: NgxUiLoaderService,
    private toastr: ToastrService,
    private consultaService: ConsultasService
  ) {
    this.form = new FormGroup({
      status: new FormControl('MARCADO', Validators.required),
      medicamentoAdicionar: new FormControl('', Validators.required),
      medicamentoQuantidade: new FormControl('', Validators.required),
      medicamentoPeriodo: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
    this.loader.start();
    this.routeAcitive.paramMap.subscribe(params => {
      const id = params.get('id')!;

      if (id == null || id == "") {
        this.toastr.error("Consulta não encontrada");
        this.router.navigateByUrl('atendimento/teleconsultas');
        this.loader.stop();
        return
      }
      this.buscarConsulta(id)
    });
  }

  buscarConsulta(id: string) {
    this.consultaService.buscarConsultaPorId(id).subscribe({
      next: (consulta: Consulta | null) => {
        if (consulta != null) {
          this.consulta = consulta;
          this.adicionarSolicitacaoProcedimento();
          this.loader.stop();
        }
      },
      error: (error) => {
        this.toastr.error(error);
        this.loader.stop();
      }
    })
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

  adicionarMedicamento() {
    if (!this.consulta.receita) {
      this.consulta.receita = [];
    }

    const medicamento = this.form.get("medicamentoAdicionar")?.value.toUpperCase();
    const quantidade = this.form.get("medicamentoQuantidade")?.value.toUpperCase();
    const periodo = this.form.get("medicamentoPeriodo")?.value.toUpperCase();

    if(!medicamento && !quantidade && !periodo){
      this.toastr.error("É necessário informar o medicamento, quantidade e período.","", {progressBar: true});
      return;
    }

    this.consulta.receita?.push({
      medicamento,
      quantidade,
      periodo
    });

    this.form.patchValue({
      medicamentoAdicionar: '',
      medicamentoQuantidade: '',
      medicamentoPeriodo: ''
    })
  }

  adicionarSolicitacaoProcedimento(){
    if(!this.consulta.solicitacoes){
      this.consulta.solicitacoes = [];
    }

    this.consulta.solicitacoes?.push({
      procedimento: 'RAIO X'
    })

    this.consulta.solicitacoes?.push({
      procedimento: 'ENDOSCOPIA'
    })

    this.consulta.solicitacoes?.push({
      procedimento: 'RESSONANCIA MAGENETICA COM CONTRASTE'
    })
  }


  submit() { }

}
