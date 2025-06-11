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
    //'atendimento': 'Atendimento', // Atendimento como Home
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


  // private isDynamicParam(segment: string): boolean {
  //     return /^\d+$/.test(segment) || /^[a-f0-9-]{36}$/.test(segment);
  // }

  private isDynamicParam(segment: string): boolean {
    const isNumber = /^\d+$/.test(segment);

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);

    const isMongoId = /^[0-9a-f]{24}$/i.test(segment);

    const isFirestoreId = /^[a-zA-Z0-9_-]{20,24}$/.test(segment);

    return isNumber || isUUID || isMongoId || isFirestoreId;
  }

  private formatSegment(segment: string): string {
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  }
}
