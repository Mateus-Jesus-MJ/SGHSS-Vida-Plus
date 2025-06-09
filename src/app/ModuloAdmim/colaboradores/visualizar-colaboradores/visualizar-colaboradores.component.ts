import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { Colaborador, CursoColaborador, FormacaoColaborador, TreinamentoColaborador } from '../../../_models/colaborador';
import { Estado, Municipo } from '../../../_models/Estado';
import { Cargo, Especialidade } from '../../../_models/cargo';
import { environment } from '../../../../environments/environment.development';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { ColaboradorService } from '../../../_services/colaborador.service';

@Component({
  selector: 'app-visualizar-colaboradores',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxMaskDirective, RouterModule, ImageCropperComponent, NgxMaskPipe],
  templateUrl: './visualizar-colaboradores.component.html',
  styleUrl: './visualizar-colaboradores.component.scss'
})
export class VisualizarColaboradoresComponent implements OnInit {
form!: FormGroup;
  colaborador!: Colaborador | null;
  estados!: Estado[];
  municipios!: Municipo[];
  imageChangedEvent: any = '';
  croppedImage: any = '';
  originalImage: any = '';
  imagemCortada: any = '';
  isEstadoSelect: boolean = true;
  cargos!: Cargo[];
  isCargoSelect: boolean = false;
  cargoSelecionado?: Cargo | null;
  especialidades: Especialidade[] = [];
  formacoesColaborador: FormacaoColaborador[] = [];
  opcoesEscolaridade = environment.niveisDeEscolaridade;
  cursosColaborador: CursoColaborador[] = [];
  treinamentosColaborador: TreinamentoColaborador[] = [];

  constructor(
    private toastr: ToastrService,
    private loader: NgxUiLoaderService,
    private router: Router,
    private routeAcitive: ActivatedRoute,
    private colaboradorService: ColaboradorService
  ) {
    this.form = new FormGroup({
      nome: new FormControl('', Validators.required),
      cpf: new FormControl('', [Validators.required, Validators.minLength(14), Validators.maxLength(14)]),
      identidade: new FormControl(''),
      dataNascimento: new FormControl('', [Validators.required]),
      enderecoCep: new FormControl('', [Validators.required]),
      enderecoLogradouro: new FormControl('', [Validators.required]),
      enderecoNumero: new FormControl('', [Validators.required]),
      enderecoComplemento: new FormControl(''),
      enderecoBairro: new FormControl('', [Validators.required]),
      enderecoUF: new FormControl('', [Validators.required]),
      enderecoMunicipio: new FormControl('', [Validators.required]),
      email: new FormControl(''),
      telefone1: new FormControl(''),
      telefone2: new FormControl(''),
      cargo: new FormControl('', [Validators.required]),
      salario: new FormControl('', [Validators.required]),
      dataInicio: new FormControl('', [Validators.required]),
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

      this.buscarColaborador(id);
    });
    this.loader.stop();
  }

  buscarColaborador(id: string) {
    this.colaboradorService.buscarPorId(id).subscribe(
      (colaborador) => {
        if (colaborador) {
          this.colaborador = colaborador
          this.populateForm(colaborador);
        } else {
          this.toastr.error("Colaborador não encontrado. Verifique o id informado e tente novamente\n se o problema persistir procure o administrador do sistema", "", { "progressBar": true });
        }
      }
    )
  }

  private populateForm(colaborador: Colaborador): void {
    this.form.patchValue({
      nome: colaborador.nome,
      cpf: colaborador.cpf,
      identidade: colaborador.identidade,
      dataNascimento: colaborador.dataNascimento,
      enderecoCep: colaborador.endereco.cep,
      enderecoLogradouro: colaborador.endereco.logradouro,
      enderecoNumero: colaborador.endereco.numero,
      enderecoComplemento: colaborador.endereco.complemento,
      enderecoBairro: colaborador.endereco.bairro,
      enderecoUF: colaborador.endereco.uf,
      enderecoMunicipio: colaborador.endereco.localidade,
      email: colaborador.contato.email,
      telefone1: colaborador.contato.telefone1,
      telefone2: colaborador.contato.telefone2,
      cargo: colaborador.cargo?.cargo,
      salario: colaborador.salario,
      dataInicio: colaborador.dataInicio
    });
    this.imagemCortada = colaborador.imagem!;
    this.cargoSelecionado = colaborador.cargo;
    this.especialidades = colaborador.especialidades!;
    this.formacoesColaborador = colaborador.formacoes!;
    this.cursosColaborador = colaborador.cursos!;
    this.treinamentosColaborador = colaborador.treinamentos!;
  }
}
