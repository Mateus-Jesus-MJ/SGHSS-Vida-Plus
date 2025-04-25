import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserServiceService } from '../../../_services/user-service.service';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Autorizacao } from '../../../_models/User';

@Component({
  selector: 'app-incluir-usuario',
  imports: [FormsModule, CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './incluir-usuario.component.html',
  styleUrl: './incluir-usuario.component.scss'
})
export class IncluirUsuarioComponent {
  incluirForm!: FormGroup;
  gruposPermissoes = [
    { funcionalidade: 'hospitais', permissoes: ['visualizar', 'incluir', 'alterar'] },
    { funcionalidade: 'pacientes', permissoes: ['visualizar', 'incluir', 'alterar'] },
    { funcionalidade: 'quartos', permissoes: ['visualizar', 'incluir', 'alterar'] }
  ];

  constructor() {
    this.incluirForm = new FormGroup({
      nome: new FormControl('', [Validators.required]),
      usuario: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required]),
      senha: new FormControl('', [Validators.required]),
      tipoUsuario: new FormControl('', [Validators.required]),
      admin: new FormControl(false),
      permissoes: new FormGroup({})  // Inicializando o FormGroup de permissões
    });

    // Adiciona as permissões no FormGroup
    this.adicionarPermissoes();
  }

  // Função para adicionar os grupos de permissões dinamicamente ao FormGroup
  adicionarPermissoes() {
    const permissoesControl = this.incluirForm.get('permissoes') as FormGroup;

    // Adiciona dinamicamente os controles para cada funcionalidade
    this.gruposPermissoes.forEach(grupo => {
      const permissoesGrupo = new FormGroup({});

      grupo.permissoes.forEach(permissao => {
        permissoesGrupo.addControl(permissao, new FormControl(false));
      });

      // Aqui, adicionamos o FormGroup para cada funcionalidade como um controle dentro de 'permissoes'
      permissoesControl.addControl(grupo.funcionalidade, permissoesGrupo);
    });
  }


  submit() {
    // if (this.incluirForm.invalid) {
    //   this.incluirForm.markAllAsTouched();
    //   return;
    // }

    const permissoes = this.incluirForm.get('permissoes')?.value;

    // Gerar a lista automatizada de permissões
    const permissoesInserir = this.gerarPermissoesAutomatizado(permissoes);

    // Exemplo de log para ver o resultado
    console.log(permissoesInserir);


  }

  gerarPermissoesAutomatizado(permissoes: any): Autorizacao[] {
    let permissoesInserir: Autorizacao[] = [];

    // Iterar sobre as chaves de 'permissoes' para pegar os grupos
    for (const grupo in permissoes) {
      if (permissoes.hasOwnProperty(grupo)) {
        const grupoPermissoes = permissoes[grupo];

        // Verificar se o grupo é um objeto (com permissões dentro dele)
        if (typeof grupoPermissoes === 'object' && grupoPermissoes !== null) {
          const acessos: string[] = [];

          // Iterar sobre as chaves de permissões dentro do grupo
          for (const permissao in grupoPermissoes) {
            if (grupoPermissoes.hasOwnProperty(permissao) && grupoPermissoes[permissao]) {
              acessos.push(permissao); // Adiciona a permissão ao array
            }
          }

          // Se houver algum acesso, adicione ao array final
          if (acessos.length > 0) {
            permissoesInserir.push({
              funcionalidade: grupo,
              acesso: acessos.join(',') // Junta as permissões com vírgula
            });
          }
        }
        // Se o grupo não for um objeto, apenas verifica se o valor é verdadeiro
        else if (grupoPermissoes) {
          permissoesInserir.push({ funcionalidade: grupo, acesso: 'visualizar' });
        }
      }
    }

    return permissoesInserir;
  }

}
