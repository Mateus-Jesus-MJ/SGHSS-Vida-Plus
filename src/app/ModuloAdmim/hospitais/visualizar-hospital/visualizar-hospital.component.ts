import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Hospital } from '../../../_models/Hospital';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { HospitalService } from '../../../_services/hospital.service';

@Component({
  selector: 'app-visualizar-hospital',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './visualizar-hospital.component.html',
  styleUrl: './visualizar-hospital.component.scss'
})
export class VisualizarHospitalComponent implements OnInit {
  form!: FormGroup;
  hospital!: Hospital;
  imagemHospital: string = "";


constructor(private routeAcitive: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private ngxUiLoaderService: NgxUiLoaderService,
    private hospitalService: HospitalService
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
      email: new FormControl('', [Validators.required, Validators.email]),
      telefone1: new FormControl('', [Validators.required]),
      telefone2: new FormControl(''),
      imagem: new FormControl('')
    });
  }

 ngOnInit(): void {
    this.ngxUiLoaderService.start();
    this.routeAcitive.paramMap.subscribe(params => {
      const id = params.get('id')!;

      if (id == null || id == "") {
        this.toastr.error("Usuário inválido ou não encontrado");
        this.router.navigateByUrl('/admin/usuarios');
        return
      }
      this.buscarDadosHospital(id);
    });
  }

  buscarDadosHospital(id: string){
    this.hospitalService.buscarHospitalPorId(id).subscribe(
      (hospital) =>{
        if(hospital){
          this.hospital = hospital;
          this.populateForm(hospital);
        }else{
          this.toastr.error("Hospital não encontrado. Verifique o id informado e tente novamente\n se o problema persistir procure o administrador do sistema","",{"progressBar": true})
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
      telefone1: hospital.telefone1 == ''? '' : '+55 ' + hospital.telefone1,
      telefone2: hospital.telefone2 == ''? '' : '+55 ' + hospital.telefone2,
      imagem: hospital.imagem
    });

    this.imagemHospital = hospital.imagem!;
    this.ngxUiLoaderService.stop();
   }
}
