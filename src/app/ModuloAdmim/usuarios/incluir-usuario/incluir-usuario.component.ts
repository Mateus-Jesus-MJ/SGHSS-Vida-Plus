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
  imports: [FormsModule, CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './incluir-usuario.component.html',
  styleUrl: './incluir-usuario.component.scss'
})
export class IncluirUsuarioComponent {
  incluirForm!: FormGroup;
  gruposPermissoes: any[] = [];
  // gruposPermissoes: { funcionalidade: string; permissoes: string[] }[] = [];
  isGrupoPermissoesEmpty = false;

  constructor(private userService: UserServiceService, private ngxUiLoaderService: NgxUiLoaderService, private toastr: ToastrService) {
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
    this.ngxUiLoaderService.startBackground();
    let tipoUsuario = this.incluirForm.get('tipoUsuario')?.value;

    if (tipoUsuario == "pa") {
      this.gruposPermissoes = environment.MenuAdmin;



      this.adicionarPermissoes();
    } else if (tipoUsuario == "ps") {
      this.gruposPermissoes = environment.grupoPermissoesAtendimento;
      this.adicionarPermissoes();
    } else {
      this.isGrupoPermissoesEmpty = false;
      this.ngxUiLoaderService.stopBackground();
    }
  }

  adicionarPermissoes() {
    const permissoesControl = this.incluirForm.get('permissoes') as FormGroup;

    Object.keys(permissoesControl.controls).forEach(key => {
      permissoesControl.removeControl(key);
    });

    this.gruposPermissoes = this.gruposPermissoes.filter(
      grupo => grupo.grupo.label.toLowerCase() !== 'admin sistema'
    );

    this.gruposPermissoes.forEach(grupo => {
      const permissoesGrupo = new FormGroup({});


      if (grupo?.grupo?.filhos?.length) {
        grupo.grupo.filhos.forEach((filho: { label: string; rota: string; permissoes: string[] }) => {
          if (filho.permissoes && filho.permissoes.length) {
            filho.permissoes.forEach(permissao => {
              permissoesGrupo.addControl(permissao, new FormControl(false));
            });
          }
          permissoesControl.addControl(filho.label.replace(' ', '').toLocaleLowerCase(), permissoesGrupo);
        });
      }

      this.isGrupoPermissoesEmpty = true;
      this.ngxUiLoaderService.stopBackground();
    });
  }



  submit() {
    this.ngxUiLoaderService.start();

    if (this.incluirForm.invalid) {
      this.incluirForm.markAllAsTouched();
      this.ngxUiLoaderService.stop();
      return;
    }

    const formData = this.incluirForm.value;

    const usuario: User = {
      nome: formData.nome.toUpperCase(),
      usuario: formData.usuario,
      email: formData.email,
      senha: '#Sounovonovidaplus01',
      tipoUsuario: formData.tipoUsuario,
      status: true,
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
        this.ngxUiLoaderService.stop();
      },
      error: (err: any) => {
        this.toastr.error(err);
        this.ngxUiLoaderService.stop();
      }
    });
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
