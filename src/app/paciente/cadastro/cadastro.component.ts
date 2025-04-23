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

  buscarMunicipios(event: Event): void {
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
        }
      })
      this.isEstadoSelect = true;
    } else {
      this.isEstadoSelect = false;
    }
  }

  buscarCEP(): void {
    const cepControl = this.cadastroForm.get('enderecoCep');

    console.log(cepControl);
    const cep = cepControl?.value;

    if (!cep || cep.length < 8) return;

    const cepNumerico = cep.replace(/\D/g, '');

    if (cepNumerico.length !== 8) {
      this.toastr.warning('CEP deve conter 8 dígitos');
      return;
    }

    this.consultaEstadoMunicipios.buscaMunicipioCEP(cepNumerico).subscribe({
      next: (endereco) => {
        if (endereco.erro) {
          this.toastr.warning('CEP não encontrado');
          this.cadastroForm.get('enderecoCep')?.setValue('');
          return;
        }

        const estadoSigla = endereco.uf;

        this.cadastroForm.patchValue({
          enderecoLogradouro: endereco.logradouro || '',
          enderecoBairro: endereco.bairro || '',
          enderecoUF: estadoSigla || '',
          
        });

        this.buscarMunicipiosPorSigla(estadoSigla, endereco.localidade);

        this.toastr.success('Endereço preenchido automaticamente');
      },
      error: (err) => {
        console.error('Erro ao consultar CEP:', err);
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
              this.cadastroForm.patchValue({ enderecoMunicipio: municipioEncontrado.nome });
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

  }

  navigate(rota: string) {

  }

}
