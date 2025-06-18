import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Medicamento } from '../../../_models/medicamento';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MedicamentosService } from '../../../_services/medicamentos.service';
import { CommonModule } from '@angular/common';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-editar-medicamento',
  imports: [RouterModule, FormsModule, CommonModule, ReactiveFormsModule, ImageCropperComponent],
  templateUrl: './editar-medicamento.component.html',
  styleUrl: './editar-medicamento.component.scss'
})
export class EditarMedicamentoComponent implements OnInit {
  form!: FormGroup;
  medicamento!: Medicamento | null;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  originalImage: any = '';
  imagemCortada: any = '';
  formasFarmaceuticas = environment.formasFarmaceuticas;
  viasAdministracao = environment.viasAdministracao


  constructor(
    private routeAcitive: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private loader: NgxUiLoaderService,
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

  ngOnInit(): void {
    this.loader.start();
    this.routeAcitive.paramMap.subscribe(params => {
      const id = params.get('id')!;

      if (id == null || id == "") {
        this.toastr.error("Medicamento não encontrado");
        this.router.navigateByUrl('admin/medicamento');
        this.loader.stop();
        return
      }
      this.buscarMedicamento(id);
    })
  }

  buscarMedicamento(id: string) {
    this.medicamentosService.buscarPorId(id).subscribe(
      (medicamento) => {
        if (medicamento) {
          this.medicamento = medicamento;
          this.populateForm(medicamento);
        } else {
          this.toastr.error("Medicamento não encontrado. Verifique o id informado e tente novamente\n se o problema persistir procure o administrador do sistema", "", { "progressBar": true });
          this.loader.stop();
        }
      }
    )
  }

  populateForm(medicamento: Medicamento) {
    this.form.patchValue({
      ean: medicamento.ean,
      nomeComercial: medicamento.nomeComercial,
      nomeGenerico: medicamento.nomeGenerico,
      formaFarmaceutica: medicamento.formaFarmaceutica,
      dosagem: medicamento.dosagem,
      viaAdministracao: medicamento.viaAdministracao,
      apresentacao: medicamento.apresentacao,
      fabricante: medicamento.fabricante,
      registroAnvisa: medicamento.registroAnvisa,
      tarja: medicamento.tarja,
      controlado: medicamento.controlado,
      status: medicamento.status,
      observacoes: medicamento.observacoes
    });

    this.imagemCortada = medicamento.imagem;
    this.croppedImage = medicamento.imagem;

    this.loader.stop();
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


  submit() {
   if (!this.form.valid) {
      this.form.markAllAsTouched();
      return
    }

    this.loader.start();
    const formData = this.form.value;

    const medicamento: Medicamento = {
      id: this.medicamento?.id,
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
      imagem: this.imagemCortada || null,
    }


    this.medicamentosService.editar(medicamento).subscribe({
      next: (res: any) => {
        this.form.reset();
        this.toastr.success(res);
        this.populateForm(medicamento);
      },
      error: (err: any) => {
        this.toastr.error(err);
        this.loader.stop();
      }
    });
  }
}
