import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { TelaAdminComponent } from './telaInicial/tela-admin/tela-admin.component';
import { AuthGuardService } from './_services/auth-guard.service';
import { CadastroComponent } from './paciente/cadastro/cadastro.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },


  //Rotas do Modulo Paciente
  {path: 'paciente/cadastro', component: CadastroComponent},

  //Rotas do Modulo admin
  { path: 'admin', component: TelaAdminComponent, canActivate: [AuthGuardService]},



  {path: '**', redirectTo: ''}
];
