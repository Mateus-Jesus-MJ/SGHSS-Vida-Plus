import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonModule } from '@angular/common';
import { Medicamento } from '../../../_models/medicamento';
import { MedicamentosService } from '../../../_services/medicamentos.service';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-incluir-medicamento',
  imports: [ReactiveFormsModule, CommonModule, RouterModule, ImageCropperComponent],
  templateUrl: './incluir-medicamento.component.html',
  styleUrl: './incluir-medicamento.component.scss'
})
export class IncluirMedicamentoComponent {
  form!: FormGroup;
  formasFarmaceuticas = environment.formasFarmaceuticas;
  viasAdministracao = environment.viasAdministracao
  imageChangedEvent: any = '';
  croppedImage: any = '';
  originalImage: any = '';
  imagemCortada: any = '';

  constructor(
    private routeAcitive: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private ngxUiLoaderService: NgxUiLoaderService,
    private medicamentosService: MedicamentosService
  ) {
    this.form = new FormGroup({
      ean: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d{13}$/),
        (control) => {
          const ean = control.value;
          if (!ean || ean.length !== 13) return null;

          let soma = 0;
          for (let i = 0; i < 12; i++) {
            const num = +ean[i];
            soma += (i % 2 === 0) ? num : num * 3;
          }

          const digitoCalculado = (10 - (soma % 10)) % 10;
          const digitoInformado = +ean[12];

          return digitoCalculado === digitoInformado ? null : { invalidEAN: true };
        }
      ]),
      nomeComercial: new FormControl('', [Validators.required, Validators.minLength(3)]),
      nomeGenerico: new FormControl('', [Validators.required, Validators.minLength(3)]),
      formaFarmaceutica: new FormControl('', Validators.required),
      dosagem: new FormControl('', Validators.required),
      viaAdministracao: new FormControl('', Validators.required),
      apresentacao: new FormControl('', Validators.required),
      fabricante: new FormControl('', Validators.required),
      registroAnvisa: new FormControl('', [Validators.required, Validators.pattern(/^\d{8,}$/)]),
      tarja: new FormControl('ISENTO', Validators.required),
      controlado: new FormControl('NÃO', Validators.required),
      status: new FormControl('ATIVO', Validators.required),
      observacoes: new FormControl('')
    });
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


  submit() {

    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return
    }

    this.ngxUiLoaderService.start();
    const formData = this.form.value;

    const medicamento: Medicamento = {
      ean: formData.ean.toUpperCase().trim(),
      nomeComercial: formData.nomeComercial.toUpperCase().trim(),
      nomeGenerico: formData.nomeGenerico.toUpperCase().trim(),
      formaFarmaceutica: formData.formaFarmaceutica.toUpperCase(),
      dosagem: formData.dosagem.toUpperCase().trim(),
      viaAdministracao: formData.viaAdministracao.toUpperCase().trim(),
      apresentacao: formData.apresentacao.toUpperCase().trim(),
      fabricante: formData.fabricante.toUpperCase().trim(),
      registroAnvisa: formData.registroAnvisa.toUpperCase().trim(),
      tarja: formData.tarja.toUpperCase().trim(),
      controlado: formData.controlado.toUpperCase().trim(),
      status: formData.status.toUpperCase().trim(),
      observacoes: formData.observacoes.toUpperCase().trim(),
      imagem: this.imagemCortada
    }


    this.medicamentosService.incluir(medicamento).subscribe({
      next: (res: any) => {
        this.form.reset();
        this.toastr.success(res);
        this.imagemCortada = "";
        this.ngxUiLoaderService.stop();
      },
      error: (err: any) => {
        this.toastr.error(err.message);
        this.ngxUiLoaderService.stop();
      }
    });
  }
}
