import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuardService } from './_services/auth-guard.service';
import { CadastroComponent } from './ModuloPaciente/cadastro/cadastro.component';
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
import { ExcluirTurnosComponent } from './ModuloAdmim/turnos/excluir-turnos/excluir-turnos.component';
import { AlasComponent } from './ModuloAdmim/alas/alas.component';
import { IncluirAlaComponent } from './ModuloAdmim/alas/incluir-ala/incluir-ala.component';
import { VisualizarAlaComponent } from './ModuloAdmim/alas/visualizar-ala/visualizar-ala.component';
import { EditarAlaComponent } from './ModuloAdmim/alas/editar-ala/editar-ala.component';
import { TelaSaudeComponent } from './ModuloSaude/tela-saude/tela-saude.component';
import { TelaPacienteComponent } from './ModuloPaciente/tela-paciente/tela-paciente.component';
import { ConsultasComponent } from './ModuloPaciente/consultas/consultas.component';
import { IncluirConsultasPacienteComponent } from './ModuloPaciente/consultas/incluir-consultas-paciente/incluir-consultas-paciente.component';
import { TeleConsultasComponent } from './ModuloSaude/tele-consultas/tele-consultas.component';
import { AtendimentoComponent } from './ModuloSaude/tele-consultas/atendimento/atendimento.component';
import { ProcedimentosComponent } from './ModuloAdmim/procedimentos/procedimentos.component';
import { InlcuirProcedimentosComponent } from './ModuloAdmim/procedimentos/inlcuir-procedimentos/inlcuir-procedimentos.component';


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
        canActivateChild: [AuthGuardService],
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
        path: 'alas',
        component: AlasComponent,
        canActivateChild: [AuthGuardService],
        data: {
          tipoPermitido: 'pa',
          funcionalidade: 'alas',
          acesso: 'visualizar'
        },
        children: [
          {
            path: 'incluir',
            component: IncluirAlaComponent,
            data: {
              tipoPermitido: 'pa',
              funcionalidade: 'alas',
              acesso: 'incluir'
            }
          },
          {
            path: 'visualizar/:id',
            component: VisualizarAlaComponent,
            data: {
              tipoPermitido: 'pa',
              funcionalidade: 'alas',
              acesso: 'visualizar'
            }
          },
          {
            path: 'editar/:id',
            component: EditarAlaComponent,
            data: {
              tipoPermitido: 'pa',
              funcionalidade: 'alas',
              acesso: 'editar'
            }
          },
        ]
      },
      {
        path: 'procedimentos',
        component: ProcedimentosComponent,
        canActivateChild: [AuthGuardService],
        data: {
          tipoPermitido: 'pa',
          funcionalidade: 'procedimentos',
          acesso: 'visualizar'
        },
        children: [
          {
            path: 'incluir',
            component: InlcuirProcedimentosComponent,
            data: {
              tipoPermitido: 'pa',
              funcionalidade: 'alas',
              acesso: 'incluir'
            }
          },
          {
            path: 'visualizar/:id',
            component: VisualizarAlaComponent,
            data: {
              tipoPermitido: 'pa',
              funcionalidade: 'alas',
              acesso: 'visualizar'
            }
          },
          {
            path: 'editar/:id',
            component: EditarAlaComponent,
            data: {
              tipoPermitido: 'pa',
              funcionalidade: 'alas',
              acesso: 'editar'
            }
          },
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
          },
          {
            path: 'excluir',
            component: ExcluirTurnosComponent,
            data: {
              tipoPermitido: 'pa',
              funcionalidade: 'turnos',
              acesso: 'excluir'
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
        path: 'meuperfil/:id',
        component: MeuperfilComponent
      },
      {
        path: '**', redirectTo: ''
      }
    ],
  },
  {
    path: 'atendimento',
    component: TelaSaudeComponent,
    canActivate: [AuthGuardService],
    canActivateChild: [AuthGuardService],
    data: {
      tipoPermitido: 'ps'
    },
    children: [
      {
        path: 'teleconsultas',
        component: TeleConsultasComponent,
        canActivateChild: [AuthGuardService],
        data: {
          tipoPermitido: 'ps',
          funcionalidade: 'teleconsulta',
          acesso: 'visualizar'
        },
        children: [
          {
            path: 'atendimento/:id',
            component: AtendimentoComponent,
            data: {
              tipoPermitido: 'ps',
              funcionalidade: 'teleconsulta',
              acesso: 'atender'
            }
          }
        ]
      },
      {
        path: 'meuperfil/:id',
        component: MeuperfilComponent
      },
    ]
  },
  {
    path: 'paciente',
    component: TelaPacienteComponent,
    canActivate: [AuthGuardService],
    canActivateChild: [AuthGuardService],
    data: {
      tipoPermitido: 'pc'
    },
    children: [
      {
        path: 'consultas',
        component: ConsultasComponent,
        canActivateChild: [AuthGuardService],
        children: [
          {
            path: 'incluir',
            component: IncluirConsultasPacienteComponent
          }
        ]
      },
      {
        path: 'meuperfil/:id',
        component: MeuperfilComponent
      },
    ]
  },
  { path: '**', redirectTo: '' }
];
