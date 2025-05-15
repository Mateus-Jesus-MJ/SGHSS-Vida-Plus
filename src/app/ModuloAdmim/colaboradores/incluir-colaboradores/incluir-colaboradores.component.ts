import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { Estado, Municipo } from '../../../_models/Estado';
import { ConsultaEstadosMunicipiosService } from '../../../_services/consulta-estados-municipios.service';
import { Cargo } from '../../../_models/cargo';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { CargosService } from '../../../_services/cargos.service';
import { ColaboradorService } from '../../../_services/colaborador.service';
import { Endereco } from '../../../_models/endereco';
import { Contato } from '../../../_models/contato';
import { Colaborador, FormacaoColaborador } from '../../../_models/colaborador';

@Component({
  selector: 'app-incluir-colaboradores',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxMaskDirective, RouterModule, ImageCropperComponent, NgxMaskPipe],
  templateUrl: './incluir-colaboradores.component.html',
  styleUrl: './incluir-colaboradores.component.scss'
})
export class IncluirColaboradoresComponent {
  form!: FormGroup;
  estados!: Estado[];
  municipios!: Municipo[];
  imageChangedEvent: any = '';
  croppedImage: any = '';
  originalImage: any = '';
  imagemCortada: any = '';
  isEstadoSelect: boolean = false;
  cargos!: Cargo[];
  isCargoSelect: boolean = false;
  cargoSelecionado?: Cargo | null;
  formacoesColaborador?: FormacaoColaborador[] | null;

  constructor(
    private consultaEstadoMunicipios: ConsultaEstadosMunicipiosService,
    private loader: NgxUiLoaderService,
    private toastr: ToastrService,
    private cargoService: CargosService,
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
    this.loader.stop();

    if (!this.formacoesColaborador) {
      this.formacoesColaborador = [];
    }

    const formacaoColaborador: FormacaoColaborador = {
      instituicaoEnsino: 'Colegio Publico',
      formacao: 'Ensino Médio',
      anoConclusao: '2017',
      nivelEscolaridade: 'Ensino Médio'
    };

    this.formacoesColaborador.push(formacaoColaborador);
    console.log(this.formacoesColaborador);
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
    this.croppedImage = '';  // Limpa a imagem cortada
    this.imageChangedEvent = '';  // Limpa o evento de imagem
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

  visualizarFormacao(formacao: FormacaoColaborador) {

  }

  editarFormacao(formacao: FormacaoColaborador) {

  }

  excluirFormacao(formacao: FormacaoColaborador) {

  }


  submit() {
    if (this.form.invalid) {
      console.log("enviando");
      this.form.markAllAsTouched();
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
      escolaridade: 'Ensino Superior Incompleto'
    }


    this.colaboradorService.incluir(colaborador).subscribe({
      next: (res: any) => {
        this.form.reset();
        this.toastr.success(res);
        this.imagemCortada = "";
        this.loader.stop();
      },
      error: (err: any) => {
        this.toastr.error(err.message);
        this.loader.stop();
      }
    });
  }
}
