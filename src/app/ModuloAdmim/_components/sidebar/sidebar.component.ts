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
  permissoes = {
    Hospital: true,
    Cargos: true,
  };
  menus = environment.MenuAdmin;

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
    if (!this.user?.autorizacoes?.some(autorizacao => autorizacao.funcionalidade == "admin")) {
      this.menus.forEach(grupo => {
        grupo.grupo.filhos = grupo.grupo.filhos.filter(filho => {
          const existe = this.user!.autorizacoes!.some(autorizacao =>
            autorizacao.funcionalidade.toLowerCase().replace(/\s/g, '') ===
            filho.label.toLowerCase().replace(/\s/g, '')
          );

          // console.log(`${filho.label}: ${existe}`);
          return existe;
        });
      });
      
      this.menus = this.menus.filter(grupo => grupo.grupo.filhos.length > 0);
      // console.log('Novo Menu:', this.menus);
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
