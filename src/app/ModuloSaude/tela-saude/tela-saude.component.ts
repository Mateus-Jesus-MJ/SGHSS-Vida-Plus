import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../_services/auth.service';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { BreadcrumbComponent } from "../../ModuloAdmim/_components/breadcrumb/breadcrumb.component";
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-tela-saude',
  imports: [BreadcrumbComponent, RouterModule, CommonModule],
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

  toggleSidebar() {
    document.body.classList.toggle('sb-sidenav-toggled');
    localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sb-sidenav-toggled').toString());
  }

  meuPerfil(id: string) {
    this.router.navigate(['/profissional-saude/meuperfil', id]);
  }
}
