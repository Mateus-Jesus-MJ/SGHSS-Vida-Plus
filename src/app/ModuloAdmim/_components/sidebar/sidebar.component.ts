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


    this.menus.forEach(grupo => {
      grupo.grupo.filhos = grupo.grupo.filhos.filter(filho => {
        const existe = this.user!.autorizacoes!.some(autorizacao =>
          autorizacao.funcionalidade.toLocaleLowerCase().replace(' ', '') === filho.label.toLocaleLowerCase().replace(' ', '')
        );
        return existe;
      });

      if (grupo.grupo.filhos.length === 0) {
              const index = this.menus.indexOf(grupo);
              if (index > -1) {
                this.menus.splice(index, 1);
              }
            }
    });
  }

    // this.user!.autorizacoes?.forEach(autorizacao => {
    //   if (autorizacao.funcionalidade != 'admin') {
    //     this.menus = this.menus.filter(
    //       grupo => grupo.grupo.label.toLowerCase() !== 'admin sistema'
    //     );
    //   }

    //   this.menus.forEach(grupo => {
    //     // Filtra os filhos para garantir que só os permitidos permanecem
    //     grupo.grupo.filhos = grupo.grupo.filhos.filter(filho => {
    //       // Remove espaços extras e compara os valores, normalizando as strings

    //       const normalizedLabel = filho.label.toLowerCase().trim();
    //       const normalizedFuncionalidade = autorizacao.funcionalidade.toLowerCase().trim();



    //       if (normalizedLabel === normalizedFuncionalidade) {
    //         // Atribui as permissões do usuário ao filho
    //         filho.permissoes = autorizacao.acesso.split(',').map(perm => perm.trim());

    //         // Se o usuário não tem permissão para nada, o filho será removido
    //         return autorizacao.acesso.length > 0;
    //       }
    //       return false;
    //     });


    //     // Após filtrar os filhos, verifica se o grupo está vazio
    //     if (grupo.grupo.filhos.length === 0) {
    //       // Remove o grupo caso não tenha mais filhos
    //       const index = this.menus.indexOf(grupo);
    //       if (index > -1) {
    //         this.menus.splice(index, 1);
    //       }
    //     }
    //   });
    // });

  sair() {
    this.authService.logout();
    this.router.navigateByUrl('./');
  }

  meuPerfil(id: string) {
    this.router.navigate(['/admin/meuperfil', id]);
  }
}
