import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserServiceService } from '../../../_services/user-service.service';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Autorizacao, User } from '../../../_models/User';
import { forkJoin } from 'rxjs';

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
  ];

  constructor() {
    this.incluirForm = new FormGroup({
      nome: new FormControl('', [Validators.required]),
      usuario: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required]),
      // senha: new FormControl('', [Validators.required]),
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
    if (this.incluirForm.invalid) {
      this.incluirForm.markAllAsTouched();
      return;
    }

    const formData = this.incluirForm.value;

    const usuario: User = {
      nome: formData.nome.toUpperCase(),
      usuario: formData.usuario,
      email: formData.email,
      senha: '#Sounovonovidaplus01',
      tipoUsuario: formData.tipoUsuario,
    }

    let permissoesInserir: Autorizacao[] = [];

    if (formData.admin) {
      permissoesInserir.push({
        funcionalidade: 'admin',
        acesso: 'admin'
      });
    } else {
      const permissoes = this.incluirForm.get('permissoes')?.value;
      permissoesInserir = this.gerarPermissoesAutomatizado(permissoes);
    }

    usuario.autorizacoes = permissoesInserir;

    // Exemplo de log para ver o resultado
    console.log(usuario);


  }

  gerarPermissoesAutomatizado(permissoes: any): Autorizacao[] {
    let permissoesInserir: Autorizacao[] = [];

    for (const grupo in permissoes) {
      if (permissoes.hasOwnProperty(grupo)) {
        const grupoPermissoes = permissoes[grupo];

        if (typeof grupoPermissoes === 'object' && grupoPermissoes !== null) {
          const acessos: string[] = [];

          for (const permissao in grupoPermissoes) {
            if (grupoPermissoes.hasOwnProperty(permissao) && grupoPermissoes[permissao]) {
              acessos.push(permissao);
            }
          }

          if (acessos.length > 0) {
            permissoesInserir.push({
              funcionalidade: grupo,
              acesso: acessos.join(',')
            });
          }
        }
        else if (grupoPermissoes) {
          permissoesInserir.push({ funcionalidade: grupo, acesso: 'visualizar' });
        }
      }
    }

    return permissoesInserir;
  }

}
