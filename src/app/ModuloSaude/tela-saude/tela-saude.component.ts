import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../_services/auth.service';
import { filter } from 'rxjs';
import { BreadcrumbComponent } from "../../ModuloAdmim/_components/breadcrumb/breadcrumb.component";
import { TopMobileComponent } from "../../_components/top-mobile/top-mobile.component";

@Component({
  selector: 'app-tela-saude',
  imports: [RouterModule, CommonModule, BreadcrumbComponent, TopMobileComponent],
  templateUrl: './tela-saude.component.html',
  styleUrl: './tela-saude.component.scss'
})
export class TelaSaudeComponent implements OnInit {
nomeUsuario!: string | null;
  idUsuario!: string | null;

 rotaFilhaAtiva = false;

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) {
     this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.rotaFilhaAtiva = this.route.firstChild?.snapshot.routeConfig != null;
      });
   }

  ngOnInit(): void {
    this.nomeUsuario = sessionStorage.getItem("nome");
    this.idUsuario = sessionStorage.getItem("id");
  }


  sair() {
    this.authService.logout();
    this.router.navigateByUrl('./');
  }


  meuPerfil(id: string) {
    this.router.navigate(['/atendimento/meuperfil', id]);
  }
}
