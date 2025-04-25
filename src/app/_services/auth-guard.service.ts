import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate, CanActivateChild {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    return this.checkAccess(route);
  }

  canActivateChild(route: ActivatedRouteSnapshot): boolean {
    return this.checkAccess(route);
  }

  private checkAccess(route: ActivatedRouteSnapshot): boolean {
    const tipoPermitido = route.data['tipoPermitido'];
    const tipoUsuario = this.authService.getTipoUsuario();

    if (!this.authService.isAuthenticated()) {
      this.toastr.error('Usuário não autenticado!');
      this.router.navigate(['/']);
      return false;
    }


    //Atualizar esse metodo aqui
    if (tipoPermitido && tipoPermitido !== tipoUsuario) {
      this.toastr.warning('Acesso não autorizado!');
      this.router.navigate(['/']);
      return false;
    }


    const funcionalidade = route.data['funcionalidade'];




    return true;
  }
}
