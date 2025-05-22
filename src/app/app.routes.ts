import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuardService } from './_services/auth-guard.service';
import { CadastroComponent } from './paciente/cadastro/cadastro.component';
import { TelaAdminComponent } from './ModuloAdmim/tela-admin/tela-admin.component';
import { HospitaisComponent } from './ModuloAdmim/hospitais/hospitais.component';
import { IncluirHospitalComponent } from './ModuloAdmim/hospitais/incluir-hospital/incluir-hospital.component';
import { UsuariosComponent } from './ModuloAdmim/usuarios/usuarios.component';
import { IncluirUsuarioComponent } from './ModuloAdmim/usuarios/incluir-usuario/incluir-usuario.component';
import { EditarUsuarioComponent } from './ModuloAdmim/usuarios/editar-usuario/editar-usuario.component';
import { MeuperfilComponent } from './ModuloAdmim/meuperfil/meuperfil.component';
import { EditarHospitalComponent } from './ModuloAdmim/hospitais/editar-hospital/editar-hospital.component';
import { VisualizarHospitalComponent } from './ModuloAdmim/hospitais/visualizar-hospital/visualizar-hospital.component';
import { ColaboradoresComponent } from './ModuloAdmim/colaboradores/colaboradores.component';
import { CargosComponent } from './ModuloAdmim/cargos/cargos.component';
import { CargosIncluirComponent } from './ModuloAdmim/cargos/cargos-incluir/cargos-incluir.component';
import { CargosEditarComponent } from './ModuloAdmim/cargos/cargos-editar/cargos-editar.component';
import { CargosVisualizarComponent } from './ModuloAdmim/cargos/cargos-visualizar/cargos-visualizar.component';
import { IncluirColaboradoresComponent } from './ModuloAdmim/colaboradores/incluir-colaboradores/incluir-colaboradores.component';
import { EditarColaboradoresComponent } from './ModuloAdmim/colaboradores/editar-colaboradores/editar-colaboradores.component';
import { VisualizarColaboradoresComponent } from './ModuloAdmim/colaboradores/visualizar-colaboradores/visualizar-colaboradores.component';
import { TurnosComponent } from './ModuloAdmim/turnos/turnos.component';
import { IncluirTurnosComponent } from './ModuloAdmim/turnos/incluir-turnos/incluir-turnos.component';


export const routes: Routes = [
  { path: '', component: LoginComponent },


  //Rotas do Modulo Paciente
  { path: 'paciente/cadastro', component: CadastroComponent },

  //Rotas do Modulo admin
  {
    path: 'admin',
    component: TelaAdminComponent,
    canActivate: [AuthGuardService],
    canActivateChild: [AuthGuardService],
    data: {
      tipoPermitido: 'pa'
    },
    children: [
      {
        path: 'hospitais',
        component: HospitaisComponent,
        data: {
          tipoPermitido: 'pa',
          funcionalidade: 'hospitais',
          acesso: 'visualizar'
        },
        children: [
          {
            path: 'visualizar/:id',
            component: VisualizarHospitalComponent,
            data: {
              tipoPermitido: 'pa',
              funcionalidade: 'hospitais',
              acesso: 'editar'
            }
          },
          {
            path: 'incluir',
            component: IncluirHospitalComponent,
            data: {
              tipoPermitido: 'pa',
              funcionalidade: 'hospitais',
              acesso: 'incluir'
            }
          },
          {
            path: 'editar/:id',
            component: EditarHospitalComponent,
            data: {
              tipoPermitido: 'pa',
              funcionalidade: 'hospitais',
              acesso: 'editar'
            }
          }
        ]
      },
      {
        path: 'colaboradores',
        component: ColaboradoresComponent,
        data: {
          tipoPermitido: 'pa',
          funcionalidade: 'colaboradores',
          acesso: 'visualizar'
        },
        children: [
          {
            path: 'incluir',
            component: IncluirColaboradoresComponent,
            data: {
              tipoPermitido: 'pa',
              funcionalidade: 'colaboradores',
              acesso: 'incluir'
            }
          },
          {
            path: 'editar/:id',
            component: EditarColaboradoresComponent,
            data: {
              tipoPermitido: 'pa',
              funcionalidade: 'colaboradores',
              acesso: 'editar'
            }
          },
          {
            path: 'visualizar/:id',
            component: VisualizarColaboradoresComponent,
            data: {
              tipoPermitido: 'pa',
              funcionalidade: 'colaboradores',
              acesso: 'visualizar'
            }
          }
        ]
      },
      {
        path: 'cargos',
        component: CargosComponent,
        data: {
          tipoPermitido: 'pa',
          funcionalidade: 'cargos',
          acesso: 'visualizar'
        },
        children: [
          {
            path: 'visualizar/:id',
            component: CargosVisualizarComponent,
            data: {
              tipoPermitido: 'pa',
              funcionalidade: 'cargos',
              acesso: 'incluir'
            },
          },
          {
            path: 'incluir',
            component: CargosIncluirComponent,
            data: {
              tipoPermitido: 'pa',
              funcionalidade: 'cargos',
              acesso: 'incluir'
            },
          },
          {
            path: 'editar/:id',
            component: CargosEditarComponent,
            data: {
              tipoPermitido: 'pa',
              funcionalidade: 'cargos',
              acesso: 'editar'
            },
          },
          {
            path: '**', redirectTo: ''
          }
        ]
      },
      {
        path: 'usuarios',
        component: UsuariosComponent,
        data: {
          tipoPermitido: 'pa',
          funcionalidade: 'admin',
          acesso: 'admin'
        },
        children: [
          {
            path: 'incluir',
            component: IncluirUsuarioComponent,
            data: {
              tipoPermitido: 'pa',
              funcionalidade: 'admin',
              acesso: 'admin'
            }
          },
          {
            path: 'editar/:id',
            component: EditarUsuarioComponent,
            data: {
              tipoPermitido: 'pa',
              funcionalidade: 'admin',
              acesso: 'admin'
            }
          },
          {
            path: '**', redirectTo: ''
          }
        ]
      },
      {
        path: 'turnos',
        component: TurnosComponent,
        data: {
          tipoPermitido: 'pa',
          funcionalidade: 'turnos',
          acesso: 'visualizar'
        },
        children: [
          {
            path: 'incluir',
            component: IncluirTurnosComponent,
            data: {
              tipoPermitido: 'pa',
              funcionalidade: 'turnos',
              acesso: 'incluir'
            }
          }
        ]
      },
      {
        path: 'meuperfil/:id',
        component: MeuperfilComponent
      },
      {
        path: '**', redirectTo: ''
      }
    ],
  },
  { path: '**', redirectTo: '' }
];
