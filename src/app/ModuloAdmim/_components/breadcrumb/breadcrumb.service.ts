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

    const segments = this.router.url.split('/').filter(segment => segment !== '');

    segments.forEach((segment, index) => {
      if (this.isDynamicParam(segment)) {
        return;
      }

      url += `/${segment}`;


      const label = this.routeNames[segment] || this.formatSegment(segment);

      this.breadcrumbs.push({
        label,
        url
      });
    });
  }


  private isDynamicParam(segment: string): boolean {
    return !!segment.match(/^[a-zA-Z0-9_-]{10,}$/);
  }

  private formatSegment(segment: string): string {
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  }
}
