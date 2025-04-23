import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment.development';
import { CommonModule } from '@angular/common';
import { Estado, Municipo } from '../../_models/Estado';
import { ConsultaEstadosMunicipiosService } from '../../_services/consulta-estados-municipios.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.scss'
})
export class CadastroComponent implements OnInit {
  cadastroForm!: FormGroup;
  estados!: Estado[];
  municipios!: Municipo[];
  isEstadoSelect: boolean = false;


  constructor(private consultaEstadoMunicipios: ConsultaEstadosMunicipiosService, private toastr: ToastrService) {
    this.cadastroForm = new FormGroup({
      nome: new FormControl('', Validators.required),
      dataNascimento: new FormControl('', Validators.required),
      cpf: new FormControl('', [Validators.required]),
      identidade: new FormControl('', [Validators.required]),
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
      senha: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }


  ngOnInit(): void {
    this.consultaEstadoMunicipios.buscaEstados().subscribe({
      next: (estados: Estado[] | null) => {
        if (estados != null)
          this.estados = estados;
      },
      error: () => {
        this.toastr.error("Erro ao buscar Estados");
      }
    })

    console.log(this.isEstadoSelect)
  }

  buscarMunicipios(event: Event): void{
    const select = event.target as HTMLInputElement;
    const value = select.value;

    const estadoSelecionado = this.estados.find(estado => estado.sigla === value);

    if(estadoSelecionado != undefined){
      this.consultaEstadoMunicipios.buscaMunicipios(estadoSelecionado).subscribe({
        next: (municipios: Municipo[] | null) => {
          if(municipios != null)
            this.municipios = municipios
        },
        error:() => {
          this.isEstadoSelect = false;      
        }
      })
      this.isEstadoSelect = true;
    }else{
      this.isEstadoSelect = false;
    }
  }

  submit() {

  }

  navigate(rota: string) {

  }

}
