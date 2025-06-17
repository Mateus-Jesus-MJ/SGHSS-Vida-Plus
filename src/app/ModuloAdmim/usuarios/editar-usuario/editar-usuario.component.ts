import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Autorizacao, User } from '../../../_models/User';
import { UserServiceService } from '../../../_services/user-service.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment.development';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ColaboradorService } from '../../../_services/colaborador.service';
import { Colaborador } from '../../../_models/colaborador';
import { NgxMaskPipe } from 'ngx-mask';

@Component({
  selector: 'app-editar-usuario',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, NgxMaskPipe],
  templateUrl: './editar-usuario.component.html',
  styleUrl: './editar-usuario.component.scss'
})
export class EditarUsuarioComponent implements OnInit {
  editarform!: FormGroup;
  usuario: User | null = null;
  gruposPermissoes: any[] = [];
  isGrupoPermissoesEmpty = false;
  colaboradores: Colaborador[] = [];

  constructor(private routeAcitive: ActivatedRoute,
    private usuarioService: UserServiceService,
    private router: Router,
    private userService: UserServiceService,
    private toastr: ToastrService,
    private ngxUiLoaderService: NgxUiLoaderService,
    private colaboradorService: ColaboradorService
  ) {
    this.editarform = new FormGroup({
      nome: new FormControl('', [Validators.required]),
      usuario: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required]),
      tipoUsuario: new FormControl('', [Validators.required]),
      tipoUsuarioLabel: new FormControl('', [Validators.required]),
      colaborador: new FormControl(''),
      admin: new FormControl(false),
      permissoes: new FormGroup({})
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
      this.buscarDadosUsuario(id);
    });
  }

  buscarDadosUsuario(id: string) {
    this.usuarioService.buscarUsuarioPorId(id).subscribe(
      (user) => {
        if (user) {
          this.usuario = user;
          this.populateForm(user);
        } else {
          this.toastr.error("Usuário inválido ou não encontrado");
          this.router.navigateByUrl('/admin/usuarios');
          this.ngxUiLoaderService.stop();
        }
      }
    )
  }

  private populateForm(user: User): void {

    switch (user.tipoUsuario) {
      case 'pa':
        this.editarform.get('tipoUsuarioLabel')?.setValue('Profissional de Administração');
        this.gruposPermissoes = environment.MenuAdmin;
        this.isGrupoPermissoesEmpty = true;
        break;
      case 'ps':
        this.editarform.get('tipoUsuarioLabel')?.setValue('Profissional de Saúde');
        this.gruposPermissoes = environment.MenuAtendimento;
        this.isGrupoPermissoesEmpty = true;
        break;
      case 'pc':
        this.editarform.get('tipoUsuarioLabel')?.setValue('Paciente');
        this.gruposPermissoes = [];
        this.isGrupoPermissoesEmpty = false;
        break;
      default:
        this.editarform.get('tipoUsuarioLabel')?.setValue('');
        this.isGrupoPermissoesEmpty = false;
        break;
    }

    this.editarform.patchValue({
      nome: user.nome,
      usuario: user.usuario,
      email: user.email,
      tipoUsuario: user.tipoUsuario,
      admin: user.autorizacoes?.some(autorizacao => autorizacao.funcionalidade === 'admin'),
      permissoes: user.autorizacoes || {},
      colaborador: user.colaborador || ''
    });

    this.colaboradorService.buscarColaboradoresComCargo().subscribe({
      next: (colaboradores: Colaborador[]) => {
        this.colaboradores = colaboradores;
      },
      error: () => {
        this.toastr.error("Erro inesperado ao buscar colaboradores! Tente novamente mais tarde", "", { "progressBar": true })
      }
    });

    this.adicionarPermissoes(user);
  }

  adicionarPermissoes(user: User) {
    const permissoesControl = this.editarform.get('permissoes') as FormGroup;

    Object.keys(permissoesControl.controls).forEach(key => {
      permissoesControl.removeControl(key);
    });

    this.gruposPermissoes = this.gruposPermissoes.filter(
      grupo => grupo.grupo.label.toLowerCase() !== 'admin sistema'
    );

    this.gruposPermissoes.forEach(grupo => {
      let permissoesGrupo = new FormGroup({});
      if (grupo?.grupo?.filhos?.length) {
        grupo.grupo.filhos.forEach((filho: { label: string; rota: string; permissoes: string[] }) => {
          if (filho.permissoes && filho.permissoes.length) {
            permissoesGrupo = new FormGroup({});
            filho.permissoes.forEach(permissao => {
              const temPermissao = user.autorizacoes?.some(autorizacao =>
                autorizacao.funcionalidade == filho.label.toLocaleLowerCase().replace(' ', '') && autorizacao.acesso.split(',').includes(permissao));
              permissoesGrupo.addControl(permissao, new FormControl(temPermissao));
            });
            permissoesControl.addControl(filho.label.replace(' ', '').toLocaleLowerCase(), permissoesGrupo);
          }
        });
      }

      this.isGrupoPermissoesEmpty = true;
      this.ngxUiLoaderService.stop();
    });
  }

  selecionarColaborador(colaborador: Colaborador) {
    this.ngxUiLoaderService.startBackground();

    this.editarform.get("colaborador")?.setValue(colaborador.id);
    this.editarform.get("nome")?.setValue(colaborador.nome);

    this.ngxUiLoaderService.stopBackground();
  }

  submit() {
    this.ngxUiLoaderService.start();
    const formData = this.editarform.value;

    const usuario: User = this.usuario!;

    usuario.nome = formData.nome.toUpperCase();
    usuario.email = formData.email;
    usuario.colaborador = formData.colaborador;

    let permissoesInserir: Autorizacao[] = [];

    if (formData.admin) {
      permissoesInserir.push({
        funcionalidade: 'admin',
        acesso: 'admin'
      });
    } else {
      const permissoes = this.editarform.get('permissoes')?.value;
      permissoesInserir = this.gerarPermissoesAutomatizado(permissoes);
    }

    usuario.autorizacoes = permissoesInserir;

    this.userService.editarUser(usuario).subscribe({
      next: (res: any) => {
        this.toastr.success(res);
        this.buscarDadosUsuario(this.usuario!.id!);
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
