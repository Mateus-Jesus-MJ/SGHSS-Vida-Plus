import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { ConsultaEstadosMunicipiosService } from '../../../_services/consulta-estados-municipios.service';
import { Estado, Municipo } from '../../../_models/Estado';
import { Cargo, Especialidade } from '../../../_models/cargo';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { CargosService } from '../../../_services/cargos.service';
import { ColaboradorService } from '../../../_services/colaborador.service';
import { Colaborador, CursoColaborador, FormacaoColaborador, TreinamentoColaborador } from '../../../_models/colaborador';
import { Contato } from '../../../_models/contato';
import { Endereco } from '../../../_models/endereco';
import { environment } from '../../../../environments/environment.development';
import { showAlert } from '../../../_util.ts/sweetalert-util';

@Component({
  selector: 'app-editar-colaboradores',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxMaskDirective, RouterModule, ImageCropperComponent, NgxMaskPipe],
  templateUrl: './editar-colaboradores.component.html',
  styleUrl: './editar-colaboradores.component.scss'
})
export class EditarColaboradoresComponent implements OnInit {
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
    private consultaEstadoMunicipios: ConsultaEstadosMunicipiosService,
    private loader: NgxUiLoaderService,
    private toastr: ToastrService,
    private cargoService: CargosService,
    private colaboradorService: ColaboradorService,
    private router: Router,
    private routeAcitive: ActivatedRoute
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
      crm: new FormControl('')
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

      this.consultaEstadoMunicipios.buscaEstados().subscribe({
        next: (estados: Estado[] | null) => {
          if (estados != null)
            this.estados = estados;
        },
        error: () => {
          this.toastr.error("Erro ao buscar estados");
        }
      })

      this.cargoService.buscarCargos().subscribe({
        next: (cargos: Cargo[] | null) => {
          if (cargos != null)
            this.cargos = cargos;
        },
        error: () => {
          this.toastr.error("Erro ao buscar cargos");
        }
      })
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
    this.especialidades = colaborador.especialidades! || [];
    this.formacoesColaborador = colaborador.formacoes! || [];
    this.cursosColaborador = colaborador.cursos! || [];
    this.treinamentosColaborador = colaborador.treinamentos! || [];
    this.validaCPF();
  }

  navigate(rota: string) {
    this.router.navigateByUrl(rota);
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
    const reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = (e: any) => {
      this.originalImage = e.target.result;
      this.croppedImage = '';
    };
  }

  onImageCropped(event: ImageCroppedEvent): void {
    if (event.blob) {
      const reader = new FileReader();
      reader.onloadend = () => {
        this.croppedImage = reader.result as string;
      };
      reader.readAsDataURL(event.blob);
    }
  }

  applyCrop(): void {
    this.loader.start();
    if (this.croppedImage) {
      this.imagemCortada = this.croppedImage
    }
    this.loader.stop();
  }

  resetImage(): void {
    this.croppedImage = '';
    this.imageChangedEvent = '';
  }

  validaCPF() {
    const control = this.form.get('cpf');
    if (!control) return;

    let cpf = control.value;

    cpf = cpf.replace(/[^\d]/g, '');

    if (cpf.length == 0) {
      control.setErrors({ required: true })
      return
    }

    if (cpf.length !== 11) {
      control.setErrors({ invalidCpf: true });
      return;
    }

    let numero: number = 0;
    let caracter: string = '';
    let numeros: string = '0123456789';
    let j: number = 10;
    let somatorio: number = 0;
    let resto: number = 0;
    let digito1: number = 0;
    let digito2: number = 0;
    let cpfAux: string = cpf.substring(0, 9);

    for (let i: number = 0; i < 9; i++) {
      caracter = cpfAux.charAt(i);
      if (numeros.search(caracter) === -1) {
        control.setErrors({ invalidCpf: true });
        return;
      }
      numero = Number(caracter);
      somatorio = somatorio + (numero * j);
      j--;
    }

    resto = somatorio % 11;
    digito1 = 11 - resto;
    if (digito1 > 9) {
      digito1 = 0;
    }

    j = 11;
    somatorio = 0;
    cpfAux = cpfAux + digito1;

    for (let i: number = 0; i < 10; i++) {
      caracter = cpfAux.charAt(i);
      numero = Number(caracter);
      somatorio = somatorio + (numero * j);
      j--;
    }

    resto = somatorio % 11;
    digito2 = 11 - resto;
    if (digito2 > 9) {
      digito2 = 0;
    }

    cpfAux = cpfAux + digito2;

    if (cpf === cpfAux) {
      control.setErrors(null);
    } else {
      control.setErrors({ invalidCpf: true });
    }
  }

  buscarMunicipios(event: Event): void {
    const select = event.target as HTMLInputElement;
    const value = select.value;

    const estadoSelecionado = this.estados.find(estado => estado.sigla === value);

    this.loader.startBackground();

    if (estadoSelecionado != undefined) {
      this.consultaEstadoMunicipios.buscaMunicipios(estadoSelecionado).subscribe({
        next: (municipios: Municipo[] | null) => {
          if (municipios != null)
            this.municipios = municipios
        },
        error: () => {
          this.isEstadoSelect = false;
        }
      })
      this.isEstadoSelect = true;
    } else {
      this.isEstadoSelect = false;
    }
    this.loader.stopBackground();
  }

  buscarCEP(): void {
    const cepControl = this.form.get('enderecoCep');
    const cep = cepControl?.value;

    if (!cep || cep.length < 8) return;

    const cepNumerico = cep.replace(/\D/g, '');

    if (cepNumerico.length !== 8) {
      this.toastr.warning('CEP deve conter 8 dígitos');
      return;
    }

    this.loader.startBackground();

    this.consultaEstadoMunicipios.buscaMunicipioCEP(cepNumerico).subscribe({
      next: (endereco) => {
        if (endereco.erro) {
          this.toastr.warning('CEP não encontrado');
          this.form.get('enderecoCep')?.setValue('');
          return;
        }

        const estadoSigla = endereco.uf;

        this.form.patchValue({
          enderecoLogradouro: endereco.logradouro || '',
          enderecoBairro: endereco.bairro || '',
          enderecoUF: estadoSigla || '',

        });

        this.buscarMunicipiosPorSigla(estadoSigla, endereco.localidade);

        this.loader.stopBackground();
      },
      error: (err) => {
        this.toastr.error('Erro ao consultar CEP. Tente novamente.');
      }
    });
  }

  buscarMunicipiosPorSigla(sigla: string, cidade?: string): void {
    const estadoSelecionado = this.estados.find(estado => estado.sigla === sigla);

    if (!estadoSelecionado) {
      this.toastr.warning('Estado não encontrado');
      return;
    }

    this.consultaEstadoMunicipios.buscaMunicipios(estadoSelecionado).subscribe({
      next: (municipios: Municipo[] | null) => {
        if (municipios) {
          this.municipios = municipios;
          if (cidade) {
            const municipioEncontrado = municipios.find(m => m.nome.toLowerCase() === cidade.toLowerCase());
            if (municipioEncontrado) {
              this.form.patchValue({ enderecoMunicipio: municipioEncontrado.nome });
            }
          }
        }
      },
      error: () => {
        this.toastr.error('Erro ao buscar municípios');
      }
    });
    this.isEstadoSelect = true;
  }


  selecionarCargo(cargo: string) {
    this.form.get('cargo')?.setValue(cargo);
    const cargoSelect = this.form.get('cargo')?.value?.toLowerCase();
    this.cargoSelecionado = this.cargos.find(c => c.cargo.toLocaleLowerCase() === cargoSelect);
    this.form.get('salario')?.setValue(this.cargoSelecionado!.salarioBase);

    console.log(this.cargoSelecionado!.salarioBase);
  }

  validaCargo() {
    const cargoSelect = this.form.get('cargo')?.value?.toLowerCase(); // normaliza para minúsculo

    const cargo = this.cargos.find(c => c.cargo.toLocaleLowerCase() === cargoSelect);

    console.log(cargoSelect);

    if (cargo) {
      this.isCargoSelect = true;
      this.cargoSelecionado = cargo;
    } else {
      this.isCargoSelect = false;
      this.toastr.error("Selecione um cargo válido");
    }
  }

  incluirEspecialidade() {
    showAlert('Especialidades do cargo',
      `<div class="form-floating mb-3">
          <input type="text" class="form-control text-uppercase" id="especialidade" placeholder="">
          <label for="especialidade">Especialidade</label>
        </div>`,
      'info', "primary", "", true, "",
      () => {
        const input = (document.getElementById('especialidade') as HTMLInputElement);
        if (!input || input.value.trim() === '') {
          this.toastr.error('Por favor, preencha a especialidade');
          return false;
        }
        return input.value.toUpperCase();
      }
    ).then((result) => {
      if (result.isConfirmed && result.value) {
        this.loader.startBackground();

        const especialidade = result.value;

        if (!this.especialidades?.some(e => e.especialidade.toUpperCase() === especialidade)) {
          const nova: Especialidade = { especialidade: especialidade };
          this.especialidades.push(nova);
        } else {
          this.toastr.error('Especialidade já cadastrada');
        }

        this.loader.stopBackground();
      }
    });

  }

  removerEspecialidade(especialidade: string) {
    this.especialidades =
      this.especialidades.filter(e => e.especialidade !== especialidade);
  }


  ////////////////////////////////
  //      Voltado a formação    //
  ////////////////////////////////

  textHtmlAdicionarFormacao(): string {
    const options = this.opcoesEscolaridade.map(opcao =>
      `<option value="${opcao.value}">${opcao.label}</option>`
    ).join('');

    return `
      <div class="row">
        <div class="col-lg-4">
          <div class="form-floating mb-3">
            <select class="form-select" id="nivelEscolaridade">
              <option value="" disabled selected></option>
              ${options}
            </select>
            <label for="nivelEscolaridade" class="label-required">Nível de Escolaridade</label>
          </div>
        </div>
        <div class="col-lg-8">
          <div class="form-floating mb-3">
            <input class="form-control text-uppercase" id="formacao"/>
            <label for="formacao" class="label-required">Formação</label>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-lg-2">
          <div class="form-floating mb-3">
            <input type="number" class="form-control text-uppercase" id="anoConclusao"/>
            <label for="anoConclusao" >Ano de Conclusão</label>
          </div>
        </div>
        <div class="col-lg-10">
          <div class="form-floating mb-3">
            <input class="form-control text-uppercase" id="instituicaoEnsino"/>
            <label for="instituicaoEnsino" >Instituição de Ensino</label>
          </div>
        </div>
      </div>`;
  }

  getDadosFormacao(): any {
    const nivelEscolaridade = (document.getElementById('nivelEscolaridade') as HTMLSelectElement)?.value.toUpperCase() || '';
    const formacao = (document.getElementById('formacao') as HTMLInputElement)?.value.toUpperCase() || '';
    const anoConclusao = (document.getElementById('anoConclusao') as HTMLInputElement)?.value.toUpperCase() || '';
    const instituicaoEnsino = (document.getElementById('instituicaoEnsino') as HTMLInputElement)?.value.toUpperCase() || '';


    const formacaoColaborador: FormacaoColaborador = {
      nivelEscolaridade,
      formacao,
      anoConclusao,
      instituicaoEnsino,
    }

    return formacaoColaborador;
  }

  adicionarFormacao() {
    showAlert(
      'Adicionar Formação',
      this.textHtmlAdicionarFormacao(),
      'info',
      'primary',
      '<i class="fas fa-user-graduate"></i>',
      true,
      '90vw',
      () => {
        const novaformacao = this.getDadosFormacao();

        if (novaformacao.formacao.trim() === "" || novaformacao.nivelEscolaridade === "") {
          this.toastr.error("Os seguintes campos não podem ser vazios:\nFormação e Nível de Escolaridade.");
          return false;
        }

        const jaExiste = this.formacoesColaborador!.some(e =>
          e.nivelEscolaridade === novaformacao.nivelEscolaridade &&
          e.formacao.trim().toUpperCase() === novaformacao.formacao.trim().toUpperCase()
        );

        if (jaExiste) {
          this.toastr.error("Já existe uma formação com essas informações cadastrada");
          return false;
        }

        return novaformacao;
      }
    ).then(result => {
      if (result.isConfirmed && result.value) {
        this.loader.startBackground();
        this.formacoesColaborador!.push(result.value);
        this.loader.stopBackground();
      }
    });

  }

  excluirFormacao(formacao: FormacaoColaborador) {
    showAlert(
      'Remover Formação',
      `Deseja mesmo remover a formação em ${formacao.formacao}`,
      'info',
      'primary',
      '<i class="fas fa-user-graduate"></i>',
      true).then(result => {
        if (result.isConfirmed) {
          this.loader.startBackground();
          this.formacoesColaborador = this.formacoesColaborador.filter(f => !(f.nivelEscolaridade === formacao.nivelEscolaridade && f.formacao.trim().toUpperCase() === formacao.formacao.trim().toUpperCase()));
          this.loader.stopBackground();
        }
      });
  }

  ////////////////////////////////
  //            Cursos          //
  ////////////////////////////////

  textHtmlAdicionarCurso(): string {
    return `
          <div class="row">
            <div class="col-lg-10">
              <div class="form-floating mb-3">
                <input class="form-control text-uppercase" id="curso"/>
                <label for="formacao" class="label-required">Curso</label>
              </div>
            </div>
            <div class="col-lg-2">
              <div class="form-floating mb-3">
              <input type="number" class="form-control text-uppercase" id="anoConclusao"/>
              <label for="anoConclusao" >Ano de Conclusão</label>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-lg-2">
              <div class="form-floating mb-3">
                <input type="number" class="form-control text-uppercase" id="cargaHoraria"/>
                <label for="cargaHoraria" >Carga Horária</label>
              </div>
            </div>
            <div class="col-lg-10">
              <div class="form-floating mb-3">
                <input class="form-control text-uppercase" id="instituicaoEnsino"/>
                <label for="instituicaoEnsino" >Instituição de Ensino</label>
              </div>
            </div>
          </div>`;
  }


  adicionarCurso() {
    showAlert(
      'Adicionar Curso',
      this.textHtmlAdicionarCurso(),
      'info',
      'primary',
      '<i class="fas fa-award"></i>',
      true,
      '90vw',
      () => {
        const titulo = (document.getElementById('curso') as HTMLInputElement)?.value.trim().toUpperCase();
        const data = (document.getElementById('anoConclusao') as HTMLInputElement)?.value.trim().toUpperCase();
        const cargaHoraria = (document.getElementById('cargaHoraria') as HTMLInputElement)?.value.trim().toUpperCase();
        const instituicao = (document.getElementById('instituicaoEnsino') as HTMLInputElement)?.value.trim().toUpperCase();

        if (!titulo || !data) {
          this.toastr.error('Título e ano de conclusão são obrigatórios.');
          return false;
        }

        const jaExiste = this.cursosColaborador!.some(c =>
          c.titulo.trim().toUpperCase() === titulo &&
          c.data?.trim().toUpperCase() === data &&
          c.instituicaoEnsino?.trim().toUpperCase() === instituicao
        );

        if (jaExiste) {
          this.toastr.error("Já existe um curso com essas informações cadastrado");
          return false;
        }

        const novoCurso: CursoColaborador = {
          titulo,
          data,
          cargaHoraria,
          instituicaoEnsino: instituicao,
        };

        return novoCurso;
      }
    ).then(result => {
      if (result.isConfirmed && result.value) {
        this.cursosColaborador.push(result.value);
      }
    });
  }

  excluirCurso(curso: CursoColaborador) {
    showAlert(
      'Remover Curso',
      `Deseja mesmo remover o curso de ${curso.titulo}`,
      'info',
      'primary',
      '<i class="fas fa-user-graduate"></i>',
      true).then(result => {
        if (result.isConfirmed) {
          this.loader.startBackground();
          this.cursosColaborador = this.cursosColaborador.filter(c => !(c.titulo === curso.titulo && c.instituicaoEnsino?.trim().toUpperCase() === curso.instituicaoEnsino?.trim().toUpperCase() && c.data == curso.data));
          this.loader.stopBackground();
        }
      });
  }

  //////////////////////////////////////
  //            Treinamentos          //
  //////////////////////////////////////

  textHtmlAdicionarTreinamento(): string {
    return `
          <div class="row">
            <div class="col-lg-8">
              <div class="form-floating mb-3">
                <input class="form-control text-uppercase" id="treinamento"/>
                <label for="formacao" class="label-required">Treinamento</label>
              </div>
            </div>
            <div class="col-lg-2">
              <div class="form-floating mb-3">
              <input type="date" class="form-control text-uppercase" id="data"/>
              <label for="data" >Data</label>
              </div>
            </div>
            <div class="col-lg-2">
              <div class="form-floating mb-3">
                <input type="number" class="form-control text-uppercase" id="cargaHoraria"/>
                <label for="cargaHoraria" >Carga Horária</label>
              </div>
            </div>
          </div>
          <div class="row">
          <div class="col-lg-6">
              <div class="form-floating mb-3">
                <input class="form-control text-uppercase" id="instrutor"/>
                <label for="instrutor" >Instrutor</label>
              </div>
            </div>
            <div class="col-lg-6">
              <div class="form-floating mb-3">
                <input class="form-control text-uppercase" id="instituicaoEnsino"/>
                <label for="instituicaoEnsino" >Instituição de Ensino</label>
              </div>
            </div>
          </div>`;
  }

  adicionarTreinamento() {
    showAlert(
      'Adicionar Treinamento',
      this.textHtmlAdicionarTreinamento(),
      'info',
      'primary',
      '<i class="fas fa-chalkboard-teacher"></i>',
      true,
      '90vw',
      () => {
        const titulo = (document.getElementById('treinamento') as HTMLInputElement)?.value.trim().toUpperCase();
        const data = (document.getElementById('data') as HTMLInputElement)?.value.trim().toUpperCase();
        const cargaHoraria = (document.getElementById('cargaHoraria') as HTMLInputElement)?.value.trim().toUpperCase();
        const instituicao = (document.getElementById('instituicaoEnsino') as HTMLInputElement)?.value.trim().toUpperCase();
        const instrutor = (document.getElementById('instrutor') as HTMLInputElement)?.value.trim().toUpperCase();



        if (titulo === "") {
          this.toastr.error("O titulo do treinamento não pode ser vazio");
          return false;
        }

        const jaExiste = this.treinamentosColaborador!.some(t =>
          t.titulo === titulo &&
          t.data?.trim().toUpperCase() === data &&
          t.instituicaoEnsino?.trim().toUpperCase() === instituicao &&
          t.cargaHoraria?.trim().toUpperCase() === cargaHoraria &&
          t.instrutor?.trim().toUpperCase() === instrutor
        );

        if (jaExiste) {
          this.toastr.error("Já existe uma formação com essas informações cadastrada");
          return false;
        }

        const novoTreinamento: TreinamentoColaborador = {
          titulo,
          data,
          cargaHoraria,
          instrutor,
          instituicaoEnsino: instituicao
        }

        return novoTreinamento;
      }
    ).then(result => {
      if (result.isConfirmed && result.value) {
        this.loader.startBackground();
        this.treinamentosColaborador!.push(result.value);
        this.loader.stopBackground();
      }
    });
  }

  excluirTreinamento(treinamento: TreinamentoColaborador) {
    showAlert(
      'Remover Treinamento',
      `Deseja mesmo remover o curso de ${treinamento.titulo}`,
      'info',
      'primary',
      '<i class="fas fa-user-graduate"></i>',
      true).then(result => {
        if (result.isConfirmed) {
          this.loader.startBackground();
          this.cursosColaborador = this.treinamentosColaborador.filter(t => !(t.titulo.trim().toUpperCase() === treinamento.titulo &&
            t.instituicaoEnsino?.trim().toUpperCase() === treinamento.instituicaoEnsino?.trim().toUpperCase() &&
            t.data == treinamento.data));
          this.loader.stopBackground();
        }
      });
  }


  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.error("Verifique todos os campos");
      return;
    }
    this.loader.start();

    const formData = this.form.value

    formData.nome = formData.nome.toUpperCase();
    formData.enderecoLogradouro = formData.enderecoLogradouro.toUpperCase();
    formData.enderecoNumero = formData.enderecoNumero.toUpperCase();
    formData.enderecoComplemento = formData.enderecoComplemento.toUpperCase();
    formData.enderecoBairro = formData.enderecoBairro.toUpperCase();
    formData.enderecoUF = formData.enderecoUF.toUpperCase();
    formData.enderecoMunicipio = formData.enderecoMunicipio.toUpperCase();

    if(formData.cargo == "Médico"){
      if(formData.crm == ""){
        this.toastr.error("Falha ao incluir colaborador. Motivo: O crm do médico não pode ser vazio","", {progressBar: true});
      }
    }

    const endereco: Endereco = {
      cep: formData.enderecoCep,
      logradouro: formData.enderecoLogradouro,
      complemento: formData.enderecoComplemento,
      bairro: formData.enderecoBairro,
      localidade: formData.enderecoMunicipio,
      uf: formData.enderecoUF,
      numero: formData.enderecoNumero
    }

    const contato: Contato = {
      email: formData.email,
      telefone1: formData.telefone1,
      telefone2: formData.telefone2
    }

    const colaborador: Colaborador = {
      id: this.colaborador!.id!,
      imagem: this.imagemCortada,
      nome: formData.nome,
      dataNascimento: formData.dataNascimento,
      cpf: formData.cpf,
      identidade: formData.identidade,
      endereco: endereco,
      contato: contato,
      cargoId: this.cargoSelecionado!.id!,
      salario: formData.salario,
      dataInicio: formData.dataInicio,
      dataDemissao: '',
      escolaridade: 'Ensino Superior Incompleto',
      formacoes: this.formacoesColaborador,
      cursos: this.cursosColaborador,
      treinamentos: this.treinamentosColaborador,
      especialidades: this.especialidades
    }

    this.colaboradorService.editar(colaborador).subscribe({
      next: (res: any) => {
        this.toastr.success(res);
        this.buscarColaborador(colaborador.id!);
        this.loader.stop();
      },
      error: (err: any) => {
        this.toastr.error(err);
        this.loader.stop();
      }
    });
  }
}
