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
  ) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    return this.checkAccess(route);
  }

  canActivateChild(route: ActivatedRouteSnapshot): boolean {
    // console.log('AuthGuard chamado para:', route.url.map(x => x.path).join('/'));
    return this.checkAccess(route);
  }

  private checkAccess(route: ActivatedRouteSnapshot): boolean {
    const tipoPermitido = route.data['tipoPermitido'];
    const user = this.authService.getUsuario();
    const tipoUsuario = user?.tipoUsuario;

    if (!this.authService.isAuthenticated()) {
      this.toastr.error('Usuário não autenticado!');
      this.router.navigate(['/']);
      return false;
    }

    if (tipoPermitido && tipoPermitido !== tipoUsuario) {
      this.toastr.warning('Acesso não autorizado!');
      this.navigateGuiaOriginal(user!.tipoUsuario);
      return false;
    }

    const funcionalidade = route.data['funcionalidade'];
    const acessoEsperado = route.data['acesso'];
    const autorizacoesUser = user?.autorizacoes;

    //console.log('Autorizacoes do usuário:', autorizacoesUser);
    //console.log('Rota exige:', funcionalidade, acessoEsperado);

    if (funcionalidade && acessoEsperado) {
      const admin = autorizacoesUser?.some(aut =>
        aut.funcionalidade === 'admin' &&
        aut.acesso?.toLowerCase().includes('admin')
      );

      if (!admin) {
        const autorizado = autorizacoesUser?.some(aut =>
          aut.funcionalidade === funcionalidade &&
          aut.acesso?.toLowerCase().split(',').includes(acessoEsperado.toLowerCase())
        );

        //console.log('Admin:', admin);
        //console.log('Autorizado:', autorizado);

        if (!autorizado) {
          this.toastr.warning('Você não tem permissão para acessar esta funcionalidade!');
          this.navigateGuiaOriginal(user!.tipoUsuario);
          return false;
        }
      }
    }

    return true;
  }


  navigateGuiaOriginal(tipoUsuario: string) {
    switch (tipoUsuario) {
      case 'ps':
        this.router.navigateByUrl('/atendimento');
        break;
      case 'pc':
        this.router.navigateByUrl('/paciente');
        break;
      case 'pa':
        this.router.navigateByUrl('/admin');
        break;
      default:
        this.router.navigateByUrl('/');
        break;
    }
  }
}
