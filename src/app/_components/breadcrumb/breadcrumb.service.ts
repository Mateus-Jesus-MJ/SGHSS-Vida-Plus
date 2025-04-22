import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  breadcrumbs: { label: string; url: string }[] = [];

  // Mapeamento das rotas específicas para 'home'
  private routeNames: { [key: string]: string } = {
    'admin': 'Administração',      // Admin como Home
    'atendimento': 'Atendimento', // Atendimento como Home
    'paciente': 'Paciente'     // Paciente como Home
  };

  constructor(private router: Router) {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.updateBreadcrumb());
  }

  private updateBreadcrumb() {
    this.breadcrumbs = [];
    let url = '';

    // Dividir a URL da rota em segmentos
    const segments = this.router.url.split('/').filter(segment => segment !== '');

    segments.forEach(segment => {
      url += `/${segment}`;

      // Se o segmento for uma das rotas de 'home', substituímos por 'Home'
      const label = this.routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

      this.breadcrumbs.push({
        label,
        url
      });
    });
  }
}
