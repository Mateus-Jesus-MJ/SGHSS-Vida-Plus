import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuardService } from './_services/auth-guard.service';
import { CadastroComponent } from './paciente/cadastro/cadastro.component';
import { TelaAdminComponent } from './ModuloAdmim/tela-admin/tela-admin.component';
import { HospitaisComponent } from './ModuloAdmim/hospitais/hospitais.component';
import { IncluirHospitalComponent } from './ModuloAdmim/hospitais/incluir-hospital/incluir-hospital.component';

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
    data: { tipoPermitido: 'pa' },
    children: [
      {
        path: 'hospitais',
        component: HospitaisComponent,
        data: { tipoPermitido: 'pa' },
        children: [
          { path: 'incluir',
            component: IncluirHospitalComponent ,
            data: { tipoPermitido: 'pa' }
          }
        ]
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
