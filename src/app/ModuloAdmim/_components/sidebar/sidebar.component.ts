import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../_services/auth.service';
import { User } from '../../../_models/User';
import { environment } from '../../../../environments/environment.development';
import { Menu } from '../../../_models/MenuAplicacao';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  user!: User | null;
  nomeUsuario!: string | null;
  MenuHospital: boolean = true;
  isAdmin: boolean = false;


  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.verificaLogin();
    this.verificaPermissoes();
  }

  verificaLogin() {
    this.user = this.authService.getUsuario();

    if (this.user == null) {
      this.authService.logout();
      this.router.navigateByUrl('./');
    }

    this.nomeUsuario = this.user!.nome;
  }

  verificaPermissoes() {
    const permissoes = this.user?.autorizacoes;

    this.isAdmin = this.user?.autorizacoes?.some(aut =>
      aut.funcionalidade === 'admin' &&
      aut.acesso?.toLowerCase().includes('admin')
    )  || false;


    if (!this.isAdmin) {
      this.MenuHospital = permissoes?.some(aut => aut.funcionalidade.toLocaleLowerCase() === 'hospitais') || false;
      console.log(permissoes);
    }

  }

  sair() {
    this.authService.logout();
    this.router.navigateByUrl('./');
  }

  meuPerfil(id: string) {
    this.router.navigate(['/admin/meuperfil', id]);
  }
}
