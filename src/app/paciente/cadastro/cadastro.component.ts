import { Component, forwardRef, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, MaxValidator, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Estado, Municipo } from '../../_models/Estado';
import { ConsultaEstadosMunicipiosService } from '../../_services/consulta-estados-municipios.service';
import { ToastrService } from 'ngx-toastr';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { UserServiceService } from '../../_services/user-service.service';
import { User } from '../../_models/User';
import { PacienteService } from '../../_services/paciente.service';
import { Paciente } from '../../_models/Paciente';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, ReactiveFormsModule, NgxMaskDirective],
  providers: [
    provideNgxMask(),
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CadastroComponent),
      multi: true
    }
  ],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.scss'
})
export class CadastroComponent implements OnInit {
  cadastroForm!: FormGroup;
  estados!: Estado[];
  municipios!: Municipo[];
  isEstadoSelect: boolean = false;


  constructor(private consultaEstadoMunicipios: ConsultaEstadosMunicipiosService,
    private pacienteService: PacienteService,
    private userService: UserServiceService,
    private toastr: ToastrService,
    private router: Router) {
    this.cadastroForm = new FormGroup({
      nome: new FormControl('', Validators.required),
      dataNascimento: new FormControl('', Validators.required),
      cpf: new FormControl('', [Validators.required, Validators.minLength(14), Validators.maxLength(14)]),
      identidade: new FormControl(''),
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
      senha: new FormControl('', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)])
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
  }

  validaCPF() {
    const control = this.cadastroForm.get('cpf');
    if (!control) return;

    let cpf = control.value;

    // Remove máscara: pontos e traço
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
      control.setErrors(null); // CPF válido
    } else {
      control.setErrors({ invalidCpf: true }); // CPF inválido
    }
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
    if (this.cadastroForm.invalid) {
      // Marca todos os campos como "tocados" para ativar as mensagens de erro
      this.cadastroForm.markAllAsTouched();
      return;
    }

    const formData = this.cadastroForm.value;

    formData.nome = formData.nome.toUpperCase();
    formData.enderecoLogradouro = formData.enderecoLogradouro.toUpperCase();
    formData.enderecoNumero = formData.enderecoNumero.toUpperCase();
    formData.enderecoComplemento = formData.enderecoComplemento.toUpperCase();
    formData.enderecoBairro = formData.enderecoBairro.toUpperCase();
    formData.enderecoMunicipio = formData.enderecoMunicipio.toUpperCase();
    formData.enderecoUF = formData.enderecoUF.toUpperCase();

    const usuario = new User();
    usuario.nome = formData.nome;
    usuario.usuario = formData.email;
    usuario.email = formData.email;
    usuario.senha = formData.senha;
    usuario.tipoUsuario = 'pc'; 
    usuario.cargo = '';

    const paciente = new Paciente();
    paciente.nome = formData.nome;
    paciente.dataNascimento = formData.dataNascimento;
    paciente.cpf = formData.cpf;
    paciente.identidade = formData.identidade;
    paciente.enderecoCep = formData.enderecoCep;
    paciente.enderecoLogradouro = formData.enderecoLogradouro;
    paciente.enderecoNumero = formData.enderecoNumero;
    paciente.enderecoComplemento = formData.enderecoComplemento;
    paciente.enderecoBairro = formData.enderecoBairro;
    paciente.enderecoUF = formData.enderecoUF;
    paciente.enderecoMunicipio = formData.enderecoMunicipio;
    paciente.email = formData.email;
    paciente.telefone1 = formData.telefone1;
    paciente.telefone2 = formData.telefone2;
    paciente.usuario = usuario;


    this.pacienteService.novoPaciente(paciente).subscribe(
      (response) => {
        this.userService.novouser(usuario).subscribe(
          (response) => {
            this.toastr.success("Cadastro criado com sucesso!")
            this.navigate('');
          },
          (error) => {
            this.toastr.error("Falha ao criar cadastro!")
          });
      },
      (error) => {
        this.toastr.error("Falha ao criar cadastro!")
      });
  }

  navigate(rota: string) {
    this.router.navigateByUrl(`/${rota}`);
  }

}
