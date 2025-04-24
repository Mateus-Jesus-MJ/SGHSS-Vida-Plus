import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../_components/navbar/navbar.component';
import { SidebarComponent } from '../_components/sidebar/sidebar.component';
import { BreadcrumbComponent } from '../_components/breadcrumb/breadcrumb.component';
import { filter } from 'rxjs';


@Component({
  selector: 'app-tela-admin',
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, CommonModule, BreadcrumbComponent],
  templateUrl: './tela-admin.component.html',
  styleUrl: './tela-admin.component.scss'
})
export class TelaAdminComponent {
  rotaFilhaAtiva = false;

  constructor(private router: Router, private route: ActivatedRoute) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.rotaFilhaAtiva = this.route.firstChild?.snapshot.routeConfig != null;
      });
  }
}
