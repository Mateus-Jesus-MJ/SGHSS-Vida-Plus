import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Hospital } from '../../../_models/Hospital';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { HospitalService } from '../../../_services/hospital.service';
import { Estado, Municipo } from '../../../_models/Estado';
import { ConsultaEstadosMunicipiosService } from '../../../_services/consulta-estados-municipios.service';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { NgxMaskDirective } from 'ngx-mask';
import { Endereco } from '../../../_models/endereco';

@Component({
  selector: 'app-editar-hospital',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, ImageCropperComponent, NgxMaskDirective],
  templateUrl: './editar-hospital.component.html',
  styleUrl: './editar-hospital.component.scss'
})
export class EditarHospitalComponent {
  form!: FormGroup;
  hospital!: Hospital;
  imagemHospital: string = "";
  estados!: Estado[];
  municipios!: Municipo[];
  isEstadoSelect: boolean = false;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  originalImage: any = '';
  imagemCortada: any = '';

  constructor(private routeAcitive: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private ngxUiLoaderService: NgxUiLoaderService,
    private hospitalService: HospitalService,
    private consultaEstadoMunicipios: ConsultaEstadosMunicipiosService
  ) {
    this.form = new FormGroup({
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
      imagem: new FormControl('')
    });
  }

  ngOnInit(): void {
    this.ngxUiLoaderService.start();
    this.routeAcitive.paramMap.subscribe(params => {
      const id = params.get('id')!;

      if (id == null || id == "") {
        this.toastr.error("Hospital não encontrado");
        this.router.navigateByUrl('admin/hospitais');
        this.ngxUiLoaderService.stop();
        return
      }
      this.buscarDadosHospital(id);
    });
  }

  buscarDadosHospital(id: string) {
    this.hospitalService.buscarHospitalPorId(id).subscribe(
      (hospital) => {
        if (hospital) {
          this.hospital = hospital;
          this.populateForm(hospital);
        } else {
          this.toastr.error("Hospital não encontrado. Verifique o id informado e tente novamente\n se o problema persistir procure o administrador do sistema", "", { "progressBar": true })
        }
      }
    )
  }

  private populateForm(hospital: Hospital): void {
    this.form.patchValue({
      razaoSocial: hospital.razaoSocial,
      nomeFantasia: hospital.nomeFantasia,
      cnpj: hospital.cnpj,
      enderecoCep: hospital.endereco.cep,
      enderecoLogradouro: hospital.endereco.logradouro,
      enderecoNumero: hospital.endereco.numero,
      enderecoComplemento: hospital.endereco.complemento,
      enderecoBairro: hospital.endereco.bairro,
      enderecoUF: hospital.endereco.uf,
      enderecoMunicipio: hospital.endereco.localidade,
      email: hospital.email,
      telefone1: hospital.telefone1,
      telefone2: hospital.telefone2,
      imagem: hospital.imagem
    });

    this.imagemCortada = hospital.imagem!;

    this.consultaEstadoMunicipios.buscaEstados().subscribe({
      next: (estados: Estado[] | null) => {
        if (estados != null)
          this.estados = estados;
        this.ngxUiLoaderService.stop();
      },
      error: () => {
        this.toastr.error("Erro ao buscar Estados");
        this.router.navigateByUrl('admin/hospitais');
        this.ngxUiLoaderService.stop();
      }
    })
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
    const control = this.form.get('cnpj');
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
          this.form.get('enderecoMunicipio')?.setValue('');
        }
      })
      this.isEstadoSelect = true;
      this.form.get('enderecoMunicipio')?.setValue('');
    } else {
      this.isEstadoSelect = false;
      this.form.get('enderecoMunicipio')?.setValue('');
    }

    this.ngxUiLoaderService.stopBackground();
  }

  buscarCEP(): void {
    this.ngxUiLoaderService.startBackground();
    const cepControl = this.form.get('enderecoCep');
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
          this.form.get('enderecoCep')?.setValue('');
          this.ngxUiLoaderService.stopBackground();
          return;
        }

        const estadoSigla = endereco.uf;

        this.form.patchValue({
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

  submit() {
    this.ngxUiLoaderService.start();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.ngxUiLoaderService.stop();
      return;
    }


    const formData = this.form.value;

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
      id: this.hospital.id,
      cnpj: formData.cnpj,
      razaoSocial: formData.razaoSocial,
      nomeFantasia: formData.nomeFantasia,
      endereco: endereco,
      email: formData.email,
      telefone1: formData.telefone1,
      telefone2: formData.telefone2,
      imagem: this.imagemCortada
    }


    this.hospitalService.editarHospital(hospital).subscribe({
      next: (res: any) => {
        this.buscarDadosHospital(hospital.id!)
        this.toastr.success(res);
      },
      error: (err: any) => {
        this.toastr.error(err);
        this.ngxUiLoaderService.stop();
      }
    });
  }
}
