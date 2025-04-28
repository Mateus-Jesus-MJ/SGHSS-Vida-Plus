import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserServiceService } from '../../../_services/user-service.service';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Autorizacao, User } from '../../../_models/User';
import { forkJoin, never } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-incluir-usuario',
  imports: [FormsModule, CommonModule, ReactiveFormsModule, RouterModule, NgxUiLoaderModule],
  templateUrl: './incluir-usuario.component.html',
  styleUrl: './incluir-usuario.component.scss'
})
export class IncluirUsuarioComponent {
  incluirForm!: FormGroup;
  gruposPermissoes: { funcionalidade: string; permissoes: string[] }[] = [];
  isGrupoPermissoesEmpty = false;

  constructor(private userService: UserServiceService, private ngxUiLoaderService: NgxUiLoaderService, private toastr : ToastrService) {
    this.incluirForm = new FormGroup({
      nome: new FormControl('', [Validators.required]),
      usuario: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required]),
      tipoUsuario: new FormControl('', [Validators.required]),
      admin: new FormControl(false),
      permissoes: new FormGroup({})
    });
  }


  buscarGrupoPermissoes() {
    let tipoUsuario = this.incluirForm.get('tipoUsuario')?.value;

    if (tipoUsuario == "pa") {
      this.gruposPermissoes = environment.gruposPermissoesAdmin;
      this.isGrupoPermissoesEmpty = true;
    } else if (tipoUsuario == "ps") {
      this.gruposPermissoes = environment.grupoPermissoesAtendimento;
      this.isGrupoPermissoesEmpty = true;
    }else{
      this.isGrupoPermissoesEmpty = false;
    }

    this.adicionarPermissoes();
  }

  adicionarPermissoes() {
    const permissoesControl = this.incluirForm.get('permissoes') as FormGroup;

    Object.keys(permissoesControl.controls).forEach(key => {
      permissoesControl.removeControl(key);
    });

    this.gruposPermissoes.forEach(grupo => {
      const permissoesGrupo = new FormGroup({});

      grupo.permissoes.forEach(permissao => {
        permissoesGrupo.addControl(permissao, new FormControl(false));
      });

      permissoesControl.addControl(grupo.funcionalidade, permissoesGrupo);
    });
  }



  submit() {
    this.ngxUiLoaderService.start();
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

    this.userService.novouser(usuario).subscribe({
      next: (res: any) => {
        this.incluirForm.reset();
        this.toastr.success(res);
      },
      error: (err: any) => {
        this.toastr.error(err);
      }
    });
    this.ngxUiLoaderService.stop();
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
