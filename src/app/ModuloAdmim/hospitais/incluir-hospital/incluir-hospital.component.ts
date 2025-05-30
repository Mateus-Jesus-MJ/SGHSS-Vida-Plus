import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { ConsultaEstadosMunicipiosService } from '../../../_services/consulta-estados-municipios.service';
import { Estado, Municipo } from '../../../_models/Estado';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Hospital } from '../../../_models/Hospital';
import { Endereco } from '../../../_models/endereco';
import { HospitalService } from '../../../_services/hospital.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';


@Component({
  selector: 'app-incluir-hospital',
  imports: [RouterModule, FormsModule, ReactiveFormsModule, NgxMaskDirective, CommonModule, ImageCropperComponent],
  templateUrl: './incluir-hospital.component.html',
  styleUrl: './incluir-hospital.component.scss'
})
export class IncluirHospitalComponent implements OnInit {
  incluirForm!: FormGroup;
  estados!: Estado[];
  municipios!: Municipo[];
  isEstadoSelect: boolean = false;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  originalImage: any = '';
  imagemCortada: any = '';


  constructor(private consultaEstadoMunicipios: ConsultaEstadosMunicipiosService,
    private toastr: ToastrService,
    private hospitalService: HospitalService,
    private router: Router,
    private ngxUiLoaderService: NgxUiLoaderService
  ) {
    this.incluirForm = new FormGroup({
      razaoSocial: new FormControl('', Validators.required),
      nomeFantasia: new FormControl('', Validators.required),
      cnpj: new FormControl('', [Validators.required, Validators.minLength(14), Validators.maxLength(14)]),
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
    });
  }

  ngOnInit(): void {
    this.ngxUiLoaderService.start();
    this.consultaEstadoMunicipios.buscaEstados().subscribe({
      next: (estados: Estado[] | null) => {
        if (estados != null)
          this.estados = estados;
      },
      error: () => {
        this.toastr.error("Erro ao buscar Estados");
      }
    })
    this.ngxUiLoaderService.stop();
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
    this.ngxUiLoaderService.start();
    if (this.croppedImage) {
      this.imagemCortada = this.croppedImage
    }
    this.ngxUiLoaderService.stop();
  }

  resetImage(): void {
    this.croppedImage = '';  // Limpa a imagem cortada
    this.imageChangedEvent = '';  // Limpa o evento de imagem
  }


  validaCNPJ() {
    const control = this.incluirForm.get('cnpj');
    if (!control) return;

    let cnpj = control.value;

    if (!cnpj) return;

    this.ngxUiLoaderService.startBackground();

    const strCNPJ = cnpj.replace(/[^\d]+/g, '');

    if (strCNPJ.length !== 14 || /^(\d)\1+$/.test(strCNPJ)) {
      control.setErrors({ invalidCnpj: true });
      this.ngxUiLoaderService.stopBackground();
      return;
    }

    let tamanho = 12;
    let numeros = strCNPJ.substring(0, tamanho);
    let digitos = strCNPJ.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += Number(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== Number(digitos.charAt(0))) {
      control.setErrors({ invalidCnpj: true });
      this.ngxUiLoaderService.stopBackground();
      return;
    };

    tamanho = 13;
    numeros = strCNPJ.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let k = tamanho; k >= 1; k--) {
      soma += Number(numeros.charAt(tamanho - k)) * pos--;
      if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);

    if (resultado === Number(digitos.charAt(1))) {
      control.setErrors(null);
    } else {
      control.setErrors({ invalidCnpj: true });
    }

    this.ngxUiLoaderService.stopBackground();
  }


  buscarMunicipios(event: Event): void {

    this.ngxUiLoaderService.startBackground();

    const select = event.target as HTMLInputElement;
    const value = select.value;

    const estadoSelecionado = this.estados.find(estado => estado.sigla === value);

    if (estadoSelecionado != undefined) {
      this.consultaEstadoMunicipios.buscaMunicipios(estadoSelecionado).subscribe({
        next: (municipios: Municipo[] | null) => {
          if (municipios != null)
            this.municipios = municipios
        },
        error: () => {
          this.isEstadoSelect = false;
          this.incluirForm.get('enderecoMunicipio')?.setValue('');
        }
      })
      this.isEstadoSelect = true;
      this.incluirForm.get('enderecoMunicipio')?.setValue('');
    } else {
      this.isEstadoSelect = false;
      this.incluirForm.get('enderecoMunicipio')?.setValue('');
    }

    this.ngxUiLoaderService.stopBackground();
  }

  buscarCEP(): void {
    this.ngxUiLoaderService.startBackground();
    const cepControl = this.incluirForm.get('enderecoCep');
    const cep = cepControl?.value;

    if (!cep || cep.length < 8) return;

    const cepNumerico = cep.replace(/\D/g, '');

    if (cepNumerico.length !== 8) {
      this.toastr.warning('CEP deve conter 8 dígitos');
      this.ngxUiLoaderService.stopBackground();
      return;
    }

    this.consultaEstadoMunicipios.buscaMunicipioCEP(cepNumerico).subscribe({
      next: (endereco) => {
        if (endereco.erro) {
          this.toastr.warning('CEP não encontrado');
          this.incluirForm.get('enderecoCep')?.setValue('');
          this.ngxUiLoaderService.stopBackground();
          return;
        }

        const estadoSigla = endereco.uf;

        this.incluirForm.patchValue({
          enderecoLogradouro: endereco.logradouro || '',
          enderecoBairro: endereco.bairro || '',
          enderecoUF: estadoSigla || '',

        });

        this.buscarMunicipiosPorSigla(estadoSigla, endereco.localidade);
      },
      error: (err) => {
        this.toastr.error('Erro ao consultar CEP. Tente novamente.');
      }
    });
    this.ngxUiLoaderService.stopBackground();
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
              this.incluirForm.patchValue({ enderecoMunicipio: municipioEncontrado.nome });
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

  submit() {
    if (this.incluirForm.invalid) {
      this.incluirForm.markAllAsTouched();
      return;
    }

    this.ngxUiLoaderService.start();

    const formData = this.incluirForm.value;

    formData.nomeFantasia = formData.nomeFantasia.toUpperCase();
    formData.razaoSocial = formData.razaoSocial.toUpperCase();
    formData.enderecoNumero = formData.enderecoNumero.toUpperCase();
    formData.enderecoComplemento = formData.enderecoComplemento.toUpperCase();
    formData.enderecoBairro = formData.enderecoBairro.toUpperCase();
    formData.enderecoMunicipio = formData.enderecoMunicipio.toUpperCase();
    formData.enderecoUF = formData.enderecoUF.toUpperCase();

    const endereco: Endereco = {
      cep: formData.enderecoCep,
      logradouro: formData.enderecoLogradouro,
      complemento: formData.enderecoComplemento,
      bairro: formData.enderecoBairro,
      localidade: formData.enderecoMunicipio,
      uf: formData.enderecoUF,
      numero: formData.enderecoNumero
    }

    const hospital: Hospital = {
      cnpj: formData.cnpj,
      razaoSocial: formData.razaoSocial,
      nomeFantasia: formData.nomeFantasia,
      endereco: endereco,
      email: formData.email,
      telefone1: formData.telefone1,
      telefone2: formData.telefone2,
      imagem: this.imagemCortada
    }

    this.hospitalService.novoHospital(hospital).subscribe({
      next: (res: any) => {
        this.incluirForm.reset();
        this.toastr.success(res);
        this.imagemCortada = "";
        this.ngxUiLoaderService.stop();
      },
      error: (err: any) => {
        this.toastr.error(err);
        this.ngxUiLoaderService.stop();
      }
    });
  }
}
