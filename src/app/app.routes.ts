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
            path: 'incluir',
            component: IncluirHospitalComponent,
            data: {
              tipoPermitido: 'pa',
              funcionalidade: 'hospitais',
              acesso: 'incluir'
            }
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
            data:{
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
        path:'meuperfil/:id',
        component: MeuperfilComponent
      },
      {
        path: '**', redirectTo: ''
      }
    ],
  },
  { path: '**', redirectTo: '' }
];
